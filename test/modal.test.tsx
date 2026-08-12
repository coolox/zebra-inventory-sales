import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "@/components/modal";

describe("Modal", () => {
  it("closes its keyboard dialog with Escape", () => {
    const onClose = vi.fn();
    render(<Modal title="Stock movements" eyebrow="Product" onClose={onClose}><p>Movement history</p></Modal>);

    expect(screen.getByRole("dialog", { name: "Stock movements" })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
