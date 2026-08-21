"use client";

import { ArchiveRestore, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { Product } from "@/lib/types";

const archivedCopy = {
  en: {
    intro: "Archived products stay out of inventory and sales. Open a product to review it, or restore it to the active catalog.",
    emptyTitle: "No archived products",
    emptyBody: "Products you archive will appear here and can be restored at any time.",
    archived: "Archived",
    view: "View product",
    restore: "Restore to catalog",
    restoring: "Restoring…",
    restored: "Product restored to the active catalog.",
    error: "Product could not be restored. Nothing was changed. Try again.",
  },
  tr: {
    intro: "Arşivlenen ürünler stok ve satış ekranlarında görünmez. Ürünü incelemek için açın veya aktif kataloğa geri yükleyin.",
    emptyTitle: "Arşivlenmiş ürün yok",
    emptyBody: "Arşivlediğiniz ürünler burada görünür ve istediğiniz zaman geri yüklenebilir.",
    archived: "Arşivde",
    view: "Ürünü aç",
    restore: "Kataloğa geri yükle",
    restoring: "Geri yükleniyor…",
    restored: "Ürün aktif kataloğa geri yüklendi.",
    error: "Ürün geri yüklenemedi. Herhangi bir değişiklik yapılmadı. Tekrar deneyin.",
  },
} as const;

type Props = {
  locale: Locale;
  products: Product[];
  onOpen: (product: Product) => void;
  onRestore: (product: Product) => Promise<void>;
};

export function ArchivedProducts({ locale, products, onOpen, onRestore }: Props) {
  const text = archivedCopy[locale];
  const [restoringCode, setRestoringCode] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const models = useMemo(
    () => [...new Map(products.map((product) => [product.code, product])).values()],
    [products],
  );

  const restore = async (product: Product) => {
    if (restoringCode) return;
    setRestoringCode(product.code);
    setErrorCode(null);
    setSuccess("");
    try {
      await onRestore(product);
      setSuccess(text.restored);
    } catch {
      setErrorCode(product.code);
    } finally {
      setRestoringCode(null);
    }
  };

  return (
    <div className="p-5 sm:p-7">
      <p className="max-w-xl text-xs leading-relaxed text-zinc-500">{text.intro}</p>
      {success && <p role="status" aria-live="polite" className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">{success}</p>}
      {!models.length ? (
        <div className="mt-5 rounded-xl border border-dashed border-zinc-800 px-5 py-10 text-center">
          <ArchiveRestore size={22} aria-hidden="true" className="mx-auto text-zinc-700" />
          <p className="mt-3 text-sm font-semibold text-zinc-300">{text.emptyTitle}</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-zinc-600">{text.emptyBody}</p>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {models.map((product) => {
            const restoring = restoringCode === product.code;
            return (
              <li key={product.code} className="rounded-xl border border-zinc-800 bg-zinc-900/55 p-4">
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <span className="inline-flex rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[10px] font-semibold text-amber-300">{text.archived}</span>
                    <p className="mt-2 truncate text-sm font-semibold text-zinc-200">{product.name}</p>
                    <p className="mt-1 truncate font-mono text-[10px] text-zinc-500">{product.brand} · {product.code}</p>
                  </div>
                  <div className="grid w-full grid-cols-1 gap-2 min-[390px]:grid-cols-2 sm:w-auto">
                    <button type="button" onClick={() => onOpen(product)} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-700 px-3 text-xs font-semibold text-zinc-300 transition hover:border-zinc-600 hover:text-white">
                      <ExternalLink size={14} aria-hidden="true" /> {text.view}
                    </button>
                    <button type="button" disabled={Boolean(restoringCode)} onClick={() => void restore(product)} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-violet-500/35 bg-violet-500/10 px-3 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/15 disabled:cursor-not-allowed disabled:opacity-50">
                      <ArchiveRestore size={14} aria-hidden="true" /> {restoring ? text.restoring : text.restore}
                    </button>
                  </div>
                </div>
                {errorCode === product.code && <p role="alert" className="mt-3 text-xs text-red-300">{text.error}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
