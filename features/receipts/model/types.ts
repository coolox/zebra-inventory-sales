import type { Product } from "@/lib/types";

export type ReceiptDraft = Omit<Product, "id" | "updated">;

export type DemoReceiptResult = {
  products: Product[];
  totalItems: number;
  activity: {
    id: number;
    type: "receipt";
    title: string;
    meta: string;
  };
};
