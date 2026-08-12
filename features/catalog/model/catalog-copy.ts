import type { Locale } from "@/lib/i18n";

export const catalogCopy = {
  en: {
    productDetails: "Product details",
    openPhotoFullscreen: "Open photo fullscreen",
    photoAlt: (name: string, index: number) => `${name}, view ${index}`,
    enlargedPhotoAlt: (name: string, index: number) => `${name}, enlarged view ${index}`,
    noPhotos: "No photos yet",
    previousPhoto: "Previous photo",
    nextPhoto: "Next photo",
    uploadingPhotos: "Uploading photos…",
    addPhotos: "Add photos",
    uploadHint: "JPEG, PNG or WebP · up to 8 MB each",
    uploadTypeError: "Use JPEG, PNG or WebP photos only.",
    uploadSizeError: "Each photo must be 8 MB or smaller.",
    uploadAccessError: "You do not have permission to add photos for this product.",
    uploadGenericError: "Photos could not be uploaded. Please try again.",
    totalStock: "Total stock",
    pieces: (count: number) => `${count} pcs`,
    sellPrice: "Sell price",
    color: "Color",
    availableSizes: "Available sizes",
    stockByVariant: "Stock by variant",
    supplier: "Supplier",
    barcode: "Barcode",
    gender: "Gender",
    genderNames: { women: "Women", men: "Men", unisex: "Unisex" },
    variants: "Variants",
    sellThisProduct: "Sell this product",
    archiveProduct: "Archive product",
    restoreProduct: "Restore product",
    archiveConfirm: "Archive this product? It will be hidden from normal inventory and sales, while its history stays intact.",
    archiveConfirmAction: "Archive",
    cancelArchive: "Keep active",
    archivingProduct: "Saving…",
    archiveAccessError: "Only an Owner can archive or restore products.",
    archiveGenericError: "The product status could not be saved. Please try again.",
    photoViewer: "Photo viewer",
    zoomOut: "Zoom out",
    zoomIn: "Zoom in",
    closePhotoViewer: "Close photo viewer",
  },
  tr: {
    productDetails: "Ürün detayları",
    openPhotoFullscreen: "Fotoğrafı tam ekran aç",
    photoAlt: (name: string, index: number) => `${name}, görünüm ${index}`,
    enlargedPhotoAlt: (name: string, index: number) => `${name}, büyütülmüş görünüm ${index}`,
    noPhotos: "Henüz fotoğraf yok",
    previousPhoto: "Önceki fotoğraf",
    nextPhoto: "Sonraki fotoğraf",
    uploadingPhotos: "Fotoğraflar yükleniyor…",
    addPhotos: "Fotoğraf ekle",
    uploadHint: "JPEG, PNG veya WebP · her biri en fazla 8 MB",
    uploadTypeError: "Yalnızca JPEG, PNG veya WebP fotoğrafları kullanın.",
    uploadSizeError: "Her fotoğraf en fazla 8 MB olabilir.",
    uploadAccessError: "Bu ürüne fotoğraf ekleme izniniz yok.",
    uploadGenericError: "Fotoğraflar yüklenemedi. Lütfen tekrar deneyin.",
    totalStock: "Toplam stok",
    pieces: (count: number) => `${count} adet`,
    sellPrice: "Satış fiyatı",
    color: "Renk",
    availableSizes: "Mevcut bedenler",
    stockByVariant: "Varyant bazında stok",
    supplier: "Tedarikçi",
    barcode: "Barkod",
    gender: "Cinsiyet",
    genderNames: { women: "Kadın", men: "Erkek", unisex: "Unisex" },
    variants: "Varyantlar",
    sellThisProduct: "Bu ürünü sat",
    archiveProduct: "Ürünü arşivle",
    restoreProduct: "Ürünü geri yükle",
    archiveConfirm: "Bu ürün arşivlensin mi? Geçmişi korunur, normal stok ve satıştan gizlenir.",
    archiveConfirmAction: "Arşivle",
    cancelArchive: "Aktif tut",
    archivingProduct: "Kaydediliyor…",
    archiveAccessError: "Ürünleri yalnızca bir sahip arşivleyebilir veya geri yükleyebilir.",
    archiveGenericError: "Ürün durumu kaydedilemedi. Lütfen tekrar deneyin.",
    photoViewer: "Fotoğraf görüntüleyici",
    zoomOut: "Uzaklaştır",
    zoomIn: "Yakınlaştır",
    closePhotoViewer: "Fotoğraf görüntüleyiciyi kapat",
  },
} satisfies Record<Locale, object>;

export function productCardErrorMessage(message: string, locale: Locale) {
  const text = catalogCopy[locale];
  if (/JPEG, PNG or WebP/i.test(message)) return text.uploadTypeError;
  if (/8 MB/i.test(message)) return text.uploadSizeError;
  if (/No access|permission|row-level security/i.test(message)) return text.uploadAccessError;
  return text.uploadGenericError;
}

export function productArchiveErrorMessage(message: string, locale: Locale) {
  const text = catalogCopy[locale];
  if (/Only an Owner|No access|permission|row-level security/i.test(message)) return text.archiveAccessError;
  return text.archiveGenericError;
}
