import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuditLog } from "./audit-log";

describe("AuditLog localization", () => {
  it("translates visible categories and empty state while keeping category query keys internal", async () => {
    const load = vi.fn().mockResolvedValue({ items: [], hasMore: false });
    render(<AuditLog locale="tr" load={load} />);

    expect(await screen.findByText("Bu filtreyle eşleşen denetim kaydı yok.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Satış" })).toBeInTheDocument();
    await screen.getByRole("button", { name: "Satış" }).click();
    expect(load).toHaveBeenLastCalledWith(1, "sale");
  });
});
