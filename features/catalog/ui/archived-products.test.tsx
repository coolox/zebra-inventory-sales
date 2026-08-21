import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Product } from "@/lib/types";
import { ArchivedProducts } from "./archived-products";

const product: Product = {
  id: "variant-1",
  modelId: "model-1",
  code: "TR07",
  name: "Dress",
  brand: "Zebra",
  category: "Dresses",
  gender: "women",
  color: "Black",
  size: "M",
  cost: 40,
  currency: "EUR",
  stock: 2,
  supplier: "Factory",
  store: "clothing",
  updated: "Today",
  isActive: false,
};

describe("ArchivedProducts", () => {
  it("keeps the archive discoverable when it is empty", () => {
    render(<ArchivedProducts locale="en" products={[]} onOpen={vi.fn()} onRestore={vi.fn()} />);

    expect(screen.getByText("No archived products")).toBeInTheDocument();
    expect(screen.getByText(/Products you archive will appear here/)).toBeInTheDocument();
  });

  it("deduplicates variants and provides Turkish open and restore actions", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<ArchivedProducts locale="tr" products={[product, { ...product, id: "variant-2", size: "L" }]} onOpen={onOpen} onRestore={vi.fn()} />);

    expect(screen.getAllByText("Dress")).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Ürünü aç" }));
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ code: "TR07" }));
    expect(screen.getByRole("button", { name: "Kataloğa geri yükle" })).toBeInTheDocument();
  });

  it("announces a successful restore", async () => {
    const user = userEvent.setup();
    const onRestore = vi.fn().mockResolvedValue(undefined);
    render(<ArchivedProducts locale="en" products={[product]} onOpen={vi.fn()} onRestore={onRestore} />);

    await user.click(screen.getByRole("button", { name: "Restore to catalog" }));
    await waitFor(() => expect(onRestore).toHaveBeenCalledWith(product));
    expect(screen.getByRole("status")).toHaveTextContent("Product restored to the active catalog.");
  });

  it("shows an error without claiming that restore succeeded", async () => {
    const user = userEvent.setup();
    const onRestore = vi.fn().mockRejectedValue(new Error("permission denied"));
    render(<ArchivedProducts locale="en" products={[product]} onOpen={vi.fn()} onRestore={onRestore} />);

    await user.click(screen.getByRole("button", { name: "Restore to catalog" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Product could not be restored. Nothing was changed.");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Restore to catalog" })).toBeEnabled();
  });
});
