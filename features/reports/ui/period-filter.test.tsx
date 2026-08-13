import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PeriodFilter } from "./period-filter";

const labels = { today: "Today", week: "Week", month: "Month", year: "Year", custom: "Custom", from: "From", to: "To", apply: "Apply", invalid: "Choose a valid date range" };

describe("PeriodFilter", () => {
  it("emits an Istanbul-based preset contract", async () => {
    const user = userEvent.setup(); const onChange = vi.fn();
    render(<PeriodFilter value={{ preset: "today", from: "2026-08-11", to: "2026-08-11" }} onChange={onChange} labels={labels} now={new Date("2026-08-11T20:30:00Z")} />);
    await user.click(screen.getByRole("button", { name: "Week" }));
    expect(onChange).toHaveBeenCalledWith({ preset: "week", from: "2026-08-05", to: "2026-08-11" });
  });

  it("shows and validates a custom inclusive range", async () => {
    const user = userEvent.setup(); const onChange = vi.fn();
    render(<PeriodFilter value={{ preset: "custom", from: "2026-08-10", to: "2026-08-11" }} onChange={onChange} labels={labels} />);
    expect(screen.getByLabelText("From")).toHaveValue("2026-08-10");
    await user.clear(screen.getByLabelText("From")); await user.type(screen.getByLabelText("From"), "08/12/2026");
    await user.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Choose a valid date range");
  });
});
