"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Mail, ShieldCheck } from "lucide-react";
import { isLiveMode } from "@/features/workspace/model/app-mode";
import { createClient } from "@/lib/supabase/client";
import { authCopy, persistLocale, readStoredLocale, type Locale } from "@/lib/i18n";
import { reportClientFailure } from "@/lib/observability/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [locale, setLocale] = useState<Locale>("en");
  const configured = isLiveMode && Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  useEffect(() => {
    const nextLocale = readStoredLocale();
    setLocale(nextLocale);
    persistLocale(nextLocale);
    const error = new URLSearchParams(window.location.search).get("error");
    if (error === "missing_code" || error === "invalid_link") {
      setState("error");
      setMessage(authCopy[nextLocale][error === "missing_code" ? "missingCode" : "invalidLink"]);
    }
  }, []);

  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setTimeout(() => setCooldown((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const text = authCopy[locale];
  const changeLocale = (nextLocale: Locale) => { setLocale(nextLocale); persistLocale(nextLocale); };

  const sendMagicLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!configured || state === "sending") return;

    setState("sending");
    setMessage("");

    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback?locale=${locale}`,
      },
    });

    if (error) {
      reportClientFailure({ operation: "auth.magic_link", error, context: { locale } });
      setState("error");
      if (error.status === 429 || error.code === "over_email_send_rate_limit" || error.code === "over_request_rate_limit") {
        setCooldown(60);
        setMessage(text.rateLimited);
        return;
      }
      setMessage(text.sendFailed);
      return;
    }

    setState("sent");
    setMessage(text.sent);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 py-8 text-zinc-100">
      <section className="w-full max-w-md overflow-hidden rounded-3xl border border-zinc-800 bg-[#111114] shadow-2xl">
        <div className="border-b border-zinc-800/80 px-6 py-7 sm:px-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-sm font-black tracking-tighter text-white shadow-[0_0_32px_rgba(124,58,237,.35)]">ZB</div>
          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">Zebra Retail</p>
          <div className="mt-5 flex items-center justify-between gap-3"><h1 className="text-2xl font-semibold tracking-tight text-zinc-50">{text.signIn}</h1><div aria-label={text.language} className="flex rounded-lg border border-zinc-800 p-0.5 text-[10px]"><button type="button" onClick={() => changeLocale("en")} className={`rounded-md px-2 py-1 ${locale === "en" ? "bg-zinc-800 text-white" : "text-zinc-500"}`}>EN</button><button type="button" onClick={() => changeLocale("tr")} className={`rounded-md px-2 py-1 ${locale === "tr" ? "bg-zinc-800 text-white" : "text-zinc-500"}`}>TR</button></div></div>
          <p className="mt-2 text-sm leading-6 text-zinc-500">{text.signInDescription}</p>
        </div>

        <form className="px-6 py-7 sm:px-8" onSubmit={sendMagicLink}>
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{text.workEmail}</span>
            <div className="relative mt-2">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={17} />
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={text.emailPlaceholder}
                className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
              />
            </div>
          </label>

          {!configured && <p className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-3 text-xs leading-5 text-amber-200">{text.unconfigured}</p>}
          {message && <p className={`mt-4 rounded-xl border px-3 py-3 text-xs leading-5 ${state === "error" ? "border-red-500/20 bg-red-500/10 text-red-200" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"}`}>{state === "sent" && <CheckCircle2 className="mr-2 inline-block align-text-bottom" size={15} />}{message}</p>}

          <button disabled={!configured || state === "sending" || state === "sent" || cooldown > 0} type="submit" className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-45">
            {state === "sending" ? text.sending : state === "sent" ? text.sentButton : cooldown > 0 ? `${text.tryAgain} ${cooldown}s` : <>{text.send} <ArrowRight size={17} /></>}
          </button>

          <div className="mt-5 flex gap-2 text-[11px] leading-5 text-zinc-600"><ShieldCheck className="mt-0.5 shrink-0 text-zinc-500" size={15} />{text.invitedOnly}</div>
        </form>
      </section>
    </main>
  );
}
