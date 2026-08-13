"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useDialogFocus } from "@/components/ui/use-dialog-focus";

export function DashboardShell({ nav, mobileOpen, onMobileClose, mobileNavLabel = "Workspace navigation", children }: { nav: ReactNode; mobileOpen: boolean; onMobileClose: () => void; mobileNavLabel?: string; children: ReactNode }) {
  const mobileNavRef = useRef<HTMLElement>(null);
  useDialogFocus(mobileOpen, mobileNavRef);
  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onMobileClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen, onMobileClose]);
  return <div className="min-h-screen bg-transparent text-zinc-100">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[224px] flex-col border-r border-zinc-800/80 bg-[#0d0d10] lg:flex">{nav}</aside>
    {mobileOpen && <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={onMobileClose}><aside ref={mobileNavRef} role="dialog" aria-modal="true" aria-label={mobileNavLabel} tabIndex={-1} className="flex h-full w-[270px] flex-col border-r border-zinc-800 bg-[#0d0d10]" onClick={(event) => event.stopPropagation()}>{nav}</aside></div>}
    <div className="lg:pl-[224px]">{children}</div>
  </div>;
}
