export type AutomaticRateCurrency = "EUR" | "TRY" | "USD";

export type TcmbDailyRates = {
  provider: "TCMB";
  rateBasis: "forex_selling";
  sourceRateDate: string;
  eurRates: Record<AutomaticRateCurrency, number>;
};

const REQUIRED_CURRENCIES = ["EUR", "USD"] as const;
const TCMB_DATE_PATTERN = /^(\d{2})[./-](\d{2})[./-](\d{4})$/;
const MAX_TRY_PER_CURRENCY = 10_000;

export function parseTcmbForexSellingRates(xml: string): TcmbDailyRates {
  if (!xml.trim()) {
    throw new Error("TCMB response is empty");
  }

  if (/<!\s*(?:doctype|entity)\b/i.test(xml)) {
    throw new Error("TCMB response must not contain XML entities");
  }

  const rootMatch = xml.match(/<Tarih_Date\b([^>]*)>/i);
  if (!rootMatch || !/<\/Tarih_Date\s*>/i.test(xml)) {
    throw new Error("TCMB response is missing Tarih_Date root");
  }

  const sourceRateDate = parseTcmbDate(readAttribute(rootMatch[1], "Date"));
  const tryPerCurrency = new Map<string, number>();
  const currencies = xml.matchAll(/<Currency\b([^>]*)>([\s\S]*?)<\/Currency\s*>/gi);

  for (const currency of currencies) {
    const code = readAttribute(currency[1], "CurrencyCode");
    if (!code || !REQUIRED_CURRENCIES.includes(code as (typeof REQUIRED_CURRENCIES)[number])) {
      continue;
    }

    if (tryPerCurrency.has(code)) {
      throw new Error(`TCMB response contains duplicate ${code} currency`);
    }

    const sellingRate = readElementText(currency[2], "ForexSelling");
    tryPerCurrency.set(code, parsePositiveDecimal(sellingRate, `${code} ForexSelling`));
  }

  for (const currency of REQUIRED_CURRENCIES) {
    if (!tryPerCurrency.has(currency)) {
      throw new Error(`TCMB response is missing ${currency} ForexSelling`);
    }
  }

  const tryPerEur = tryPerCurrency.get("EUR")!;
  const tryPerUsd = tryPerCurrency.get("USD")!;
  const usdPerEur = tryPerUsd / tryPerEur;
  const tryPerEurBase = 1 / tryPerEur;

  if (!Number.isFinite(usdPerEur) || usdPerEur <= 0 || !Number.isFinite(tryPerEurBase) || tryPerEurBase <= 0) {
    throw new Error("TCMB response produces invalid EUR cross-rates");
  }

  return {
    provider: "TCMB",
    rateBasis: "forex_selling",
    sourceRateDate,
    eurRates: {
      EUR: 1,
      TRY: tryPerEurBase,
      USD: usdPerEur,
    },
  };
}

function readAttribute(attributes: string, attribute: string) {
  const match = attributes.match(new RegExp(`\\b${attribute}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  return match?.[2]?.trim() ?? "";
}

function readElementText(xml: string, element: string) {
  const match = xml.match(new RegExp(`<${element}\\b[^>]*>\\s*([^<]+?)\\s*</${element}\\s*>`, "i"));
  return match?.[1]?.trim() ?? "";
}

function parseTcmbDate(value: string) {
  const match = value.match(TCMB_DATE_PATTERN);
  if (!match) {
    throw new Error("TCMB response contains an invalid Date attribute");
  }

  const [, first, second, year] = match;
  const slashSeparated = value.includes("/");
  const day = slashSeparated ? second : first;
  const month = slashSeparated ? first : second;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  const isoDate = date.toISOString().slice(0, 10);

  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    throw new Error("TCMB response contains an impossible Date attribute");
  }

  return isoDate;
}

function parsePositiveDecimal(value: string, field: string) {
  if (!/^\d+(?:[,.]\d+)?$/.test(value)) {
    throw new Error(`TCMB response contains an invalid ${field}`);
  }

  const parsed = Number(value.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > MAX_TRY_PER_CURRENCY) {
    throw new Error(`TCMB response contains an implausible ${field}`);
  }

  return parsed;
}
