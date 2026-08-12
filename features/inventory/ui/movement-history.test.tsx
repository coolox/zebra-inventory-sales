import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MovementHistory } from "./movement-history";

const item = {
  id: "movement-1",
  variantId: "variant-1",
  quantity: -2,
  occurredAt: "2026-08-11T10:30:00.000Z",
  actorName: "Deniz Arslan",
  source: "sale" as const,
  reason: "Confirmed sale",
  receiptLineId: null,
};

describe("MovementHistory", () => {
  it("renders loading then the signed movement, actor and reason", async () => {
    const loadHistory = vi.fn().mockResolvedValue([item]);
    render(<MovementHistory locale="en" loadHistory={loadHistory} />);

    expect(screen.getByText("Loading movement history…")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Sale")).toBeInTheDocument());
    expect(screen.getByText("-2")).toBeInTheDocument();
    expect(screen.getByText("Deniz Arslan · Confirmed sale")).toBeInTheDocument();
  });

  it("renders an explicit empty state", async () => {
    render(<MovementHistory locale="en" loadHistory={vi.fn().mockResolvedValue([])} />);
    expect(await screen.findByText("No movements have been recorded for this variant yet.")).toBeInTheDocument();
  });

  it("retries a failed request from the keyboard", async () => {
    const user = userEvent.setup();
    const loadHistory = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce([item]);
    render(<MovementHistory locale="en" loadHistory={loadHistory} />);

    const retry = await screen.findByRole("button", { name: "Retry" });
    retry.focus();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.getByText("Sale")).toBeInTheDocument());
    expect(loadHistory).toHaveBeenCalledTimes(2);
  });
});
