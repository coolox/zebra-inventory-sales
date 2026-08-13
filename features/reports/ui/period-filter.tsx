import { useEffect, useState } from "react";
import { reportPeriod, toReportPeriodQuery, type ReportPeriod, type ReportPeriodPreset } from "../model/period";

type Labels = Record<Exclude<ReportPeriodPreset, "custom">, string> & { custom: string; from: string; to: string; apply: string; invalid: string };

export function PeriodFilter({ value, onChange, labels, now = new Date() }: { value: ReportPeriod; onChange: (value: ReportPeriod) => void; labels: Labels; now?: Date }) {
  const [from, setFrom] = useState(value.from);
  const [to, setTo] = useState(value.to);
  const [error, setError] = useState("");
  useEffect(() => { setFrom(value.from); setTo(value.to); setError(""); }, [value]);
  const selectPreset = (preset: Exclude<ReportPeriodPreset, "custom">) => onChange(reportPeriod(preset, now));
  const applyCustom = () => {
    const next: ReportPeriod = { preset: "custom", from, to };
    try { toReportPeriodQuery(next); setError(""); onChange(next); } catch { setError(labels.invalid); }
  };
  return <div className="flex flex-wrap items-end gap-2" aria-label="Report period">
    <div className="flex rounded-lg border border-zinc-800 bg-zinc-900/70 p-0.5">
      {(["today", "week", "month", "year"] as const).map((preset) => <button key={preset} type="button" onClick={() => selectPreset(preset)} className={`rounded-md px-3 py-1.5 text-[11px] font-medium transition ${value.preset === preset ? "bg-zinc-700/80 text-zinc-100" : "text-zinc-600 hover:text-zinc-300"}`}>{labels[preset]}</button>)}
      <button type="button" onClick={() => onChange({ preset: "custom", from, to })} className={`rounded-md px-3 py-1.5 text-[11px] font-medium transition ${value.preset === "custom" ? "bg-zinc-700/80 text-zinc-100" : "text-zinc-600 hover:text-zinc-300"}`}>{labels.custom}</button>
    </div>
    {value.preset === "custom" && <div className="flex flex-wrap items-end gap-2"><label className="text-[10px] text-zinc-500">{labels.from}<input aria-label={labels.from} type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="ml-1 h-8 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-xs text-zinc-200" /></label><label className="text-[10px] text-zinc-500">{labels.to}<input aria-label={labels.to} type="date" value={to} onChange={(event) => setTo(event.target.value)} className="ml-1 h-8 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-xs text-zinc-200" /></label><button type="button" onClick={applyCustom} className="h-8 rounded-md border border-violet-500/40 px-3 text-xs font-semibold text-violet-200">{labels.apply}</button></div>}
    {error && <p role="alert" className="w-full text-xs text-red-300">{error}</p>}
  </div>;
}
