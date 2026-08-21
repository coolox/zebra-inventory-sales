import { createClient } from "@/lib/supabase/client";
import type { ReportPeriod } from "../model/period";
export type CashReportRow = { method: "cash" | "card" | "bank_transfer"; currency: string; count: number; amount: number };
export async function loadCashReport(storeId: string, period: ReportPeriod): Promise<CashReportRow[]> { const { data,error }=await createClient().rpc("owner_cash_report",{p_store_id:storeId,p_from:period.from,p_to:period.to}); if(error) throw error; return (data??[]).map((row:{payment_method:CashReportRow["method"];currency:string;payment_count:number;amount:number})=>({method:row.payment_method,currency:row.currency,count:Number(row.payment_count),amount:Number(row.amount)})); }
