"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { useDialogFocus } from "@/components/ui/use-dialog-focus";

export function Modal({ title, eyebrow, onClose, children, wide = false, closeLabel }: { title: string; eyebrow: string; onClose: () => void; children: ReactNode; wide?: boolean; closeLabel?: string }) {
  const resolvedCloseLabel = closeLabel ?? (typeof document !== "undefined" && document.documentElement.lang === "tr" ? "Kapat" : "Close");
  const dialogRef = useRef<HTMLElement>(null);
  useDialogFocus(true, dialogRef);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={onClose}>
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} className={`fade-up max-h-[94vh] w-full overflow-y-auto rounded-t-[1.5rem] border border-zinc-800 bg-[#111114] shadow-2xl sm:rounded-[1.5rem] ${wide ? "max-w-3xl" : "max-w-xl"}`} onMouseDown={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-zinc-800/80 bg-[#111114]/95 px-5 py-5 backdrop-blur sm:px-7"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">{eyebrow}</p><h2 className="mt-1 text-xl font-semibold tracking-tight">{title}</h2></div><button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-500 transition hover:border-zinc-700 hover:text-white" aria-label={resolvedCloseLabel}><X size={18} /></button></div>
        {children}
      </section>
    </div>
  );
}
