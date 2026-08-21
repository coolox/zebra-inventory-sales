import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Product } from "@/lib/types";
import { AdjustmentForm } from "./adjustment-form";

const variants: Product[] = [
  { id: "m", code: "PANTALON", name: "Pantalon", brand: "Zebra", category: "Trousers", gender: "men", size: "M", color: "Blue", cost: 50, currency: "EUR", stock: 4, supplier: "Factory", store: "clothing", updated: "Today" },
  { id: "l", code: "PANTALON", name: "Pantalon", brand: "Zebra", category: "Trousers", gender: "men", size: "L", color: "Blue", cost: 50, currency: "EUR", stock: 3, supplier: "Factory", store: "clothing", updated: "Today" },
];

describe("AdjustmentForm", () => {
  it("requires an explicit size before enabling a stock adjustment", async () => {
    const user = userEvent.setup();
    render(<AdjustmentForm locale="en" productName="Pantalon" color="Blue" variants={variants} onConfirm={vi.fn()} />);
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByLabelText("Quantity change")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Save adjustment" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /^M/ }));
    expect(screen.getByText("Pantalon · Blue / M")).toBeInTheDocument();
    expect(screen.getByLabelText("Quantity change")).toBeEnabled();
  });

  it("confirms M +1 with an explicit before/delta/after summary", async () => {
    const user = userEvent.setup(); const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(<AdjustmentForm locale="en" productName="Pantalon" color="Blue" variants={variants} onConfirm={onConfirm} />);
    await user.click(screen.getByRole("button", { name: /^M/ }));
    await user.type(screen.getByLabelText("Quantity change"), "+1");
    await user.type(screen.getByLabelText("Reason"), "Count correction");
    expect(screen.getByText(/Before: 4.*Delta: \+1.*After: 5/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Save adjustment" }));
    expect(onConfirm).toHaveBeenCalledWith(variants[0], 1, "Count correction");
  });

  it("clears an unconfirmed delta when switching from M to L and protects L from a negative balance", async () => {
    const user = userEvent.setup(); const onConfirm = vi.fn();
    render(<AdjustmentForm locale="en" productName="Pantalon" color="Blue" variants={variants} onConfirm={onConfirm} />);
    await user.click(screen.getByRole("button", { name: /^M/ }));
    await user.type(screen.getByLabelText("Quantity change"), "+1");
    await user.click(screen.getByRole("button", { name: /^L/ }));
    expect(screen.getByLabelText("Quantity change")).toHaveValue("");
    await user.type(screen.getByLabelText("Quantity change"), "-3");
    await user.type(screen.getByLabelText("Reason"), "Damaged item");
    await user.click(screen.getByRole("button", { name: "Save adjustment" }));
    expect(onConfirm).toHaveBeenCalledWith(variants[1], -3, "Damaged item");
    await user.clear(screen.getByLabelText("Quantity change"));
    await user.type(screen.getByLabelText("Quantity change"), "-4");
    await user.click(screen.getByRole("button", { name: "Save adjustment" }));
    expect(screen.getByRole("alert")).toHaveTextContent("cannot become negative");
  });

  it("localizes the explicit size and confirmation flow in Turkish", async () => {
    const user = userEvent.setup();
    render(<AdjustmentForm locale="tr" productName="Pantalon" color="Mavi" variants={variants} onConfirm={vi.fn()} />);
    expect(screen.getByText("Beden seçin")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^L/ }));
    await user.type(screen.getByLabelText("Miktar farkı"), "-3");
    expect(screen.getByText(/Onay özeti/)).toBeInTheDocument();
    expect(screen.getByText(/Önce: 3.*Değişim: -3.*Sonra: 0/)).toBeInTheDocument();
  });
});
