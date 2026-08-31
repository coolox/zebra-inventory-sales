"use client";

import { LogOut, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { logoutAndRedirect } from "@/lib/auth/logout";
import { authCopy, persistLocale, readStoredLocale, type Locale } from "@/lib/i18n";

export default function AccessDeniedPage() {
  const [locale, setLocale] = useState<Locale>("en");
  const [signingOut, setSigningOut] = useState(false);
  useEffect(() => { const next = readStoredLocale(); setLocale(next); persistLocale(next); }, []);
  const text = authCopy[locale];
  const changeLocale = (next: Locale) => { setLocale(next); persistLocale(next); };
  const signOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    await logoutAndRedirect();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 text-zinc-100">
      <section className="w-full max-w-md rounded-3xl border border-zinc-800 bg-[#111114] p-7 shadow-2xl sm:p-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-300"><ShieldAlert size={22} /></div>
        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">Zebra Retail</p>
        <div className="mt-5 flex items-center justify-between gap-3"><h1 className="text-2xl font-semibold tracking-tight">{text.accessDenied}</h1><div aria-label={text.language} className="flex rounded-lg border border-zinc-800 p-0.5 text-[10px]"><button type="button" onClick={() => changeLocale("en")} className={`rounded-md px-2 py-1 ${locale === "en" ? "bg-zinc-800 text-white" : "text-zinc-500"}`}>EN</button><button type="button" onClick={() => changeLocale("tr")} className={`rounded-md px-2 py-1 ${locale === "tr" ? "bg-zinc-800 text-white" : "text-zinc-500"}`}>TR</button></div></div>
        <p className="mt-3 text-sm leading-6 text-zinc-500">{text.accessDescription}</p>
        <button type="button" onClick={signOut} disabled={signingOut} aria-busy={signingOut} className="mt-7 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:text-white disabled:cursor-wait disabled:opacity-50"><LogOut size={16} className={signingOut ? "animate-pulse" : undefined} />{signingOut ? text.signingOut : text.signOut}</button>
      </section>
    </main>
  );
}
