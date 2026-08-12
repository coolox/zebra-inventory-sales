import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Overview } from "./overview";
const labels = { revenue:"Revenue", sales:"Sales", grossMargin:"Margin", myResult:"Result", unitsShort:"pcs", todayDelta:"Today", periodDelta:"Period", itemsDelta:"Items", ofRevenue:"of revenue", salesTrend:"Trend", lastSevenDays:"7 days", sellerResults:"Sellers", revenueRanking:"Ranking", manage:"Manage" };
const base = { period:"day" as const, metrics:{revenue:0,margin:0,count:0},chartData:[],rankedSellers:[],products:[],live:true,onManageTeam:vi.fn(),labels };
describe("Overview", () => { it("keeps Owner management and live empty data explicit", () => { render(<Overview {...base} role="owner" />); expect(screen.getByRole("button", {name:"Manage"})).toBeInTheDocument(); expect(screen.getAllByText("€0")).toHaveLength(2); }); it("hides Owner management from Seller", () => { render(<Overview {...base} role="seller" />); expect(screen.queryByRole("button", {name:"Manage"})).not.toBeInTheDocument(); }); });
