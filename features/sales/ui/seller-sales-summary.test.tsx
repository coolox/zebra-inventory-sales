import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SellerSalesSummary } from "./seller-sales-summary";

const summary = { store_today: { revenueEur: 140, units: 3 }, store_week: { revenueEur: 200, units: 6 }, personal_today: { revenueEur: 110, units: 2 }, personal_week: { revenueEur: 170, units: 5 }, personal_month: { revenueEur: 260, units: 16 }, personal_year: { revenueEur: 290, units: 21 }, personal_all_time: { revenueEur: 310, units: 27 } };

describe("SellerSalesSummary", () => {
  it("does not expose the seller summary in Owner UI", () => {
    render(<SellerSalesSummary role="owner" live storeId="store" locale="en" load={vi.fn()} />);
    expect(screen.queryByRole("region", { name: "Sales summary" })).not.toBeInTheDocument();
  });

  it("renders only server-provided store and personal aggregates, including all periods", async () => {
    const load = vi.fn().mockResolvedValue(summary);
    render(<SellerSalesSummary role="seller" live storeId="store" locale="en" load={load} />);
    expect(screen.getByText("Loading sales summary…")).toBeInTheDocument();
    expect(await screen.findByText("Store sales")).toBeInTheDocument();
    expect(screen.getByText("My sales")).toBeInTheDocument();
    expect(screen.getByText("All time")).toBeInTheDocument();
    expect(screen.getByText("€310")).toBeInTheDocument();
    expect(load).toHaveBeenCalledWith("store");
  });

  it("has explicit empty, error, retry and refresh states", async () => {
    const empty = Object.fromEntries(Object.keys(summary).map((key) => [key, { revenueEur: 0, units: 0 }])) as typeof summary;
    const load = vi.fn().mockResolvedValueOnce(empty).mockRejectedValueOnce(new Error("offline")).mockResolvedValue(summary);
    const { rerender } = render(<SellerSalesSummary role="seller" live storeId="store" locale="en" refreshKey="one" load={load} />);
    expect(await screen.findByText("No confirmed sales in these periods yet.")).toBeInTheDocument();
    rerender(<SellerSalesSummary role="seller" live storeId="store" locale="en" refreshKey="two" load={load} />);
    expect(await screen.findByText("Sales summary could not be loaded.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(screen.getByText("€310")).toBeInTheDocument());
    expect(load).toHaveBeenCalledTimes(3);
  });

  it("does not replace missing live data with demo calculations", () => {
    render(<SellerSalesSummary role="seller" live={false} locale="tr" load={vi.fn()} />);
    expect(screen.getByText("Canlı satış özetiniz güvenli girişten sonra görünecek.")).toBeInTheDocument();
  });
});
