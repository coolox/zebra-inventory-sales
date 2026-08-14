import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InventoryList } from "./inventory-list";

const products = [{ id: 1, code: "A", name: "Alpha", brand: "Z", category: "c", gender: "unisex" as const, size: "M", color: "Black", cost: 1, currency: "EUR" as const, stock: 1, supplier: "S", store: "clothing" as const, updated: "", photos: ["/alpha.jpg"] }, { id: 2, code: "B", name: "Blank", brand: "Z", category: "c", gender: "unisex" as const, size: "L", color: "White", cost: 2, currency: "USD" as const, stock: 1, supplier: "S", store: "clothing" as const, updated: "" }];
const labels = { title: "Stock", search: "Search", empty: "Empty", units: "units", unitsShort: "pcs", sku: "SKU", purchase: "Purchase", noPhoto: "No photo" };
const turkishLabels = { title: "Stok", search: "Ara", empty: "Boş", units: "adet", unitsShort: "adet", sku: "SKU", purchase: "Alış", noPhoto: "Fotoğraf yok" };

describe("InventoryList", () => {
  it("renders photo, cost and a no-photo placeholder while preserving selection and search", async () => {
    const user = userEvent.setup(); const onSelect = vi.fn(); const { container } = render(<InventoryList products={products} store="clothing" onSelect={onSelect} labels={labels} />);
    expect(container.querySelector('img[src="/alpha.jpg"]')).toBeInTheDocument();
    expect(screen.getByText("Purchase: 1 EUR")).toBeInTheDocument();
    expect(screen.getByText("Purchase: 2 USD")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "No photo" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Alpha/ }));
    expect(onSelect).toHaveBeenCalledWith("A");
    await user.type(screen.getByPlaceholderText("Search"), "missing");
    expect(screen.getByText("Empty")).toBeInTheDocument();
  });

  it("uses Turkish units and retains an active search after locale labels change", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<InventoryList products={products} store="clothing" onSelect={vi.fn()} labels={labels} />);
    await user.type(screen.getByPlaceholderText("Search"), "alpha");
    rerender(<InventoryList products={products} store="clothing" onSelect={vi.fn()} labels={turkishLabels} />);

    expect(screen.getByPlaceholderText("Ara")).toHaveValue("alpha");
    expect(screen.getByText("Alış: 1 EUR")).toBeInTheDocument();
    expect(screen.getByText("1 adet")).toBeInTheDocument();
  });
});
