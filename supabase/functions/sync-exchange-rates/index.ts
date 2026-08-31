import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { parseTcmbForexSellingRates } from "../../../features/exchange-rates/model/tcmb-rates.ts";
import { canCarryForward, isFutureSourceDate } from "../../../features/exchange-rates/model/fx-sync-policy.ts";

const TCMB_URL = "https://www.tcmb.gov.tr/kurlar/today.xml";
const CURRENCIES = ["EUR", "USD", "TRY"] as const;

class ProviderPayloadError extends Error {}

type PreviousRate = {
  business_date: string;
  currency: (typeof CURRENCIES)[number];
  eur_rate: number | string;
  source_rate_date: string;
};

Deno.serve(async (request) => {
  const expectedSecret = Deno.env.get("FX_SYNC_SECRET");
  const suppliedSecret = request.headers.get("x-fx-sync-secret");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!expectedSecret || !supabaseUrl || !serviceRoleKey) {
    return json({ error: "FX sync is not configured" }, 500);
  }
  if (!suppliedSecret || !timingSafeEqual(suppliedSecret, expectedSecret)) {
    return json({ error: "Unauthorized" }, 401);
  }
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const client = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const businessDate = istanbulBusinessDate();

  try {
    const parsed = await fetchCurrentTcmbRates();
    if (isFutureSourceDate(parsed.sourceRateDate, businessDate)) {
      throw new ProviderPayloadError("TCMB source date is after the Istanbul business date");
    }

    const carried = parsed.sourceRateDate < businessDate;
    if (carried && !canCarryForward(parsed.sourceRateDate, businessDate)) {
      throw new ProviderPayloadError("TCMB source rate is older than three business days");
    }

    const result = await applyRates(client, {
      businessDate,
      sourceRateDate: parsed.sourceRateDate,
      rates: parsed.eurRates,
      status: carried ? "carried_forward" : "automatic",
      carriedFromBusinessDate: carried ? parsed.sourceRateDate : null,
    });
    return json({ businessDate, sourceRateDate: parsed.sourceRateDate, ...result });
  } catch (error) {
    if (error instanceof ProviderPayloadError) {
      const message = error.message;
      await recordFailure(client, businessDate, message);
      return json({ businessDate, error: "TCMB response was rejected" }, 502);
    }
    const carry = await latestCarryCandidate(client, businessDate);
    if (carry) {
      const result = await applyRates(client, carry);
      return json({ businessDate, fallback: "carried_forward", ...result });
    }

    const message = error instanceof Error ? error.message : "Unknown FX sync failure";
    await recordFailure(client, businessDate, message);
    return json({ businessDate, error: "FX rates were not updated" }, 502);
  }
});

async function fetchCurrentTcmbRates() {
  const response = await fetch(TCMB_URL, { signal: AbortSignal.timeout(10_000), headers: { accept: "application/xml" } });
  if (!response.ok) throw new Error(`TCMB responded with HTTP ${response.status}`);
  try {
    return parseTcmbForexSellingRates(await response.text());
  } catch (error) {
    throw new ProviderPayloadError(error instanceof Error ? error.message : "TCMB XML could not be parsed");
  }
}

async function applyRates(client: ReturnType<typeof createClient>, input: {
  businessDate: string;
  sourceRateDate: string;
  rates: Record<(typeof CURRENCIES)[number], number>;
  status: "automatic" | "carried_forward";
  carriedFromBusinessDate: string | null;
}) {
  const { data, error } = await client.rpc("apply_automatic_exchange_rates", {
    p_business_date: input.businessDate,
    p_source_rate_date: input.sourceRateDate,
    p_rates: CURRENCIES.map((currency) => ({ currency, eur_rate: input.rates[currency] })),
    p_status: input.status,
    p_carried_from_business_date: input.carriedFromBusinessDate,
    p_fetched_at: new Date().toISOString(),
  });
  if (error) throw new Error(`FX database apply failed: ${error.message}`);
  return data as { updated_rate_count: number; outcome: "success" | "carried_forward" };
}

async function latestCarryCandidate(client: ReturnType<typeof createClient>, businessDate: string) {
  const { data, error } = await client
    .from("exchange_rates")
    .select("business_date, currency, eur_rate, source_rate_date")
    .eq("provider", "TCMB")
    .in("status", ["automatic", "carried_forward"])
    .lt("business_date", businessDate)
    .order("business_date", { ascending: false })
    .limit(30);
  if (error || !data) return null;

  const grouped = new Map<string, PreviousRate[]>();
  for (const row of data as PreviousRate[]) {
    grouped.set(row.business_date, [...(grouped.get(row.business_date) ?? []), row]);
  }

  for (const [carriedFromBusinessDate, rows] of grouped) {
    const byCurrency = new Map(rows.map((row) => [row.currency, row]));
    const sourceRateDate = byCurrency.get("EUR")?.source_rate_date;
    if (!sourceRateDate || !CURRENCIES.every((currency) => byCurrency.has(currency)) || !canCarryForward(sourceRateDate, businessDate)) continue;
    return {
      businessDate,
      sourceRateDate,
      rates: Object.fromEntries(CURRENCIES.map((currency) => [currency, Number(byCurrency.get(currency)!.eur_rate)])) as Record<(typeof CURRENCIES)[number], number>,
      status: "carried_forward" as const,
      carriedFromBusinessDate,
    };
  }
  return null;
}

async function recordFailure(client: ReturnType<typeof createClient>, businessDate: string, message: string) {
  await client.from("exchange_rate_sync_runs").upsert({
    business_date: businessDate,
    outcome: "failed",
    source_rate_date: null,
    attempted_at: new Date().toISOString(),
    completed_at: null,
    updated_rate_count: 0,
    error_code: "TCMB_SYNC_FAILED",
    error_message: message.slice(0, 500),
  }, { onConflict: "business_date" });
}

function istanbulBusinessDate() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((entry) => entry.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return result === 0;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}
