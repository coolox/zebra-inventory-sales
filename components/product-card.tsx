"use client";

import { ChevronLeft, ChevronRight, ImageOff, Maximize2, Minus, Package, Plus, Shirt, ShoppingBag, Upload, X } from "lucide-react";
import { useMemo, useRef, useState, type PointerEvent } from "react";
import type { Product } from "@/lib/types";

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

export function ProductCard({ variants, onUploadPhotos, onSell }: { variants: Product[]; onUploadPhotos?: (files: File[]) => Promise<void>; onSell?: (code: string) => void }) {
  const model = variants[0];
  const photos = model?.photos ?? [];
  const [photoIndex, setPhotoIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const drag = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(null);
  const [color, setColor] = useState(model?.color ?? "");
  const colors = useMemo(() => unique(variants.map((variant) => variant.color)), [variants]);
  const colorVariants = variants.filter((variant) => variant.color === color);
  const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);

  if (!model) return null;

  const movePhoto = (direction: number) => {
    if (!photos.length) return;
    setPhotoIndex((current) => (current + direction + photos.length) % photos.length);
  };

  const openViewer = () => {
    if (!photos.length) return;
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setViewerOpen(true);
  };

  const changeZoom = (delta: number) => {
    setZoom((current) => {
      const next = Math.min(3, Math.max(1, current + delta));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const changeViewerPhoto = (direction: number) => {
    movePhoto(direction);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (zoom <= 1) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: pan.x, originY: pan.y };
  };

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    setPan({ x: current.originX + event.clientX - current.startX, y: current.originY + event.clientY - current.startY });
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId === event.pointerId) drag.current = null;
  };

  const uploadPhotos = async (files: FileList | null) => {
    if (!files?.length || !onUploadPhotos || uploading) return;
    setUploading(true);
    setUploadError("");
    try {
      await onUploadPhotos([...files]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Photos could not be uploaded. Please try again.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  return (
    <div className="grid lg:grid-cols-[1.05fr_.95fr]">
      <div className="border-b border-zinc-800 p-4 sm:p-6 lg:border-b-0 lg:border-r">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
          {photos.length ? (
            <button type="button" onClick={openViewer} className="group h-full w-full cursor-zoom-in" aria-label="Open photo fullscreen"><img src={photos[photoIndex]} alt={`${model.name}, view ${photoIndex + 1}`} className="h-full w-full object-contain" /><span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur transition group-hover:opacity-100"><Maximize2 size={17} /></span></button>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-700"><ImageOff size={30} /><span className="text-xs">No photos yet</span></div>
          )}
          {photos.length > 1 && <>
            <button type="button" onClick={() => movePhoto(-1)} className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur hover:bg-black/75" aria-label="Previous photo"><ChevronLeft size={20} /></button>
            <button type="button" onClick={() => movePhoto(1)} className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur hover:bg-black/75" aria-label="Next photo"><ChevronRight size={20} /></button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-2.5 py-1 text-[10px] text-white">{photoIndex + 1} / {photos.length}</span>
          </>}
        </div>
        {photos.length > 1 && <div className="mt-3 grid grid-cols-3 gap-2">{photos.map((photo, index) => <button key={photo} type="button" onClick={() => setPhotoIndex(index)} className={`aspect-[4/3] overflow-hidden rounded-lg border ${index === photoIndex ? "border-violet-500 ring-1 ring-violet-500/30" : "border-zinc-800 opacity-55 hover:opacity-100"}`}><img src={photo} alt="" className="h-full w-full object-cover" /></button>)}</div>}
        {onUploadPhotos && <div className="mt-3"><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(event) => void uploadPhotos(event.target.files)} /><button type="button" disabled={uploading} onClick={() => fileInput.current?.click()} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/15 disabled:cursor-not-allowed disabled:opacity-50"><Upload size={15} />{uploading ? "Uploading photos…" : "Add photos"}</button>{uploadError && <p className="mt-2 text-[11px] text-red-300">{uploadError}</p>}<p className="mt-2 text-[10px] text-zinc-600">JPEG, PNG or WebP · up to 8 MB each</p></div>}
      </div>

      <div className="p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-violet-400">{model.code}</p><h3 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">{model.name}</h3><p className="mt-1 text-sm text-zinc-500">{model.brand} · {model.category}</p></div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-500"><Shirt size={20} /></span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3"><p className="text-[9px] uppercase tracking-[0.14em] text-zinc-600">Total stock</p><p className="mt-2 text-lg font-semibold text-zinc-100">{totalStock} pcs</p></div>
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-3"><p className="text-[9px] uppercase tracking-[0.14em] text-zinc-500">Sell price</p><p className="mt-2 text-lg font-semibold text-zinc-100">{model.cost * 3} {model.currency}</p></div>
        </div>

        <div className="mt-6"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">Color</p><div className="mt-2 flex flex-wrap gap-2">{colors.map((value) => <button key={value} type="button" onClick={() => setColor(value)} className={`rounded-lg border px-3.5 py-2.5 text-xs font-medium ${color === value ? "theme-selected border-violet-500 bg-violet-500/15 text-violet-200" : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-zinc-200"}`}>{value}</button>)}</div></div>

        <div className="mt-6"><div className="flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">Available sizes</p><span className="text-[10px] text-zinc-600">Stock by variant</span></div><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">{colorVariants.map((variant) => <div key={variant.id} className={`rounded-xl border p-3 ${variant.stock > 0 ? "border-zinc-800 bg-zinc-900/70" : "border-amber-500/20 bg-amber-500/[0.06]"}`}><div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold text-zinc-200">{variant.size}</span><span className={`text-[10px] font-medium ${variant.stock > 2 ? "text-emerald-400" : "text-amber-400"}`}>{variant.stock} pcs</span></div></div>)}</div></div>

        <div className="mt-6 space-y-2 border-t border-zinc-800 pt-5 text-xs"><div className="flex items-center justify-between"><span className="text-zinc-600">Supplier</span><span className="text-zinc-300">{model.supplier}</span></div><div className="flex items-center justify-between"><span className="text-zinc-600">Gender</span><span className="text-zinc-300">{model.gender === "women" ? "Women" : model.gender === "men" ? "Men" : "Unisex"}</span></div><div className="flex items-center justify-between"><span className="text-zinc-600">Variants</span><span className="flex items-center gap-1.5 text-zinc-300"><Package size={13} /> {variants.length}</span></div></div>
        {onSell && <button type="button" onClick={() => onSell(model.code)} className="purple-shadow mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-semibold text-white transition hover:bg-violet-500"><ShoppingBag size={17} /> Sell this product</button>}
      </div>

      {viewerOpen && photos[photoIndex] && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 p-3 sm:p-8" role="dialog" aria-modal="true" aria-label="Photo viewer" onMouseDown={(event) => { event.stopPropagation(); if (event.target === event.currentTarget) setViewerOpen(false); }}>
        <div className="absolute left-4 top-4 flex items-center gap-2 sm:left-7 sm:top-7"><span className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] text-white">{photoIndex + 1} / {photos.length}</span><span className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] text-white">{Math.round(zoom * 100)}%</span></div>
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2 sm:right-7 sm:top-7"><button type="button" onMouseDown={(event) => event.stopPropagation()} onClick={() => changeZoom(-0.25)} disabled={zoom <= 1} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-35" aria-label="Zoom out"><Minus size={18} /></button><button type="button" onMouseDown={(event) => event.stopPropagation()} onClick={() => changeZoom(0.25)} disabled={zoom >= 3} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-35" aria-label="Zoom in"><Plus size={18} /></button><button type="button" onMouseDown={(event) => event.stopPropagation()} onClick={() => setViewerOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20" aria-label="Close photo viewer"><X size={19} /></button></div>
        {photos.length > 1 && <button type="button" onMouseDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); changeViewerPhoto(-1); }} className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-7" aria-label="Previous photo"><ChevronLeft size={22} /></button>}
        <div className={`flex h-full w-full items-center justify-center overflow-hidden touch-none ${zoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`} onMouseDown={(event) => event.stopPropagation()} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}><img draggable={false} src={photos[photoIndex]} alt={`${model.name}, enlarged view ${photoIndex + 1}`} className="max-h-full max-w-full select-none object-contain transition-transform duration-150" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }} /></div>
        {photos.length > 1 && <button type="button" onMouseDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); changeViewerPhoto(1); }} className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-7" aria-label="Next photo"><ChevronRight size={22} /></button>}
      </div>}
    </div>
  );
}
