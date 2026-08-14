"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { Supplier } from "@/features/suppliers/model/types";

const labels = {
  en: { archive: "Archive", restore: "Restore", empty: "No suppliers yet.", edit: "Edit supplier", create: "New supplier", name: "Name", nameAria: "Supplier name", phone: "Phone", phoneAria: "Supplier phone", notes: "Notes", notesAria: "Supplier notes", saving: "Saving…", save: "Save supplier", nameRequired: "Supplier name is required.", saveError: "Supplier could not be saved. Try again.", archiveError: "Supplier status could not be changed. Try again." },
  tr: { archive: "Arşivle", restore: "Geri yükle", empty: "Henüz tedarikçi yok.", edit: "Tedarikçiyi düzenle", create: "Yeni tedarikçi", name: "Ad", nameAria: "Tedarikçi adı", phone: "Telefon", phoneAria: "Tedarikçi telefonu", notes: "Notlar", notesAria: "Tedarikçi notları", saving: "Kaydediliyor…", save: "Tedarikçiyi kaydet", nameRequired: "Tedarikçi adı zorunludur.", saveError: "Tedarikçi kaydedilemedi. Tekrar deneyin.", archiveError: "Tedarikçi durumu değiştirilemedi. Tekrar deneyin." },
} as const;

type Props = {
  locale: Locale;
  suppliers: Supplier[];
  onSave: (values: { supplier?: Supplier; name: string; phone: string; notes: string }) => Promise<void>;
  onArchive: (supplier: Supplier) => Promise<void>;
};

export function SupplierManager({ locale, suppliers, onSave, onArchive }: Props) {
  const text = labels[locale];
  const [selected, setSelected] = useState<Supplier | undefined>();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { setName(selected?.name ?? ""); setPhone(selected?.phone ?? ""); setNotes(selected?.notes ?? ""); }, [selected]);

  const submit = async () => {
    if (!name.trim()) { setError(text.nameRequired); return; }
    setSaving(true); setError("");
    try {
      await onSave({ supplier: selected, name, phone, notes });
      setSelected(undefined); setName(""); setPhone(""); setNotes("");
    } catch {
      setError(text.saveError);
    } finally {
      setSaving(false);
    }
  };

  const archive = async (supplier: Supplier) => {
    setSaving(true); setError("");
    try {
      await onArchive(supplier);
    } catch {
      setError(text.archiveError);
    } finally {
      setSaving(false);
    }
  };

  return <div className="grid gap-5 p-5 sm:grid-cols-[1.1fr_.9fr] sm:p-7">
    <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800">
      {suppliers.length ? suppliers.map((supplier) => <div key={supplier.id} className="flex items-center gap-3 p-3"><button type="button" onClick={() => setSelected(supplier)} className="min-w-0 flex-1 text-left"><span className="block truncate text-xs text-zinc-200">{supplier.name}</span><span className="mt-1 block text-[10px] text-zinc-600">{supplier.phone || "—"}</span></button><button type="button" disabled={saving} onClick={() => void archive(supplier)} className="rounded-md border border-zinc-700 px-2 py-1 text-[10px] text-zinc-400 disabled:opacity-50">{supplier.isActive ? text.archive : text.restore}</button></div>) : <p className="p-5 text-xs text-zinc-600">{text.empty}</p>}
    </div>
    <div><p className="text-xs font-semibold text-zinc-200">{selected ? text.edit : text.create}</p><label className="mt-4 block text-[10px] uppercase tracking-[.14em] text-zinc-500">{text.name}<input aria-label={text.nameAria} value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-violet-500" /></label><label className="mt-3 block text-[10px] uppercase tracking-[.14em] text-zinc-500">{text.phone}<input aria-label={text.phoneAria} value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-2 h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-violet-500" /></label><label className="mt-3 block text-[10px] uppercase tracking-[.14em] text-zinc-500">{text.notes}<textarea aria-label={text.notesAria} value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-100 outline-none focus:border-violet-500" /></label>{error && <p role="alert" className="mt-3 text-xs text-red-300">{error}</p>}<button type="button" disabled={saving} onClick={() => void submit()} className="mt-4 h-10 w-full rounded-lg bg-violet-600 text-xs font-semibold text-white disabled:opacity-50">{saving ? text.saving : text.save}</button></div>
  </div>;
}
