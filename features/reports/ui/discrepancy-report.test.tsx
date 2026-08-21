import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ReconciliationDiscrepancy } from "../data/load-discrepancies";
import { DiscrepancyReport } from "./discrepancy-report";

const manualCorrection: ReconciliationDiscrepancy = {
  type: "manual_correction",
  severity: "review",
  sourceIds: { movement_id: "movement" },
  expectedValue: null,
  actualValue: 3,
  occurredAt: "2026-08-17T09:00:00Z",
  summary: "This English server text must not be displayed.",
};

describe("DiscrepancyReport", () => {
  it("keeps Seller access hidden and does not load Owner checks before an explicit action", async () => {
    const user = userEvent.setup();
    const load = vi.fn().mockResolvedValue([]);
    const { rerender } = render(<DiscrepancyReport role="seller" locale="en" load={load} />);
    expect(screen.queryByLabelText("Reconciliation")).not.toBeInTheDocument();

    rerender(<DiscrepancyReport role="owner" locale="en" load={load} />);
    expect(screen.getByRole("button", { name: "View checks" })).toHaveClass("secondary-action");
    expect(screen.getByRole("button", { name: "View checks" })).toBeVisible();
    expect(load).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "View checks" }));
    expect(await screen.findByText("No discrepancies found.")).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Hide checks" }));
    expect(screen.queryByText("No discrepancies found.")).not.toBeInTheDocument();
  });

  it("localizes manual-correction review rows without presenting them as proven errors", async () => {
    const user = userEvent.setup();
    render(<DiscrepancyReport role="owner" locale="tr" load={vi.fn().mockResolvedValue([manualCorrection])} />);

    await user.click(screen.getByRole("button", { name: "Kontrolleri gör" }));
    expect(await screen.findByText("Manuel stok düzeltmesi")).toBeInTheDocument();
    expect(screen.getByText("İnceleme gerekli")).toBeInTheDocument();
    expect(screen.getByText(/Tek başına bir hata kanıtı değildir/)).toBeInTheDocument();
    expect(screen.getByText("Kaydedilen stok düzeltmesi")).toBeInTheDocument();
    expect(screen.getByText("+3 adet")).toBeInTheDocument();
    expect(screen.getByText(/satış veya ödeme değil/)).toBeInTheDocument();
    expect(screen.getByText(/Düzeltme doğruysa işlem gerekmez/)).toBeInTheDocument();
    expect(screen.queryByText("€3,00")).not.toBeInTheDocument();
    expect(screen.queryByText("This English server text must not be displayed.")).not.toBeInTheDocument();
  });

  it("keeps payment checks in EUR and explains the comparison", async () => {
    const user = userEvent.setup();
    const paymentMismatch: ReconciliationDiscrepancy = { type: "payment_mismatch", severity: "error", sourceIds: { sale_id: "sale" }, expectedValue: 100, actualValue: 70, occurredAt: "2026-08-17T09:00:00Z", summary: "" };
    render(<DiscrepancyReport role="owner" locale="en" load={vi.fn().mockResolvedValue([paymentMismatch])} />);

    await user.click(screen.getByRole("button", { name: "View checks" }));
    expect(await screen.findByText("Confirmed sale total")).toBeInTheDocument();
    expect(screen.getByText("Captured payments")).toBeInTheDocument();
    expect(screen.getByText("€100.00")).toBeInTheDocument();
    expect(screen.getByText("€70.00")).toBeInTheDocument();
    expect(screen.getByText("Both figures are EUR amounts and should be the same.")).toBeInTheDocument();
  });

  it("offers localized retry after a load failure", async () => {
    const user = userEvent.setup();
    const load = vi.fn().mockRejectedValue(new Error("failed"));
    render(<DiscrepancyReport role="owner" locale="en" load={load} />);

    await user.click(screen.getByRole("button", { name: "View checks" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Reconciliation could not be loaded.");
    await user.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
  });
});
