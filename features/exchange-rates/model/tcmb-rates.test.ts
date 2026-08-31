import { describe, expect, it } from "vitest";
import { parseTcmbForexSellingRates } from "./tcmb-rates";

const validTcmbXml = `<?xml version="1.0" encoding="UTF-8"?>
<Tarih_Date Tarih="30.08.2026" Date="30.08.2026" Bulten_No="2026/165">
  <Currency CrossOrder="1" Kod="USD" CurrencyCode="USD">
    <Unit>1</Unit><ForexBuying>40.0000</ForexBuying><ForexSelling>40.2500</ForexSelling>
  </Currency>
  <Currency CrossOrder="8" Kod="EUR" CurrencyCode="EUR">
    <Unit>1</Unit><ForexBuying>46,0000</ForexBuying><ForexSelling>46,5000</ForexSelling>
  </Currency>
</Tarih_Date>`;

describe("parseTcmbForexSellingRates", () => {
  it("normalizes TCMB Döviz Satış EUR/USD values to the EUR-base storage contract", () => {
    expect(parseTcmbForexSellingRates(validTcmbXml)).toEqual({
      provider: "TCMB",
      rateBasis: "forex_selling",
      sourceRateDate: "2026-08-30",
      eurRates: {
        EUR: 1,
        TRY: 1 / 46.5,
        USD: 40.25 / 46.5,
      },
    });
  });

  it("accepts TCMB's slash-separated month/day/year Date attribute", () => {
    expect(parseTcmbForexSellingRates(validTcmbXml.replace('Date="30.08.2026"', 'Date="09/01/2026"')).sourceRateDate).toBe("2026-09-01");
  });

  it.each([
    ["empty response", ""],
    ["missing required currency", validTcmbXml.replace(/<Currency CrossOrder="1"[\s\S]*?<\/Currency>/, "")],
    ["missing sale value", validTcmbXml.replace("<ForexSelling>40.2500</ForexSelling>", "")],
    ["unclosed root", validTcmbXml.replace("</Tarih_Date>", "")],
    ["invalid source date", validTcmbXml.replace('Date="30.08.2026"', 'Date="31.02.2026"')],
    ["duplicate required currency", validTcmbXml.replace("</Tarih_Date>", '<Currency CurrencyCode="USD"><ForexSelling>40.5000</ForexSelling></Currency></Tarih_Date>')],
    ["unsafe entity declaration", validTcmbXml.replace("<Tarih_Date", "<!DOCTYPE x [<!ENTITY x SYSTEM 'file:///secret'>]><Tarih_Date")],
  ])("rejects %s", (_name, xml) => {
    expect(() => parseTcmbForexSellingRates(xml)).toThrow();
  });
});
