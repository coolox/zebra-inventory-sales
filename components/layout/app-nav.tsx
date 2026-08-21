import { X, type LucideIcon } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

export type AppNavItem = { id: string; label: string; Icon: LucideIcon };
type Props = { items: AppNavItem[]; workspaceLabel: string; pilotStoreLabel: string; retailSystemLabel: string; storeLabel: string; storeMeta: string; profile: ReactNode; onNavigate: (id: string) => void; onClose: () => void; closeLabel: string };

export function AppNav({ items, workspaceLabel, pilotStoreLabel, retailSystemLabel, storeLabel, storeMeta, profile, onNavigate, onClose, closeLabel }: Props) {
  return <>
    <div className="flex h-[72px] items-center gap-3 border-b border-zinc-800/80 px-5"><Image src="/icons/zebra-192.png" alt="Zebra Boutique" width={36} height={36} className="h-9 w-9 rounded-lg object-cover" priority /><div><p className="text-sm font-bold tracking-[0.14em] text-zinc-100">ZEBRA BOUTIQUE</p><p className="text-[9px] uppercase tracking-[0.18em] text-zinc-600">{retailSystemLabel}</p></div><button type="button" onClick={onClose} className="ml-auto text-zinc-500 lg:hidden" aria-label={closeLabel}><X size={20} /></button></div>
    <nav className="flex flex-1 flex-col px-3 py-5"><p className="px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-600">{workspaceLabel}</p><div className="mt-3 space-y-1">{items.map(({ id, label, Icon }, index) => <button key={id} type="button" onClick={() => onNavigate(id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${index === 0 ? "bg-violet-500/10 text-violet-300" : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"}`}><Icon size={17} strokeWidth={1.8} /><span>{label}</span></button>)}</div><p className="mt-8 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-600">{pilotStoreLabel}</p><div className="mt-3 flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-3"><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-zinc-200">{storeLabel}</p><p className="mt-0.5 text-[9px] text-zinc-600">{storeMeta}</p></div><span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_#8b5cf6]" /></div><div className="mt-auto rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">{profile}</div></nav>
  </>;
}
