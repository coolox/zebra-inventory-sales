import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Product } from "@/lib/types";
import { ReceiveFlow } from "./receive-flow";

const product: Product = {
  id: "variant-1",
  code: "TR07",
  barcode: "869000700001",
  name: "Dress",
  brand: "Zebra",
  category: "Dresses",
  gender: "women",
  color: "Black",
  size: "L",
  cost: 40,
  currency: "EUR",
  stock: 3,
  supplier: "Factory",
  store: "clothing",
  updated: "Today",
};

async function prepareExistingVariant(user: ReturnType<typeof userEvent.setup>, locale: "en" | "tr") {
  await user.type(screen.getByRole("textbox", { name: locale === "tr" ? /Ürün kodu/ : /Product code/ }), "TR07");
  await user.click(screen.getByRole("button", { name: locale === "tr" ? "Siyah" : "Black" }));
  await user.click(screen.getByRole("button", { name: /^L$/ }));
}

describe("ReceiveFlow localization", () => {
  it("renders Turkish empty state without changing stable domain values", () => {
    render(<ReceiveFlow locale="tr" products={[product]} onCancel={vi.fn()} onSave={vi.fn()} />);

    expect(screen.getByText("Hızlı beden bazlı kabul")).toBeInTheDocument();
    expect(screen.getByText("1 · Ürün kodu / Product code")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Kadın" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "0 ürünü kabul et" })).toBeDisabled();
    expect(screen.queryByText("Fast size-based receipt")).not.toBeInTheDocument();
  });

  it("keeps the receipt draft when locale changes", async () => {
    const user = userEvent.setup();
    const props = { products: [product], onCancel: vi.fn(), onSave: vi.fn() };
    const { rerender } = render(<ReceiveFlow locale="en" {...props} />);

    await prepareExistingVariant(user, "en");
    await user.click(screen.getByRole("button", { name: "Save this color and add another" }));
    expect(screen.getByText("Receipt draft · 1 size rows")).toBeInTheDocument();

    rerender(<ReceiveFlow locale="tr" {...props} />);

    expect(screen.getByText("Kabul taslağı · 1 beden satırı")).toBeInTheDocument();
    expect(screen.getByText("Black · L beden")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1 ürünü kabul et" })).toBeEnabled();
  });

  it("finds an existing model by barcode and carries its barcode into the receipt draft", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<ReceiveFlow locale="en" products={[product]} onCancel={vi.fn()} onSave={onSave} />);

    await user.type(screen.getByRole("textbox", { name: /Product code/ }), "869000700001");
    expect(screen.getByDisplayValue("TR07")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Black" }));
    await user.click(screen.getByRole("button", { name: /^L$/ }));
    await user.click(screen.getByRole("button", { name: "Receive 1 item" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith([expect.objectContaining({ code: "TR07", barcode: "869000700001" })]));
  });

  it("locks existing model identity while receiving an additional color", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<ReceiveFlow locale="en" products={[product]} onCancel={vi.fn()} onSave={onSave} />);

    await user.type(screen.getByRole("textbox", { name: /Product code/ }), "TR07");
    expect(screen.getByRole("textbox", { name: /Product code/ })).toHaveAttribute("readonly");
    for (const label of ["Product name", "Brand", "Category", "Supplier", "Model barcode (optional)"]) {
      expect(screen.getByRole("textbox", { name: label })).toHaveAttribute("readonly");
    }
    expect(screen.getByRole("button", { name: "Women" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Men" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Unisex" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Black" }));
    await user.click(screen.getByRole("button", { name: /^L$/ }));
    await user.click(screen.getByRole("button", { name: "Receive 1 item" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith([expect.objectContaining({ code: "TR07", name: "Dress", brand: "Zebra", category: "Dresses", gender: "women", supplier: "Factory", barcode: "869000700001", color: "Black", size: "L" })]));
  });

  it("lets the owner explicitly leave the locked model before entering a different product", async () => {
    const user = userEvent.setup();
    render(<ReceiveFlow locale="en" products={[product]} onCancel={vi.fn()} onSave={vi.fn()} />);

    await user.type(screen.getByRole("textbox", { name: /Product code/ }), "TR07");
    await user.click(screen.getByRole("button", { name: "Choose another product" }));
    const code = screen.getByRole("textbox", { name: /Product code/ });
    expect(code).not.toHaveAttribute("readonly");
    expect(code).toHaveValue("");
  });

  it("preserves a leading-zero alphanumeric product code and keeps a variant barcode on its size row", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<ReceiveFlow locale="en" products={[]} onCancel={vi.fn()} onSave={onSave} />);

    await user.type(screen.getByRole("textbox", { name: /Product code/ }), "0007-Az");
    await user.type(screen.getByPlaceholderText("Silk Midi Dress"), "New Dress");
    await user.type(screen.getByPlaceholderText("Zimmermann"), "Zebra");
    await user.type(screen.getByPlaceholderText("Dresses"), "Dresses");
    await user.type(screen.getByPlaceholderText("PINO"), "PINO");
    await user.type(screen.getByPlaceholderText("0.00"), "20");
    await user.type(screen.getByPlaceholderText("Type or choose a color"), "Black");
    await user.click(screen.getByRole("button", { name: /^S$/ }));
    await user.type(screen.getByRole("textbox", { name: /Variant barcode/ }), "869000700777");
    await user.click(screen.getByRole("button", { name: "Receive 1 item" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith([expect.objectContaining({ code: "0007-Az", variantBarcode: "869000700777", barcode: undefined })]));
  });

  it("keeps a product code unchanged when mobile keyboard dismissal causes blur or Done", async () => {
    const user = userEvent.setup();
    render(<ReceiveFlow locale="en" products={[]} onCancel={vi.fn()} onSave={vi.fn()} />);
    const code = screen.getByRole("textbox", { name: /Product code/ });

    await user.type(code, "0007-Az");
    code.blur();
    fireEvent.change(code, { target: { value: "0007-AzQ" } });
    expect(code).toHaveValue("0007-Az");

    code.focus();
    fireEvent.keyDown(code, { key: "Done" });
    expect(code).toHaveValue("0007-Az");
    expect(document.activeElement).not.toBe(code);
  });

  it("commits a Turkish IME composition without adding a suffix", () => {
    render(<ReceiveFlow locale="tr" products={[]} onCancel={vi.fn()} onSave={vi.fn()} />);
    const code = screen.getByRole("textbox", { name: /Ürün kodu/ });

    fireEvent.compositionStart(code);
    fireEvent.change(code, { target: { value: "0007-İz" }, nativeEvent: { isComposing: true } });
    fireEvent.compositionEnd(code, { data: "z" });

    expect(code).toHaveValue("0007-İz");
  });

  it("rejects a control-character suffix instead of silently saving a different product code", async () => {
    const user = userEvent.setup();
    render(<ReceiveFlow locale="en" products={[]} onCancel={vi.fn()} onSave={vi.fn()} />);
    const code = screen.getByRole("textbox", { name: /Product code/ });

    await user.type(code, "0007-Az");
    fireEvent.change(code, { target: { value: "0007-Az\u200B" } });

    expect(code).toHaveValue("0007-Az");
    expect(screen.getByRole("alert")).toHaveTextContent("Product code contains a non-printing character.");
  });

  it("shows only normalized colour suggestions for the selected model", async () => {
    const user = userEvent.setup();
    const noisy = [{ ...product, color: "black" }, { ...product, id: "variant-2", color: "siyah" }, { ...product, id: "variant-3", color: "Boundary EUR" }, { ...product, id: "variant-4", code: "OTHER", color: "Blue" }];
    render(<ReceiveFlow locale="en" products={noisy} onCancel={vi.fn()} onSave={vi.fn()} />);
    await user.type(screen.getByRole("textbox", { name: /Product code/ }), "TR07");
    expect(screen.getAllByRole("button", { name: "Black" })).toHaveLength(1);
    expect(screen.queryByRole("button", { name: /Boundary/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Blue" })).not.toBeInTheDocument();
  });

  it("shows a localized Turkish save error", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockRejectedValue(new Error("Only an Owner can confirm receipts"));
    render(<ReceiveFlow locale="tr" products={[product]} onCancel={vi.fn()} onSave={onSave} />);

    await prepareExistingVariant(user, "tr");
    await user.click(screen.getByRole("button", { name: "1 ürünü kabul et" }));

    await waitFor(() => expect(screen.getByText("Bu işlem için mağaza erişiminiz yok. Sahip hesabıyla tekrar giriş yapın.")).toBeInTheDocument());
  });

  it("submits all selected size and color matrix lines", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const variants = [
      product,
      { ...product, id: "variant-2", size: "M" },
      { ...product, id: "variant-3", color: "Ivory", size: "S" },
    ];
    render(<ReceiveFlow locale="en" products={variants} onCancel={vi.fn()} onSave={onSave} />);

    await user.type(screen.getByRole("textbox", { name: /Product code/ }), "TR07");
    await user.click(screen.getByRole("button", { name: "Black" }));
    await user.click(screen.getByRole("button", { name: /^L$/ }));
    await user.click(screen.getByRole("button", { name: /^M$/ }));
    await user.click(screen.getByRole("button", { name: "Save this color and add another" }));
    await user.click(screen.getByRole("button", { name: "Ivory" }));
    await user.click(screen.getByRole("button", { name: /^S$/ }));
    await user.click(screen.getByRole("button", { name: "Receive 3 items" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave.mock.calls[0][0]).toEqual([
      expect.objectContaining({ code: "TR07", color: "Black", size: "L", stock: 1 }),
      expect.objectContaining({ code: "TR07", color: "Black", size: "M", stock: 1 }),
      expect.objectContaining({ code: "TR07", color: "Ivory", size: "S", stock: 1 }),
    ]);
  });

  it("keeps the selected quantity visible and explains missing fields for a new product", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<ReceiveFlow locale="en" products={[product]} onCancel={vi.fn()} onSave={onSave} />);

    await user.type(screen.getByRole("textbox", { name: /Product code/ }), "NEW-1");
    await user.type(screen.getByPlaceholderText("Type or choose a color"), "Blue");
    await user.click(screen.getByRole("button", { name: /^S$/ }));

    expect(screen.getByText("1 pcs selected")).toBeInTheDocument();
    expect(screen.getByText(/Gray examples are hints/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Receive 1 item" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Receive 1 item" }));
    expect(onSave).not.toHaveBeenCalled();

    await user.type(screen.getByPlaceholderText("Silk Midi Dress"), "New Dress");
    await user.type(screen.getByPlaceholderText("Zimmermann"), "Zebra");
    await user.type(screen.getByPlaceholderText("Dresses"), "Dresses");
    await user.type(screen.getByPlaceholderText("PINO"), "PINO");
    await user.type(screen.getByPlaceholderText("0.00"), "20");

    expect(screen.queryByText(/Gray examples are hints/)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Receive 1 item" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave.mock.calls[0][0]).toEqual([expect.objectContaining({ code: "NEW-1", color: "Blue", size: "S", stock: 1 })]);
  });
});
