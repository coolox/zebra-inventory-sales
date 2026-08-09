"use client";

import { LogOut, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AccessDeniedPage() {
  const signOut = async () => {
    await createClient().auth.signOut();
    window.location.assign("/login");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 text-zinc-100">
      <section className="w-full max-w-md rounded-3xl border border-zinc-800 bg-[#111114] p-7 shadow-2xl sm:p-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-300"><ShieldAlert size={22} /></div>
        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">Zebra Retail</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Access not assigned</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500">This account has no active store membership. Ask a Zebra Boutique Owner to invite you, or sign in with another work email.</p>
        <button type="button" onClick={signOut} className="mt-7 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:text-white"><LogOut size={16} />Sign out</button>
      </section>
    </main>
  );
}
