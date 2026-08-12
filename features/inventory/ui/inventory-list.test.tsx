import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InventoryList } from "./inventory-list";
const products = [{ id: 1, code: "A", name: "Alpha", brand: "Z", category: "c", gender: "unisex" as const, size: "M", color: "Black", cost: 1, currency: "EUR" as const, stock: 1, supplier: "S", store: "clothing" as const, updated: "" }];
describe("InventoryList", () => { it("filters and selects product through callback", async () => { const user = userEvent.setup(); const onSelect = vi.fn(); render(<InventoryList products={products} store="clothing" onSelect={onSelect} labels={{title:"Stock",search:"Search",empty:"Empty",units:"units"}} />); await user.click(screen.getByRole("button", {name:/Alpha/})); expect(onSelect).toHaveBeenCalledWith("A"); await user.type(screen.getByPlaceholderText("Search"), "missing"); expect(screen.getByText("Empty")).toBeInTheDocument(); }); });
