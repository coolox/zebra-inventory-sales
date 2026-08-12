import type { ReactNode } from "react";

export function DashboardShell({ nav, mobileOpen, onMobileClose, children }: { nav: ReactNode; mobileOpen: boolean; onMobileClose: () => void; children: ReactNode }) {
  return <div className="min-h-screen bg-transparent text-zinc-100">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[224px] flex-col border-r border-zinc-800/80 bg-[#0d0d10] lg:flex">{nav}</aside>
    {mobileOpen && <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={onMobileClose}><aside className="flex h-full w-[270px] flex-col border-r border-zinc-800 bg-[#0d0d10]" onClick={(event) => event.stopPropagation()}>{nav}</aside></div>}
    <div className="lg:pl-[224px]">{children}</div>
  </div>;
}
