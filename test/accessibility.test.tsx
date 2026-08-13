import axe from "axe-core";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Modal } from "@/components/modal";

describe("accessibility baseline", () => {
  it("has no automated violations in the shared modal primitive", async () => {
    render(<Modal title="New sale" eyebrow="Sale operation" onClose={() => undefined}><button type="button">Confirm sale</button></Modal>);
    const result = await axe.run(document.body, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });
});
