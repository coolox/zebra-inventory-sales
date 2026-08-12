import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AdjustmentForm } from "./adjustment-form";

describe("AdjustmentForm", () => {
  it("requires a non-zero integer and a reason", async () => {
    const user = userEvent.setup(); const onConfirm = vi.fn();
    render(<AdjustmentForm locale="en" currentStock={4} onConfirm={onConfirm} />);
    await user.click(screen.getByRole("button", { name: "Save adjustment" }));
    expect(screen.getByRole("alert")).toHaveTextContent("non-zero whole number");
    await user.type(screen.getByLabelText("Quantity change"), "2");
    await user.click(screen.getByRole("button", { name: "Save adjustment" }));
    expect(screen.getByRole("alert")).toHaveTextContent("reason is required");
  });

  it("rejects a negative balance and submits a valid signed adjustment", async () => {
    const user = userEvent.setup(); const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(<AdjustmentForm locale="en" currentStock={2} onConfirm={onConfirm} />);
    await user.type(screen.getByLabelText("Quantity change"), "-3");
    await user.type(screen.getByLabelText("Reason"), "Count correction");
    await user.click(screen.getByRole("button", { name: "Save adjustment" }));
    expect(screen.getByRole("alert")).toHaveTextContent("cannot become negative");
    await user.clear(screen.getByLabelText("Quantity change"));
    await user.type(screen.getByLabelText("Quantity change"), "+1");
    await user.click(screen.getByRole("button", { name: "Save adjustment" }));
    expect(onConfirm).toHaveBeenCalledWith(1, "Count correction");
  });
});
