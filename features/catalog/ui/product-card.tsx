"use client";

import { ArchiveRestore, ChevronLeft, ChevronRight, History, ImageOff, Maximize2, Minus, Package, Pencil, Plus, Settings2, Shirt, ShoppingBag, Trash2, Upload, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { useDialogFocus } from "@/components/ui/use-dialog-focus";
import type { Product } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { catalogCopy, productArchiveErrorMessage, productCardErrorMessage, productCodeErrorMessage } from "@/features/catalog/model/catalog-copy";

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

export function ProductCard({ locale, variants, onUploadPhotos, onRemovePhoto, onSell, canManageArchive = false, isArchived = false, onSetArchived, canEdit = false, onUpdateCode, onUpdateDetails, onViewHistory, onAdjust }: { locale: Locale; variants: Product[]; onUploadPhotos?: (files: File[]) => Promise<void>; onRemovePhoto?: (path: string) => Promise<void>; onSell?: (code: string) => void; canManageArchive?: boolean; isArchived?: boolean; onSetArchived?: (archived: boolean) => Promise<void>; canEdit?: boolean; onUpdateCode?: (code: string) => Promise<void>; onUpdateDetails?: (details: { name: string; gender: Product["gender"]; lowStockThreshold: number; purchaseCost: number; purchaseCurrency: Product["currency"] }) => Promise<void>; onViewHistory?: (variant: Product) => void; onAdjust?: (variant: Product) => void }) {
  const text = catalogCopy[locale];
  const model = variants[0];
  const photos = model?.photos ?? [];
  const [photoIndex, setPhotoIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [removeConfirmationOpen, setRemoveConfirmationOpen] = useState(false);
  const [removeSaving, setRemoveSaving] = useState(false);
  const [removeError, setRemoveError] = useState("");
  const [archiveConfirmationOpen, setArchiveConfirmationOpen] = useState(false);
  const [archiveSaving, setArchiveSaving] = useState(false);
  const [archiveError, setArchiveError] = useState("");
  const [editingCode, setEditingCode] = useState(false);
  const [code, setCode] = useState(model?.code ?? "");
  const [codeSaving, setCodeSaving] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [codeSaved, setCodeSaved] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false); const [detailsSaving, setDetailsSaving] = useState(false); const [detailsError, setDetailsError] = useState("");
  const [detailName, setDetailName] = useState(model?.name ?? ""); const [detailGender, setDetailGender] = useState<Product["gender"]>(model?.gender ?? "unisex"); const [detailThreshold, setDetailThreshold] = useState(String(model?.lowStockThreshold ?? 2)); const [detailCost, setDetailCost] = useState(String(model?.cost ?? 0)); const [detailCurrency, setDetailCurrency] = useState<Product["currency"]>(model?.currency ?? "EUR");
  const fileInput = useRef<HTMLInputElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(null);
  const carouselSwipe = useRef<{ x: number; y: number } | null>(null);
  const carouselDidSwipe = useRef(false);
  const [color, setColor] = useState(model?.color ?? "");
  const [selectedVariantId, setSelectedVariantId] = useState(model?.id);
  useDialogFocus(viewerOpen, viewerRef);
  const colors = useMemo(() => unique(variants.map((variant) => variant.color)), [variants]);
  const colorVariants = variants.filter((variant) => variant.color === color);
  const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
  const selectedVariant = colorVariants.find((variant) => variant.id === selectedVariantId) ?? colorVariants[0];

  useEffect(() => {
    setSelectedVariantId(colorVariants[0]?.id);
  }, [color]);

  useEffect(() => {
    setCode(model?.code ?? "");
  }, [model?.code]);

  useEffect(() => {
    if (!viewerOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setViewerOpen(false);
        return;
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        const direction = event.key === "ArrowLeft" ? -1 : 1;
        setPhotoIndex((current) => photos.length ? (current + direction + photos.length) % photos.length : current);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        return;
      }
      if (event.key === "+" || event.key === "=") setZoom((current) => Math.min(3, current + 0.25));
      if (event.key === "-") setZoom((current) => Math.max(1, current - 0.25));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewerOpen, photos.length]);

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

  const startCarouselSwipe = (event: PointerEvent<HTMLButtonElement>) => {
    carouselSwipe.current = { x: event.clientX, y: event.clientY };
  };

  const endCarouselSwipe = (event: PointerEvent<HTMLButtonElement>) => {
    const start = carouselSwipe.current;
    carouselSwipe.current = null;
    if (!start) return;
    const x = event.clientX - start.x;
    const y = event.clientY - start.y;
    if (Math.abs(x) < 40 || Math.abs(x) <= Math.abs(y)) return;
    carouselDidSwipe.current = true;
    movePhoto(x < 0 ? 1 : -1);
  };

  const openViewerOrKeepSwipe = () => {
    if (carouselDidSwipe.current) {
      carouselDidSwipe.current = false;
      return;
    }
    openViewer();
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
      setUploadError(error instanceof Error ? error.message : "");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const removePhoto = async () => {
    const path = model.photoPaths?.[photoIndex];
    if (!path || !onRemovePhoto || removeSaving) return;
    setRemoveSaving(true);
    setRemoveError("");
    try {
      await onRemovePhoto(path);
      setRemoveConfirmationOpen(false);
      setPhotoIndex((current) => Math.max(0, Math.min(current, photos.length - 2)));
    } catch (error) {
      setRemoveError(error instanceof Error ? error.message : text.removePhotoError);
    } finally {
      setRemoveSaving(false);
    }
  };

  const setArchived = async (archived: boolean) => {
    if (!onSetArchived || archiveSaving) return;
    setArchiveSaving(true);
    setArchiveError("");
    try {
      await onSetArchived(archived);
      setArchiveConfirmationOpen(false);
    } catch (error) {
      setArchiveError(error instanceof Error ? error.message : "");
    } finally {
      setArchiveSaving(false);
    }
  };

  const saveCode = async () => {
    const nextCode = code.trim();
    if (!nextCode) {
      setCodeSaved(false);
      setCodeError(text.codeRequired);
      return;
    }
    if (!onUpdateCode || codeSaving) return;
    setCodeSaving(true);
    setCodeSaved(false);
    setCodeError("");
    try {
      await onUpdateCode(nextCode);
      setEditingCode(false);
      setCodeSaved(true);
    } catch (error) {
      setCodeError(error instanceof Error ? error.message : "");
    } finally {
      setCodeSaving(false);
    }
  };
  const saveDetails = async () => { const threshold = Number(detailThreshold); const cost = Number(detailCost); if (!onUpdateDetails || !detailName.trim() || !Number.isInteger(threshold) || threshold < 0 || !Number.isFinite(cost) || cost < 0) { setDetailsError(text.detailsValidation); return; } setDetailsSaving(true); setDetailsError(""); try { await onUpdateDetails({ name: detailName.trim(), gender: detailGender, lowStockThreshold: threshold, purchaseCost: cost, purchaseCurrency: detailCurrency }); setDetailsOpen(false); } catch (error) { setDetailsError(error instanceof Error ? error.message : text.detailsGenericError); } finally { setDetailsSaving(false); } };

  return (
    <div className="grid lg:grid-cols-[1.05fr_.95fr]">
      <div className="border-b border-zinc-800 p-4 sm:p-6 lg:border-b-0 lg:border-r">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
          {photos.length ? (
            <button type="button" onPointerDown={startCarouselSwipe} onPointerUp={endCarouselSwipe} onPointerCancel={() => { carouselSwipe.current = null; }} onClick={openViewerOrKeepSwipe} className="group h-full w-full cursor-zoom-in touch-pan-y" aria-label={text.openPhotoFullscreen}><img src={photos[photoIndex]} alt={text.photoAlt(model.name, photoIndex + 1)} className="h-full w-full object-contain" /><span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur transition group-hover:opacity-100"><Maximize2 size={17} /></span></button>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-700"><ImageOff size={30} /><span className="text-xs">{text.noPhotos}</span></div>
          )}
          {photos.length > 1 && <>
            <button type="button" onClick={() => movePhoto(-1)} className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur hover:bg-black/75" aria-label={text.previousPhoto}><ChevronLeft size={20} /></button>
            <button type="button" onClick={() => movePhoto(1)} className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur hover:bg-black/75" aria-label={text.nextPhoto}><ChevronRight size={20} /></button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-2.5 py-1 text-[10px] text-white">{photoIndex + 1} / {photos.length}</span>
          </>}
        </div>
        {photos.length > 1 && <div className="mt-3 grid grid-cols-3 gap-2">{photos.map((photo, index) => <button key={photo} type="button" onClick={() => setPhotoIndex(index)} className={`aspect-[4/3] overflow-hidden rounded-lg border ${index === photoIndex ? "border-violet-500 ring-1 ring-violet-500/30" : "border-zinc-800 opacity-55 hover:opacity-100"}`}><img src={photo} alt="" className="h-full w-full object-cover" /></button>)}</div>}
        {onRemovePhoto && model.photoPaths?.[photoIndex] && (removeConfirmationOpen ? <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/[0.06] p-3"><p className="text-xs leading-relaxed text-red-100">{text.removePhotoConfirm}</p>{removeError && <p role="alert" className="mt-2 text-[11px] text-red-300">{removeError}</p>}<div className="mt-3 flex gap-2"><button type="button" disabled={removeSaving} onClick={() => void removePhoto()} className="flex h-10 flex-1 items-center justify-center rounded-lg bg-red-500 px-3 text-xs font-semibold text-white disabled:opacity-50">{removeSaving ? text.removingPhoto : text.removePhoto}</button><button type="button" disabled={removeSaving} onClick={() => { setRemoveConfirmationOpen(false); setRemoveError(""); }} className="h-10 rounded-lg border border-zinc-700 px-3 text-xs text-zinc-200">{text.cancelEdit}</button></div></div> : <button type="button" onClick={() => { setRemoveConfirmationOpen(true); setRemoveError(""); }} className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-red-500/30 text-xs font-semibold text-red-300"><Trash2 size={15} />{text.removePhoto}</button>)}
        {onUploadPhotos && <div className="mt-3"><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(event) => void uploadPhotos(event.target.files)} /><button type="button" disabled={uploading} onClick={() => fileInput.current?.click()} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/15 disabled:cursor-not-allowed disabled:opacity-50"><Upload size={15} />{uploading ? text.uploadingPhotos : text.addPhotos}</button>{uploadError && <p className="mt-2 text-[11px] text-red-300">{productCardErrorMessage(uploadError, locale)}</p>}<p className="mt-2 text-[10px] text-zinc-600">{text.uploadHint}</p></div>}
      </div>

      <div className="p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-violet-400">{model.code}</p><h3 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">{model.name}</h3><p className="mt-1 text-sm text-zinc-500">{model.brand} · {model.category}</p></div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-500"><Shirt size={20} /></span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3"><p className="text-[9px] uppercase tracking-[0.14em] text-zinc-600">{text.totalStock}</p><p className="mt-2 text-lg font-semibold text-zinc-100">{text.pieces(totalStock)}</p></div>
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-3"><p className="text-[9px] uppercase tracking-[0.14em] text-zinc-500">{text.sellPrice}</p><p className="mt-2 text-lg font-semibold text-zinc-100">{model.cost * 3} {model.currency}</p></div>
        </div>

        <div className="mt-6"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">{text.color}</p><div className="mt-2 flex flex-wrap gap-2">{colors.map((value) => <button key={value} type="button" onClick={() => setColor(value)} className={`rounded-lg border px-3.5 py-2.5 text-xs font-medium ${color === value ? "theme-selected border-violet-500 bg-violet-500/15 text-violet-200" : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-zinc-200"}`}>{value}</button>)}</div></div>

        <div className="mt-6"><div className="flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">{text.availableSizes}</p><span className="text-[10px] text-zinc-600">{text.stockByVariant}</span></div><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">{colorVariants.map((variant) => <button key={variant.id} type="button" onClick={() => setSelectedVariantId(variant.id)} className={`rounded-xl border p-3 text-left transition ${selectedVariant?.id === variant.id ? "border-violet-500 ring-1 ring-violet-500/25" : ""} ${variant.stock > 0 ? "border-zinc-800 bg-zinc-900/70" : "border-amber-500/20 bg-amber-500/[0.06]"}`}><div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold text-zinc-200">{variant.size}</span><span className={`text-[10px] font-medium ${variant.stock > 2 ? "text-emerald-400" : "text-amber-400"}`}>{text.pieces(variant.stock)}</span></div></button>)}</div></div>

        <div className="mt-6 space-y-2 border-t border-zinc-800 pt-5 text-xs"><div className="flex items-center justify-between"><span className="text-zinc-600">{text.supplier}</span><span className="text-zinc-300">{model.supplier}</span></div>{model.barcode && <div className="flex items-center justify-between gap-3"><span className="text-zinc-600">{text.barcode}</span><span className="truncate font-mono text-zinc-300">{model.barcode}</span></div>}<div className="flex items-center justify-between"><span className="text-zinc-600">{text.gender}</span><span className="text-zinc-300">{text.genderNames[model.gender]}</span></div><div className="flex items-center justify-between"><span className="text-zinc-600">{text.variants}</span><span className="flex items-center gap-1.5 text-zinc-300"><Package size={13} /> {variants.length}</span></div></div>
        <div className="mt-6 space-y-3">
          {canEdit && onUpdateDetails && (detailsOpen ? <form className="rounded-xl border border-violet-500/30 bg-violet-500/[0.06] p-3" onSubmit={(event) => { event.preventDefault(); void saveDetails(); }}><p className="text-xs font-semibold text-violet-200">{text.productDetails}</p><label className="mt-3 block text-xs">{text.productName}<input aria-label={text.productName} value={detailName} onChange={(event) => setDetailName(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3" /></label><div className="mt-3 grid grid-cols-2 gap-2"><label className="text-xs">{text.gender}<select aria-label={text.gender} value={detailGender} onChange={(event) => setDetailGender(event.target.value as Product["gender"])} className="mt-1 h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2">{(["women", "men", "unisex"] as const).map((item) => <option key={item} value={item}>{text.genderNames[item]}</option>)}</select></label><label className="text-xs">{text.lowStockThreshold}<input aria-label={text.lowStockThreshold} inputMode="numeric" value={detailThreshold} onChange={(event) => setDetailThreshold(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3" /></label></div><div className="mt-3 grid grid-cols-[1fr_88px] gap-2"><label className="text-xs">{text.purchaseCost}<input aria-label={text.purchaseCost} inputMode="decimal" value={detailCost} onChange={(event) => setDetailCost(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3" /></label><label className="text-xs">{text.purchaseCurrency}<select aria-label={text.purchaseCurrency} value={detailCurrency} onChange={(event) => setDetailCurrency(event.target.value as Product["currency"])} className="mt-1 h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2">{["EUR", "USD", "TRY", "RUB", "GBP"].map((item) => <option key={item}>{item}</option>)}</select></label></div><p className="mt-2 text-[10px] text-zinc-500">{text.detailsScope}</p>{detailsError && <p role="alert" className="mt-2 text-[11px] text-red-300">{detailsError}</p>}<div className="mt-3 flex gap-2"><button type="submit" disabled={detailsSaving} className="h-9 flex-1 rounded-lg bg-violet-600 text-xs font-semibold text-white">{detailsSaving ? text.savingDetails : text.saveDetails}</button><button type="button" onClick={() => setDetailsOpen(false)} className="h-9 rounded-lg border border-zinc-700 px-3 text-xs">{text.cancelEdit}</button></div></form> : <button type="button" onClick={() => { setDetailsOpen(true); setDetailsError(""); }} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 text-xs font-semibold text-zinc-300"><Pencil size={16} /> {text.editProduct}</button>)}
          {canEdit && onUpdateCode && (editingCode ? <form className="rounded-xl border border-violet-500/30 bg-violet-500/[0.06] p-3" onSubmit={(event) => { event.preventDefault(); void saveCode(); }}><label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-violet-200" htmlFor="product-code">{text.productCode}</label><input id="product-code" aria-label={text.productCode} value={code} onChange={(event) => { setCode(event.target.value); setCodeError(""); setCodeSaved(false); }} autoComplete="off" className="mt-2 h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 font-mono text-sm text-zinc-100 outline-none focus:border-violet-500" /><p className="mt-2 text-[10px] text-zinc-500">{text.barcodeUnchanged}</p>{codeError && <p role="alert" className="mt-2 text-[11px] text-red-300">{codeError === text.codeRequired ? codeError : productCodeErrorMessage(codeError, locale)}</p>}<div className="mt-3 flex gap-2"><button type="submit" disabled={codeSaving} className="flex h-9 flex-1 items-center justify-center rounded-lg bg-violet-600 px-3 text-xs font-semibold text-white disabled:opacity-50">{codeSaving ? text.savingCode : text.saveCode}</button><button type="button" disabled={codeSaving} onClick={() => { setEditingCode(false); setCode(model.code); setCodeError(""); }} className="h-9 rounded-lg border border-zinc-700 px-3 text-xs font-medium text-zinc-300">{text.cancelEdit}</button></div></form> : <button type="button" onClick={() => { setEditingCode(true); setCode(model.code); setCodeError(""); setCodeSaved(false); }} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 text-xs font-semibold text-zinc-300 transition hover:border-violet-500/50 hover:text-violet-200"><Pencil size={16} /> {text.editProductCode}</button>)}
          {codeSaved && <p className="text-[11px] text-emerald-300">{text.codeSaved}</p>}
          {onSell && !isArchived && <button type="button" onClick={() => onSell(model.code)} className="purple-shadow flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-semibold text-white transition hover:bg-violet-500"><ShoppingBag size={17} /> {text.sellThisProduct}</button>}
          {onViewHistory && selectedVariant && <button id={`movement-history-${selectedVariant.id}`} type="button" onClick={() => onViewHistory(selectedVariant)} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 text-xs font-semibold text-zinc-300 transition hover:border-violet-500/50 hover:text-violet-200"><History size={16} /> {locale === "tr" ? "Hareket geçmişi" : "Movement history"}</button>}
          {onAdjust && selectedVariant && !isArchived && <button type="button" onClick={() => onAdjust(selectedVariant)} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 text-xs font-semibold text-zinc-300 transition hover:border-violet-500/50 hover:text-violet-200"><Settings2 size={16} /> {locale === "tr" ? "Stok düzelt" : "Adjust stock"}</button>}
          {canManageArchive && onSetArchived && (isArchived ? <button type="button" disabled={archiveSaving} onClick={() => void setArchived(false)} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-violet-500/35 bg-violet-500/10 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/15 disabled:cursor-not-allowed disabled:opacity-50"><ArchiveRestore size={16} /> {archiveSaving ? text.archivingProduct : text.restoreProduct}</button> : archiveConfirmationOpen ? <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-3"><p className="text-xs leading-relaxed text-amber-100">{text.archiveConfirm}</p><div className="mt-3 flex gap-2"><button type="button" disabled={archiveSaving} onClick={() => void setArchived(true)} className="flex h-9 flex-1 items-center justify-center rounded-lg bg-amber-500 px-3 text-xs font-semibold text-zinc-950 disabled:opacity-50">{archiveSaving ? text.archivingProduct : text.archiveConfirmAction}</button><button type="button" disabled={archiveSaving} onClick={() => setArchiveConfirmationOpen(false)} className="h-9 rounded-lg border border-zinc-700 px-3 text-xs font-medium text-zinc-300">{text.cancelArchive}</button></div></div> : <button type="button" onClick={() => setArchiveConfirmationOpen(true)} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 text-xs font-semibold text-zinc-300 transition hover:border-amber-500/50 hover:text-amber-200"><ArchiveRestore size={16} /> {text.archiveProduct}</button>)}
          {archiveError && <p className="text-[11px] text-red-300">{productArchiveErrorMessage(archiveError, locale)}</p>}
        </div>
      </div>

      {viewerOpen && photos[photoIndex] && <div ref={viewerRef} tabIndex={-1} className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 p-3 sm:p-8" role="dialog" aria-modal="true" aria-label={text.photoViewer} onMouseDown={(event) => { event.stopPropagation(); if (event.target === event.currentTarget) setViewerOpen(false); }}>
        <div className="absolute left-4 top-4 flex items-center gap-2 sm:left-7 sm:top-7"><span className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] text-white">{photoIndex + 1} / {photos.length}</span><span className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] text-white">{Math.round(zoom * 100)}%</span></div>
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2 sm:right-7 sm:top-7"><button type="button" onMouseDown={(event) => event.stopPropagation()} onClick={() => changeZoom(-0.25)} disabled={zoom <= 1} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-35" aria-label={text.zoomOut}><Minus size={18} /></button><button type="button" onMouseDown={(event) => event.stopPropagation()} onClick={() => changeZoom(0.25)} disabled={zoom >= 3} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-35" aria-label={text.zoomIn}><Plus size={18} /></button><button type="button" onMouseDown={(event) => event.stopPropagation()} onClick={() => setViewerOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20" aria-label={text.closePhotoViewer}><X size={19} /></button></div>
        {photos.length > 1 && <button type="button" onMouseDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); changeViewerPhoto(-1); }} className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-7" aria-label={text.previousPhoto}><ChevronLeft size={22} /></button>}
        <div className={`flex h-full w-full items-center justify-center overflow-hidden touch-none ${zoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`} onMouseDown={(event) => event.stopPropagation()} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}><img draggable={false} src={photos[photoIndex]} alt={text.enlargedPhotoAlt(model.name, photoIndex + 1)} className="max-h-full max-w-full select-none object-contain transition-transform duration-150" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }} /></div>
        {photos.length > 1 && <button type="button" onMouseDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); changeViewerPhoto(1); }} className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-7" aria-label={text.nextPhoto}><ChevronRight size={22} /></button>}
      </div>}
    </div>
  );
}
