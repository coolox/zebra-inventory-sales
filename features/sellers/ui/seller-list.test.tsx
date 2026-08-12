import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SellerList } from "./seller-list";

const seller = { id: "seller-1", name: "Taylan Zor", initials: "TZ", store: "clothing" as const, status: "offline" as const, email: "taylan@example.test", phone: "+90", membershipStatus: "active" as const };

describe("SellerList", () => {
  it("shows status and rolls optimistic deactivation back on failure", async () => {
    const user = userEvent.setup();
    const onSetStatus = vi.fn().mockRejectedValue(new Error("Access update failed."));
    render(<SellerList locale="en" sellers={[seller]} onSetStatus={onSetStatus} />);
    expect(screen.getByText("Active")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Deactivate" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Access update failed.");
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("shows pending and blocked sellers with the appropriate owner action", () => {
    render(<SellerList locale="en" sellers={[{ ...seller, id: "pending", membershipStatus: "invited" }, { ...seller, id: "blocked", membershipStatus: "blocked" }]} onSetStatus={vi.fn()} />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reactivate" })).toBeInTheDocument();
  });
});
