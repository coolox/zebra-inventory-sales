import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { InventoryReportRow } from "../data/load-inventory-report";
import { LowStockReport } from "./low-stock-report";

const lowStock: InventoryReportRow = { variantId: "v-1", modelId: "m-1", modelCode: "AA11", modelName: "T-shirt", color: "Black", size: "M", balance: 1, soldUnits: 3, sellThrough: .75, turnover: 2, lowStockThreshold: 2, isLowStock: true };

describe("LowStockReport", () => {
  it("keeps a long low-stock list collapsed until Owner requests it", async () => {
    const user = userEvent.setup();
    render(<LowStockReport locale="en" state="ready" rows={[lowStock, { ...lowStock, variantId: "v-2", modelCode: "AA12", size: "L" }]} onRetry={vi.fn()} />);
    expect(screen.getByText("2 variants need attention")).toBeInTheDocument();
    expect(screen.queryByText("AA11 · Black/M")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "View list" }));
    expect(screen.getByText("AA11 · Black/M")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Hide list" }));
    expect(screen.queryByText("AA11 · Black/M")).not.toBeInTheDocument();
  });

  it("localizes empty, loading and error states without pretending an error is empty", () => {
    const retry = vi.fn();
    const { rerender } = render(<LowStockReport locale="tr" state="ready" rows={[]} onRetry={retry} />);
    expect(screen.getByText("Her şey yolunda")).toBeInTheDocument();
    rerender(<LowStockReport locale="tr" state="loading" rows={[]} onRetry={retry} />);
    expect(screen.getByText("Düşük stoklu ürünler yükleniyor…")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Listeyi gör" })).toBeDisabled();
    rerender(<LowStockReport locale="tr" state="error" rows={[]} onRetry={retry} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Düşük stoklu ürünler yüklenemedi.");
    expect(screen.queryByText("Her şey yolunda")).not.toBeInTheDocument();
  });
});
