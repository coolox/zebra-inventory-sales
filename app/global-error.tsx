"use client";

import { useEffect } from "react";
import { reportClientFailure } from "@/lib/observability/client";

export default function GlobalError({ error, reset }: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  useEffect(() => {
    reportClientFailure({ operation: "ui.global_error", error, correlationId: error.digest });
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
        <main className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">Zebra Retail</p>
          <h1 className="mt-3 text-xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-zinc-400">Try again, or contact the Owner if the issue continues.</p>
          <button type="button" onClick={reset} className="mt-5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white">Try again</button>
        </main>
      </body>
    </html>
  );
}
