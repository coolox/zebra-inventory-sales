import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DiscrepancyReport } from "./discrepancy-report";

describe("DiscrepancyReport", () => {
  it("keeps Seller access hidden and renders Owner empty/error states", async () => {
    const empty = vi.fn().mockResolvedValue([]); const { rerender } = render(<DiscrepancyReport role="seller" load={empty} />); expect(screen.queryByLabelText("Reconciliation")).not.toBeInTheDocument();
    rerender(<DiscrepancyReport role="owner" load={empty} />); expect(await screen.findByText("No discrepancies found.")).toBeInTheDocument();
    rerender(<DiscrepancyReport role="owner" load={() => Promise.reject(new Error("failed"))} />); fireEvent.click(screen.getByRole("button", { name: "Refresh" })); expect(await screen.findByText(/could not be loaded/)).toBeInTheDocument();
  });
});
