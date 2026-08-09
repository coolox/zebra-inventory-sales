export type StoreId = "clothing" | "shoes" | "bags";
export type Role = "owner" | "seller";
export type Period = "day" | "week" | "month" | "year";
export type EntityId = number | string;

export type Product = {
  id: EntityId;
  modelId?: string;
  variantId?: string;
  code: string;
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
};

export type Activity = {
  id: number | string;
  type: "sale" | "receipt" | "stock";
  title: string;
  meta: string;
  amount?: number;
  currency?: Product["currency"];
};
