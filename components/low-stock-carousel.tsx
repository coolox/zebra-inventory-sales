"use client";

import { Boxes, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";

export function LowStockCarousel({ products }: { products: Product[] }) {
  const items = useMemo(
    () => products.filter((product) => product.stock <= 2).sort((a, b) => a.stock - b.stock),
    [products],
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [items.length]);

  useEffect(() => {
    if (index >= items.length) setIndex(0);
  }, [index, items.length]);

  if (!items.length) {
    return (
      <article className="panel relative overflow-hidden rounded-2xl p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Stock attention</p>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50">All clear</p>
        <p className="mt-3 text-xs text-emerald-400">No low-stock products</p>
      </article>
    );
  }

  const safeIndex = Number.isFinite(index) ? ((index % items.length) + items.length) % items.length : 0;
  const product = items[safeIndex];
  const move = (direction: number) => setIndex((current) => (current + direction + items.length) % items.length);

  return (
    <article className="panel metric-glow purple-shadow relative min-w-0 overflow-hidden rounded-2xl border-violet-500/25 p-5" aria-live="polite">
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Needs attention</p>
            <p className="mt-3 truncate text-lg font-semibold tracking-tight text-zinc-50">{product.name || product.code}</p>
            <p className="mt-1 text-[11px] text-zinc-500">{product.code} · {product.color} · {product.size}</p>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
            <Boxes size={19} strokeWidth={1.8} />
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-semibold tracking-[-0.04em] text-white">{product.stock} left</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-amber-400">Reorder suggested</p>
          </div>
          {items.length > 1 && (
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => move(-1)} className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-700 text-zinc-500 hover:text-white" aria-label="Previous product"><ChevronLeft size={14} /></button>
              <span className="min-w-8 text-center text-[9px] text-zinc-600">{safeIndex + 1}/{items.length}</span>
              <button type="button" onClick={() => move(1)} className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-700 text-zinc-500 hover:text-white" aria-label="Next product"><ChevronRight size={14} /></button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
