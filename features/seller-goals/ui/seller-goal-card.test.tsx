import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SellerGoalCard } from "./seller-goal-card";

describe("SellerGoalCard localization", () => {
  it("renders Turkish labels, currency formatting and edit action", async () => {
    const user = userEvent.setup();
    render(<SellerGoalCard locale="tr" actual={1234} period="month" />);

    expect(screen.getByText("Hedefim")).toBeInTheDocument();
    expect(screen.getByText("Aylık ciro hedefi")).toBeInTheDocument();
    expect(screen.getByText(/€1\.234/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Düzenle" }));
    expect(screen.getByRole("button", { name: "Kaydet" })).toBeInTheDocument();
  });
});
