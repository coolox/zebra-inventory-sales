import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ActivityFeed } from "./activity-feed";
const item = { id: 1, type: "sale" as const, title: "Sale", meta: "EUR/USD", amount: 10, currency: "USD" as const, converted: true };
describe("ActivityFeed", () => { it("shares compact and full rendering with original currency label", () => { const { rerender } = render(<ActivityFeed items={[item]} locale="en" compact formatMoney={(amount, currency) => `${amount} ${currency}`} />); expect(screen.getByText("+≈10 USD")).toBeInTheDocument(); rerender(<ActivityFeed items={[]} locale="tr" formatMoney={String} />); expect(screen.getByText("Henüz işlem yok.")).toBeInTheDocument(); }); });
