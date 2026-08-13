import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
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

  it("traps focus and returns it to the trigger when closed", async () => {
    const user = userEvent.setup();
    function Example() {
      const [open, setOpen] = useState(false);
      return <><button type="button" onClick={() => setOpen(true)}>Open movements</button>{open && <Modal title="Stock movements" eyebrow="Product" onClose={() => setOpen(false)}><button type="button">Confirm</button></Modal>}</>;
    }
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Open movements" }));
    const dialog = screen.getByRole("dialog", { name: "Stock movements" });
    const close = screen.getByRole("button", { name: "Close" });
    await waitFor(() => expect(close).toHaveFocus());
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByRole("button", { name: "Confirm" })).toHaveFocus();
    await user.click(close);
    await waitFor(() => expect(screen.getByRole("button", { name: "Open movements" })).toHaveFocus());
    expect(dialog).not.toBeInTheDocument();
  });
});
