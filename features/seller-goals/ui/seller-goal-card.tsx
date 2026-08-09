"use client";

import { Check, Pencil, Target } from "lucide-react";
import { useEffect, useState } from "react";
import type { Period } from "@/lib/types";

const defaults: Record<Period, number> = { day: 800, week: 5000, month: 20000, year: 240000 };
const labels: Record<Period, string> = { day: "Daily", week: "Weekly", month: "Monthly", year: "Yearly" };

export function SellerGoalCard({ actual, period }: { actual: number; period: Period }) {
  const [goals, setGoals] = useState(defaults);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("zebra-seller-goals");
    if (saved) {
      try { setGoals({ ...defaults, ...JSON.parse(saved) }); } catch { /* ignore invalid demo state */ }
    }
  }, []);

  const goal = goals[period];
  const progress = Math.min(100, Math.round((actual / Math.max(goal, 1)) * 100));

  const startEditing = () => { setDraft(String(goal)); setEditing(true); };
  const save = () => {
    const nextValue = Number(draft);
    if (!nextValue || nextValue < 1) return;
    const next = { ...goals, [period]: nextValue };
    setGoals(next);
    window.localStorage.setItem("zebra-seller-goals", JSON.stringify(next));
    setEditing(false);
  };

  return (
    <article id="goal" className="panel scroll-mt-24 rounded-2xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold">My goal</p><p className="mt-1 text-xs text-zinc-600">{labels[period]} revenue target</p></div><button type="button" onClick={startEditing} className="flex h-9 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-[10px] font-semibold text-zinc-400 hover:border-violet-500/40 hover:text-violet-300"><Pencil size={13} /> Edit</button></div>

      {editing ? <div className="fade-up mt-5 rounded-xl border border-violet-500/25 bg-violet-500/[0.06] p-4"><label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{labels[period]} goal, EUR</label><div className="mt-2 flex gap-2"><input type="number" min="1" value={draft} onChange={(event) => setDraft(event.target.value)} className="h-10 min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-violet-500" autoFocus /><button type="button" onClick={save} className="flex h-10 items-center gap-1.5 rounded-lg bg-violet-600 px-3 text-xs font-semibold text-white"><Check size={14} /> Save</button></div></div> : <div className="mt-6"><div className="flex items-end justify-between gap-3"><div><p className="text-2xl font-semibold tracking-tight text-zinc-100">€{actual.toLocaleString("en-US")}</p><p className="mt-1 text-[10px] text-zinc-600">of €{goal.toLocaleString("en-US")}</p></div><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-400"><Target size={18} /></span></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-800"><div className="h-full rounded-full bg-violet-500 transition-all duration-500" style={{ width: `${progress}%` }} /></div><div className="mt-2 flex justify-between text-[10px]"><span className="text-zinc-600">Progress</span><span className="font-semibold text-violet-400">{progress}%</span></div></div>}
    </article>
  );
}
