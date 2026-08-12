import type { ReceiptLineDto } from "@/lib/contracts/receipts";
import type { Product } from "@/lib/types";

export type ReceiptDraft = ReceiptLineDto;

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
