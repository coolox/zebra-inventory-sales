import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./modal";

describe("Modal", () => {
  it("centers the movement-history layout on mobile and restores background scrolling when closed", () => {
    const { unmount } = render(<Modal title="Stock movements" eyebrow="Dress · Black / M" onClose={vi.fn()} mobilePlacement="centered"><p>One movement</p></Modal>);

    const dialog = screen.getByRole("dialog", { name: "Stock movements" });
    expect(dialog).toHaveAttribute("data-mobile-placement", "centered");
    expect(dialog).toHaveClass("max-h-[calc(100dvh-2rem)]", "overflow-y-auto", "overscroll-contain");
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("keeps the default mobile sheet and supports keyboard close", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal title="Activity" eyebrow="Today" onClose={onClose}><button type="button">Action</button></Modal>);

    expect(screen.getByRole("dialog", { name: "Activity" })).toHaveAttribute("data-mobile-placement", "sheet");
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("returns focus to an explicit trigger when a touch interaction did not retain it", async () => {
    const { rerender } = render(<><button id="history-trigger" type="button">Movement history</button><Modal title="Stock movements" eyebrow="Dress" onClose={vi.fn()} returnFocusId="history-trigger"><p>History</p></Modal></>);
    rerender(<button id="history-trigger" type="button">Movement history</button>);
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("button", { name: "Movement history" })));
  });
});
