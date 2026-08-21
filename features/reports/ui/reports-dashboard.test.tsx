import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ReportsDashboard } from "./reports-dashboard";
const load = vi.fn().mockResolvedValue({ metrics: { revenueEur: 100, costEur: 50, marginEur: 50, saleCount: 1, units: 2, averageTicketEur: 100 }, breakdowns: [{ key: "s", label: "Elif", revenueEur: 100, costEur: 50, marginEur: 50, units: 2 }], inventory: [{ variantId: "v", modelId: "m", modelCode: "KM", modelName: "Dress", color: "Black", size: "M", balance: 1, soldUnits: 2, sellThrough: .66, turnover: 2, lowStockThreshold: 2, isLowStock: true }] });
describe("ReportsDashboard", () => { it("hides reports from Seller and renders Owner summary after load", async () => { const user = userEvent.setup(); load.mockClear(); const { rerender } = render(<ReportsDashboard role="seller" locale="en" load={load} />); expect(screen.queryByRole("region", { name: "Reports" })).not.toBeInTheDocument(); await waitFor(() => expect(load).not.toHaveBeenCalled()); rerender(<ReportsDashboard role="owner" locale="en" load={load} exportStoreId="store" />); expect((await screen.findAllByText("€100")).length).toBeGreaterThan(0); expect(screen.getByText("Elif")).toBeInTheDocument(); expect(screen.queryByText(/KM · Black/)).not.toBeInTheDocument(); await user.click(screen.getByRole("button", { name: "View list" })); expect(screen.getByText(/KM · Black/)).toBeInTheDocument(); expect(screen.getByRole("link", { name: "Export XLSX" })).toHaveAttribute("href", expect.stringContaining("/api/reports/export/xlsx?")); expect(screen.getByRole("link", { name: "Export PDF" })).toHaveAttribute("href", expect.stringContaining("/api/reports/export/pdf?")); await user.click(screen.getByRole("button", { name: "Cash" })); expect(screen.getByRole("button", { name: "Print" })).toBeInTheDocument(); expect(screen.getAllByRole("link", { name: "Export CSV" }).find((link) => link.getAttribute("href")?.includes("report=cash"))).toBeDefined(); }); });

describe("ReportsDashboard Turkish localization", () => {
  it("localizes dashboard copy, dimensions, exports and dynamic fallbacks without clearing the chosen dimension", async () => {
    const user = userEvent.setup();
    const localizedLoad = vi.fn().mockResolvedValue({ ...await load(), breakdowns: [{ key: "unknown", label: "Unknown seller", revenueEur: 100, costEur: 50, marginEur: 50, units: 2 }] });
    const { rerender } = render(<ReportsDashboard role="owner" locale="en" load={localizedLoad} exportStoreId="store" />);
    await user.click(await screen.findByRole("button", { name: "Supplier" }));
    await waitFor(() => expect(localizedLoad).toHaveBeenLastCalledWith(expect.anything(), "supplier"));
    rerender(<ReportsDashboard role="owner" locale="tr" load={localizedLoad} exportStoreId="store" />);
    expect(await screen.findByRole("region", { name: "Raporlar" })).toBeInTheDocument();
    expect(screen.getByText("EUR finans ve stok hareketleri görünümü")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "CSV dışa aktar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "XLSX dışa aktar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "PDF dışa aktar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tedarikçi" })).toHaveClass("text-violet-200");
    expect(screen.getByText("Bilinmeyen satıcı")).toBeInTheDocument();
    expect(screen.getByText("Bu geçmiş satış için etkin ad veya hesap e-postası yok.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Listeyi gör" })).toBeInTheDocument();
  });
});

describe("ReportsDashboard seller labels", () => {
  it("renders the Owner-authorized approved email returned by reporting", async () => {
    const ownerLoad = vi.fn().mockResolvedValue({ ...await load(), breakdowns: [{ key: "owner", label: "owner@example.test", revenueEur: 100, costEur: 50, marginEur: 50, units: 2 }] });
    render(<ReportsDashboard role="owner" locale="en" load={ownerLoad} />);
    expect(await screen.findByText("owner@example.test")).toBeInTheDocument();
  });
});
