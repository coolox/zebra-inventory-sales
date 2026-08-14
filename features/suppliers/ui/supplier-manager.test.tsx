import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SupplierManager } from "./supplier-manager";

describe("SupplierManager localization", () => {
  it("switches all owner controls to Turkish without clearing the supplier form", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    const props = { suppliers: [], onSave, onArchive: vi.fn().mockResolvedValue(undefined) };
    const { rerender } = render(<SupplierManager locale="en" {...props} />);

    await user.type(screen.getByLabelText("Supplier name"), "Zebra Tekstil");
    rerender(<SupplierManager locale="tr" {...props} />);

    expect(screen.getByText("Yeni tedarikçi")).toBeInTheDocument();
    expect(screen.getByText("Henüz tedarikçi yok.")).toBeInTheDocument();
    expect(screen.getByLabelText("Tedarikçi adı")).toHaveValue("Zebra Tekstil");
    await user.click(screen.getByRole("button", { name: "Tedarikçiyi kaydet" }));
    expect(onSave).toHaveBeenCalledWith({ supplier: undefined, name: "Zebra Tekstil", phone: "", notes: "" });
  });

  it("shows a Turkish validation error instead of an English fallback", async () => {
    const user = userEvent.setup();
    render(<SupplierManager locale="tr" suppliers={[]} onSave={vi.fn()} onArchive={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Tedarikçiyi kaydet" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Tedarikçi adı zorunludur.");
  });
});
