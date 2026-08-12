import type { Activity, Product, Sale, Seller, StoreId } from "./types";

const gallery = (folder: string) => ["front.png", "angle.png", "detail.png"].map((file) => `/products/${folder}/${file}`);

export const stores: { id: StoreId; name: string; short: string; note: string }[] = [
  { id: "clothing", name: "Zebra Boutique", short: "Clothing", note: "Merkez · Antalya" },
  { id: "shoes", name: "Zebra Steps", short: "Shoes", note: "Liman · Antalya" },
  { id: "bags", name: "Zebra Bags", short: "Bags", note: "Kaleiçi · Antalya" },
];

export const initialProducts: Product[] = [
  { id: 1, code: "KM-9902", barcode: "869000990200", variantBarcode: "869000990201", name: "Silk Midi Dress", brand: "Zimmermann", category: "Dresses", gender: "women", size: "0", color: "Ivory", cost: 75, currency: "USD", stock: 4, supplier: "PINO", photos: gallery("km-9902"), store: "clothing", updated: "Today, 09:42" },
  { id: 13, code: "KM-9902", barcode: "869000990200", variantBarcode: "869000990202", name: "Silk Midi Dress", brand: "Zimmermann", category: "Dresses", gender: "women", size: "1", color: "Ivory", cost: 75, currency: "USD", stock: 2, supplier: "PINO", photos: gallery("km-9902"), store: "clothing", updated: "Today, 09:42" },
  { id: 14, code: "KM-9902", barcode: "869000990200", variantBarcode: "869000990203", name: "Silk Midi Dress", brand: "Zimmermann", category: "Dresses", gender: "women", size: "0", color: "Black", cost: 75, currency: "USD", stock: 3, supplier: "PINO", photos: gallery("km-9902"), store: "clothing", updated: "Today, 09:42" },
  { id: 15, code: "KM-9902", barcode: "869000990200", variantBarcode: "869000990204", name: "Silk Midi Dress", brand: "Zimmermann", category: "Dresses", gender: "women", size: "1", color: "Black", cost: 75, currency: "USD", stock: 1, supplier: "PINO", photos: gallery("km-9902"), store: "clothing", updated: "Today, 09:42" },
  { id: 2, code: "TR-07", name: "Structured Jacket", brand: "Balmain", category: "Jackets", gender: "women", size: "M", color: "Black", cost: 120, currency: "EUR", stock: 2, supplier: "SUSI", photos: gallery("tr-07"), store: "clothing", updated: "Today, 08:15" },
  { id: 3, code: "AD26T8332", name: "Stone Tee", brand: "Dupa", category: "T-Shirts", gender: "unisex", size: "M", color: "Stone", cost: 18, currency: "USD", stock: 7, supplier: "DUPA", photos: gallery("ad26t8332"), store: "clothing", updated: "Yesterday, 18:20" },
  { id: 4, code: "BK-110", name: "Relaxed Shorts", brand: "Salaaş", category: "Shorts", gender: "women", size: "S", color: "Graphite", cost: 24, currency: "USD", stock: 1, supplier: "SALAŞ", photos: gallery("bk-110"), store: "clothing", updated: "Yesterday, 16:04" },
  { id: 5, code: "MM-621", name: "Sculpted Knit", brand: "Mugler", category: "Knitwear", gender: "women", size: "S", color: "Aubergine", cost: 63, currency: "EUR", stock: 5, supplier: "BY KONCA", photos: gallery("mm-621"), store: "clothing", updated: "Aug 06, 13:50" },
  { id: 6, code: "NK-AIR24", name: "Air Max Pulse", brand: "Nike", category: "Sneakers", gender: "unisex", size: "39", color: "White / Silver", cost: 88, currency: "EUR", stock: 6, supplier: "IST STEP", store: "shoes", updated: "Today, 10:10" },
  { id: 7, code: "NB-530SG", name: "530 Silver", brand: "New Balance", category: "Sneakers", gender: "unisex", size: "40", color: "Silver", cost: 72, currency: "EUR", stock: 3, supplier: "IST STEP", store: "shoes", updated: "Today, 10:08" },
  { id: 8, code: "MN-LOAF22", name: "Leather Loafer", brand: "Massimo Dutti", category: "Loafers", gender: "men", size: "42", color: "Espresso", cost: 54, currency: "EUR", stock: 1, supplier: "DERI LINE", store: "shoes", updated: "Aug 05, 12:11" },
  { id: 9, code: "GG-OPH-M", name: "Ophidia Mini", brand: "Gucci", category: "Crossbody", gender: "women", size: "Mini", color: "Brown", cost: 310, currency: "EUR", stock: 2, supplier: "MILANO HUB", store: "bags", updated: "Today, 11:30" },
  { id: 10, code: "PR-RNY20", name: "Re-Nylon 2000", brand: "Prada", category: "Shoulder bags", gender: "women", size: "One size", color: "Black", cost: 270, currency: "EUR", stock: 4, supplier: "MILANO HUB", store: "bags", updated: "Today, 11:28" },
  { id: 11, code: "MK-MRC32", name: "Mercer Tote", brand: "Michael Kors", category: "Tote", gender: "women", size: "Medium", color: "Bordeaux", cost: 96, currency: "USD", stock: 6, supplier: "BOSPHORUS", store: "bags", updated: "Aug 04, 17:44" },
  { id: 12, code: "PL-EDT18", name: "Edit Hobo", brand: "Polène", category: "Hobo", gender: "women", size: "Medium", color: "Taupe", cost: 135, currency: "EUR", stock: 1, supplier: "PARIS SELECT", store: "bags", updated: "Aug 03, 09:14" },
];

export const initialSellers: Seller[] = [
  { id: 1, name: "Elif Demir", initials: "ED", store: "clothing", status: "online", email: "elif@zebra.demo", phone: "+90 532 418 24 16" },
  { id: 2, name: "Mert Kaya", initials: "MK", store: "clothing", status: "online", email: "mert@zebra.demo", phone: "+90 535 190 82 40" },
  { id: 3, name: "Selin Akın", initials: "SA", store: "clothing", status: "offline", email: "selin@zebra.demo", phone: "+90 530 772 10 05" },
  { id: 4, name: "Ayşe Yılmaz", initials: "AY", store: "clothing", status: "online", email: "ayse@zebra.demo", phone: "+90 542 114 63 02" },
];

export const initialSales: Sale[] = [
  { id: 1, productId: 1, sellerId: 1, seller: "Elif Demir", store: "clothing", product: "Silk Midi Dress", code: "KM-9902", size: "0", quantity: 1, revenueEur: 250, marginEur: 181, dayOffset: 0, time: "12:48" },
  { id: 2, productId: 9, sellerId: 3, seller: "Selin Akın", store: "bags", product: "Ophidia Mini", code: "GG-OPH-M", size: "Mini", quantity: 1, revenueEur: 520, marginEur: 210, dayOffset: 0, time: "12:21" },
  { id: 3, productId: 6, sellerId: 2, seller: "Mert Kaya", store: "shoes", product: "Air Max Pulse", code: "NK-AIR24", size: "39", quantity: 1, revenueEur: 145, marginEur: 57, dayOffset: 0, time: "11:56" },
  { id: 4, productId: 2, sellerId: 4, seller: "Ayşe Yılmaz", store: "clothing", product: "Structured Jacket", code: "TR-07", size: "M", quantity: 1, revenueEur: 240, marginEur: 120, dayOffset: 0, time: "10:44" },
  { id: 5, productId: 11, sellerId: 3, seller: "Selin Akın", store: "bags", product: "Mercer Tote", code: "MK-MRC32", size: "Medium", quantity: 1, revenueEur: 215, marginEur: 126, dayOffset: 0, time: "09:32" },
  { id: 6, productId: 3, sellerId: 1, seller: "Elif Demir", store: "clothing", product: "Stone Tee", code: "AD26T8332", size: "M", quantity: 2, revenueEur: 95, marginEur: 62, dayOffset: 1, time: "18:03" },
  { id: 7, productId: 7, sellerId: 2, seller: "Mert Kaya", store: "shoes", product: "530 Silver", code: "NB-530SG", size: "40", quantity: 1, revenueEur: 138, marginEur: 66, dayOffset: 2, time: "16:26" },
  { id: 8, productId: 10, sellerId: 3, seller: "Selin Akın", store: "bags", product: "Re-Nylon 2000", code: "PR-RNY20", size: "One size", quantity: 1, revenueEur: 490, marginEur: 220, dayOffset: 3, time: "14:40" },
  { id: 9, productId: 5, sellerId: 4, seller: "Ayşe Yılmaz", store: "clothing", product: "Sculpted Knit", code: "MM-621", size: "S", quantity: 1, revenueEur: 175, marginEur: 112, dayOffset: 5, time: "11:15" },
  { id: 10, productId: 8, sellerId: 2, seller: "Mert Kaya", store: "shoes", product: "Leather Loafer", code: "MN-LOAF22", size: "42", quantity: 1, revenueEur: 128, marginEur: 74, dayOffset: 8, time: "17:52" },
  { id: 11, productId: 12, sellerId: 3, seller: "Selin Akın", store: "bags", product: "Edit Hobo", code: "PL-EDT18", size: "Medium", quantity: 1, revenueEur: 285, marginEur: 150, dayOffset: 12, time: "13:18" },
  { id: 12, productId: 1, sellerId: 1, seller: "Elif Demir", store: "clothing", product: "Silk Midi Dress", code: "KM-9902", size: "1", quantity: 1, revenueEur: 260, marginEur: 191, dayOffset: 18, time: "15:46" },
  { id: 13, productId: 6, sellerId: 2, seller: "Mert Kaya", store: "shoes", product: "Air Max Pulse", code: "NK-AIR24", size: "41", quantity: 1, revenueEur: 149, marginEur: 61, dayOffset: 45, time: "12:09" },
  { id: 14, productId: 9, sellerId: 3, seller: "Selin Akın", store: "bags", product: "Ophidia Mini", code: "GG-OPH-M", size: "Mini", quantity: 1, revenueEur: 535, marginEur: 225, dayOffset: 103, time: "16:33" },
];

export const initialActivity: Activity[] = [
  { id: 1, type: "sale", title: "Ophidia Mini sold", meta: "Selin Akın · Zebra Bags · 12:21", amount: 520 },
  { id: 2, type: "receipt", title: "Receipt from IST STEP", meta: "24 items · Zebra Steps · 11:04" },
  { id: 3, type: "sale", title: "Air Max Pulse sold", meta: "Mert Kaya · Zebra Steps · 11:56", amount: 145 },
  { id: 4, type: "stock", title: "Low stock: BK-110", meta: "1 unit · Zebra Boutique · 10:18" },
];
