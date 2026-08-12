import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ActionButton } from "./action-button";
import { FormError } from "./form-error";
import { FormField, TextInput } from "./form-field";

describe("form controls", () => {
  it("exposes label, invalid state, error and loading state", () => {
    render(<><FormField label="Email" error="Required"><TextInput aria-label="Email" invalid /></FormField><FormError>Unable to save.</FormError><ActionButton loading>Saving…</ActionButton></>);
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getAllByRole("alert")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
  });
});
