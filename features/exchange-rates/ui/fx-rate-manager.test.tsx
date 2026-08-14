import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FxRateManager } from "./fx-rate-manager";

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ from: () => ({ select: () => ({ eq: vi.fn().mockResolvedValue({ data: null }) }) }) }),
}));

describe("FxRateManager localization", () => {
  it("localizes remaining labels and preserves entered rates after locale change", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<FxRateManager locale="en" onClose={vi.fn()} />);

    expect(screen.getByText("Base")).toBeInTheDocument();
    await user.type(screen.getAllByRole("spinbutton")[1], "1.17");
    rerender(<FxRateManager locale="tr" onClose={vi.fn()} />);

    expect(screen.getByText("Ana para")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "İptal" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("1.17")).toBeInTheDocument();
  });
});
