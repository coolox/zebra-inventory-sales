import type { PaymentRateMap } from "@/features/sales/model/payments";
import { saleCurrencies } from "@/features/sales/model/types";
import { createClient } from "@/lib/supabase/client";

function todayInIstanbul() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export async function loadPaymentRates(): Promise<PaymentRateMap> {
  const { data, error } = await createClient()
    .from("exchange_rates")
    .select("currency, eur_rate")
    .eq("business_date", todayInIstanbul());
  if (error) throw error;

  const rates: PaymentRateMap = Object.fromEntries(saleCurrencies.map((currency) => [currency, currency === "EUR" ? 1 : null])) as PaymentRateMap;
  (data ?? []).forEach((row) => {
    const currency = row.currency as keyof PaymentRateMap;
    if (currency in rates) rates[currency] = Number(row.eur_rate);
  });
  return rates;
}

