export type StoreId = "clothing" | "shoes" | "bags";
export type Role = "owner" | "seller";
export type Period = "day" | "week" | "month" | "year";
export type EntityId = number | string;

export type Product = {
  id: EntityId;
  modelId?: string;
  variantId?: string;
  code: string;
  /** Barcode shared by every colour/size of a clothing model. */
  barcode?: string;
  /** Optional supplier barcode assigned to one specific colour/size variant. */
  variantBarcode?: string;
  /** Archived models remain in history but are excluded from normal inventory and sale flows. */
  isActive?: boolean;
  /** Model-specific low-stock policy. Undefined uses the store default of 2. */
  lowStockThreshold?: number;
  name: string;
  brand: string;
  category: string;
  gender: "women" | "men" | "unisex";
  size: string;
  color: string;
  cost: number;
  currency: "EUR" | "USD" | "TRY" | "RUB" | "GBP";
  stock: number;
  supplier: string;
  photos?: string[];
  photoPaths?: string[];
  store: StoreId;
  updated: string;
};

export type Sale = {
  id: EntityId;
  productId: EntityId;
  sellerId: EntityId;
  seller: string;
  store: StoreId;
  product: string;
  code: string;
  size: string;
  quantity: number;
  revenueEur: number;
  marginEur: number;
  revenueIsAllocated?: boolean;
  /** Original-currency payment snapshot captured when the sale was confirmed. */
  paymentSnapshot?: string;
  /** Persisted sale-line identity, required by the exchange ledger in live mode. */
  sourceSaleLineId?: string;
  status?: "confirmed" | "cancelled";
  dayOffset: number;
  time: string;
  /** Signed, sale-time private image reference when available. */
  photoUrl?: string;
};

/** Immutable demo snapshot of an exchange applied to an existing sale line. */
export type SaleExchange = {
  id: EntityId;
  saleId: string;
  sourceSaleLineId: string;
  sourceProductId: EntityId;
  replacementProductId: EntityId;
  replacementProduct: string;
  replacementCode: string;
  replacementSize: string;
  sellerId: EntityId;
  seller: string;
  store: StoreId;
  quantity: number;
  topUpEur: number;
  marginDeltaEur: number;
  reason: string;
  paymentSnapshot?: string;
  dayOffset: number;
  time: string;
};

export type Seller = {
  id: EntityId;
  name: string;
  initials: string;
  store: StoreId;
  status: "online" | "offline";
  email: string;
  phone: string;
  /** Store access is distinct from the live online/offline indicator. */
  membershipStatus?: "invited" | "active" | "blocked";
};

export type Activity = {
  id: number | string;
  type: "sale" | "receipt" | "stock";
  title: string;
  meta: string;
  amount?: number;
  currency?: Product["currency"];
  converted?: boolean;
  /** Demo-only relative business day, used to keep local reports reproducible. */
  dayOffset?: number;
};
