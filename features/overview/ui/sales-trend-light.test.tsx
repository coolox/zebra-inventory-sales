import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Overview } from "./overview";

const props = {
  role: "seller" as const,
  period: "week" as const,
  metrics: { revenue: 1200, margin: 400, count: 3 },
  chartData: [{ label: "Mon", value: 0 }, { label: "Tue", value: 1200 }],
  rankedSellers: [],
  products: [],
  live: false,
  labels: {
    revenue: "Revenue", sales: "Sales", grossMargin: "Gross margin", myResult: "My result", unitsShort: "items",
    todayDelta: "Today", periodDelta: "Period", itemsDelta: "Items", ofRevenue: "of revenue",
    salesTrend: "Sales trend", lastSevenDays: "Last seven days", sellerResults: "Seller results", revenueRanking: "Ranking", manage: "Manage",
  },
  onManageTeam: vi.fn(),
};

describe("Sales Trend light theme", () => {
  it("uses a themeable transparent hit area instead of the dark grey hover surface", () => {
    const { container } = render(<Overview {...props} />);

    expect(container.querySelector(".chart-grid")).toBeInTheDocument();
    const monday = screen.getByRole("button", { name: /Mon:.*Show day revenue/i });
    expect(monday).toHaveClass("sales-trend-bar-hitarea");
    expect(monday).not.toHaveClass("hover:bg-zinc-800/60");
  });
});
