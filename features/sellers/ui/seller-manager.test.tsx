import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SellerManager } from "./seller-manager";

const props = { locale: "en" as const, sellers: [], onInvite: vi.fn(), onSetStatus: vi.fn() };
describe("SellerManager", () => {
  it("does not render administrative operations to Sellers", () => {
    const { container } = render(<SellerManager {...props} role="seller" />);
    expect(container).toBeEmptyDOMElement();
  });
  it("renders owner actions through explicit adapters", () => {
    render(<SellerManager {...props} role="owner" />);
    expect(screen.getByRole("button", { name: "Send invitation" })).toBeInTheDocument();
  });
});
