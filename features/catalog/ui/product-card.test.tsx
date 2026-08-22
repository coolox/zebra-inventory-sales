import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";

const product: Product = {
  id: "variant-1",
  code: "TR07",
  name: "Dress",
  brand: "Zebra",
  category: "Dresses",
  gender: "women",
  color: "Black",
  size: "M",
  cost: 40,
  currency: "EUR",
  stock: 2,
  supplier: "Factory",
  store: "clothing",
  updated: "Today",
  photos: ["/products/tr-07/front.png", "/products/tr-07/angle.png"],
};

describe("ProductCard", () => {
  it("renders English product details and actions", () => {
    render(<ProductCard locale="en" variants={[product, { ...product, id: "variant-2", size: "L", stock: 3 }]} onSell={vi.fn()} />);

    expect(screen.getByText("Total stock")).toBeInTheDocument();
    expect(screen.getByText("5 pcs")).toBeInTheDocument();
    expect(screen.getByText("Sell price")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sell this product" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open photo fullscreen" })).toBeInTheDocument();
  });

  it("renders Turkish details, upload copy and aria labels", () => {
    render(<ProductCard locale="tr" variants={[product]} onUploadPhotos={vi.fn()} onSell={vi.fn()} />);

    expect(screen.getByText("Toplam stok")).toBeInTheDocument();
    expect(screen.getAllByText("2 adet")).toHaveLength(2);
    expect(screen.getByText("Satış fiyatı")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fotoğraf ekle" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fotoğrafı tam ekran aç" })).toBeInTheDocument();
    expect(screen.queryByText("Total stock")).not.toBeInTheDocument();
  });

  it("keeps the threshold out of the ordinary card and saves all model details in Edit Product", async () => {
    const user = userEvent.setup();
    const onUpdateDetails = vi.fn().mockResolvedValue(undefined);
    render(<ProductCard locale="en" variants={[product]} canEdit onUpdateDetails={onUpdateDetails} />);
    expect(screen.queryByLabelText("Low-stock threshold")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Edit product" }));
    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Evening dress");
    await user.clear(screen.getByLabelText("Low-stock threshold"));
    await user.type(screen.getByLabelText("Low-stock threshold"), "3");
    await user.clear(screen.getByLabelText("Purchase cost"));
    await user.type(screen.getByLabelText("Purchase cost"), "55");
    await user.selectOptions(screen.getByLabelText("Gender"), "unisex");
    expect(screen.getByText("Applies to all colours and sizes of this Product code; past sales and receipts stay unchanged.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Save details" }));
    await waitFor(() => expect(onUpdateDetails).toHaveBeenCalledWith({ name: "Evening dress", gender: "unisex", lowStockThreshold: 3, purchaseCost: 55, purchaseCurrency: "EUR" }));
  });

  it("supports keyboard navigation, zoom and close in the viewer", async () => {
    const user = userEvent.setup();
    render(<ProductCard locale="en" variants={[product]} />);

    await user.click(screen.getByRole("button", { name: "Open photo fullscreen" }));
    const viewer = screen.getByRole("dialog", { name: "Photo viewer" });
    expect(viewer).toBeInTheDocument();
    expect(within(viewer).getByText("1 / 2")).toBeInTheDocument();

    await user.keyboard("{ArrowRight}");
    expect(within(viewer).getByText("2 / 2")).toBeInTheDocument();
    expect(screen.getByAltText("Dress, enlarged view 2")).toBeInTheDocument();

    await user.keyboard("=");
    expect(within(viewer).getByText("125%")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Photo viewer" })).not.toBeInTheDocument();
  });

  it("navigates the card carousel with its controls", async () => {
    const user = userEvent.setup();
    render(<ProductCard locale="en" variants={[product]} />);

    expect(screen.getByAltText("Dress, view 1")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next photo" }));
    expect(screen.getByAltText("Dress, view 2")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Previous photo" }));
    expect(screen.getByAltText("Dress, view 1")).toBeInTheDocument();
  });

  it("supports horizontal swipe without opening the viewer", () => {
    render(<ProductCard locale="en" variants={[product]} />);
    const photo = screen.getByRole("button", { name: "Open photo fullscreen" });
    fireEvent.pointerDown(photo, { clientX: 180, clientY: 120 });
    fireEvent.pointerUp(photo, { clientX: 90, clientY: 126 });
    expect(screen.getByAltText("Dress, view 2")).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Photo viewer" })).not.toBeInTheDocument();
  });

  it("requires confirmation before removing a photo and keeps retry feedback visible", async () => {
    const user = userEvent.setup();
    const onRemovePhoto = vi.fn().mockRejectedValue(new Error("Storage temporarily unavailable"));
    render(<ProductCard locale="en" variants={[{ ...product, photoPaths: ["store/model/front.png", "store/model/angle.png"] }]} onRemovePhoto={onRemovePhoto} />);
    await user.click(screen.getByRole("button", { name: "Remove this photo" }));
    expect(onRemovePhoto).not.toHaveBeenCalled();
    expect(screen.getByText("Remove this photo from this product? This cannot be undone. Historical sale photos remain protected.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove this photo" }));
    await waitFor(() => expect(onRemovePhoto).toHaveBeenCalledWith("store/model/front.png"));
    expect(screen.getByRole("alert")).toHaveTextContent("Storage temporarily unavailable");
  });

  it("keeps inner viewer interactions open and resets zoom and pan when the photo changes", async () => {
    const user = userEvent.setup();
    render(<ProductCard locale="en" variants={[product]} />);

    await user.click(screen.getByRole("button", { name: "Open photo fullscreen" }));
    const viewer = screen.getByRole("dialog", { name: "Photo viewer" });
    await user.click(within(viewer).getByRole("button", { name: "Zoom in" }));
    const firstImage = screen.getByAltText("Dress, enlarged view 1");
    const panSurface = firstImage.parentElement!;
    Object.defineProperty(panSurface, "setPointerCapture", { configurable: true, value: vi.fn() });

    const pointerDown = new Event("pointerdown", { bubbles: true });
    Object.defineProperties(pointerDown, {
      pointerId: { value: 1 },
      clientX: { value: 10 },
      clientY: { value: 20 },
    });
    const pointerMove = new Event("pointermove", { bubbles: true });
    Object.defineProperties(pointerMove, {
      pointerId: { value: 1 },
      clientX: { value: 35 },
      clientY: { value: 50 },
    });
    fireEvent(panSurface, pointerDown);
    fireEvent(panSurface, pointerMove);
    expect(firstImage).toHaveStyle({ transform: "translate(25px, 30px) scale(1.25)" });
    expect(viewer).toBeInTheDocument();

    await user.click(within(viewer).getByRole("button", { name: "Next photo" }));
    const secondImage = screen.getByAltText("Dress, enlarged view 2");
    expect(within(viewer).getByText("100%")).toBeInTheDocument();
    expect(secondImage).toHaveStyle({ transform: "translate(0px, 0px) scale(1)" });

    fireEvent.mouseDown(secondImage);
    expect(viewer).toBeInTheDocument();
    fireEvent.mouseDown(viewer);
    expect(screen.queryByRole("dialog", { name: "Photo viewer" })).not.toBeInTheDocument();
  });

  it("forwards all selected valid files to the upload callback", async () => {
    const user = userEvent.setup();
    const onUploadPhotos = vi.fn().mockResolvedValue(undefined);
    const { container } = render(<ProductCard locale="en" variants={[product]} onUploadPhotos={onUploadPhotos} />);
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    const files = [
      new File(["jpeg"], "front.jpg", { type: "image/jpeg" }),
      new File(["webp"], "detail.webp", { type: "image/webp" }),
    ];

    await user.upload(input, files);

    await waitFor(() => expect(onUploadPhotos).toHaveBeenCalledWith(files));
  });

  it("localizes upload errors", async () => {
    const user = userEvent.setup();
    const onUploadPhotos = vi.fn().mockRejectedValue(new Error("Each photo must be 8 MB or smaller."));
    const { container } = render(<ProductCard locale="tr" variants={[product]} onUploadPhotos={onUploadPhotos} />);
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();

    await user.upload(input!, new File(["photo"], "photo.png", { type: "image/png" }));

    await waitFor(() => expect(screen.getByText("Her fotoğraf en fazla 8 MB olabilir.")).toBeInTheDocument());
  });

  it("requires confirmation before archiving and shows an archive error", async () => {
    const user = userEvent.setup();
    const onSetArchived = vi.fn().mockRejectedValue(new Error("Only an Owner can archive or restore product models"));
    render(<ProductCard locale="en" variants={[product]} canManageArchive onSetArchived={onSetArchived} />);

    await user.click(screen.getByRole("button", { name: "Archive product" }));
    expect(screen.getByText(/Archive this product/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Archive" }));

    await waitFor(() => expect(onSetArchived).toHaveBeenCalledWith(true));
    expect(screen.getByText("Only an Owner can archive or restore products.")).toBeInTheDocument();
  });

  it("restores an archived product without offering a sell action", async () => {
    const user = userEvent.setup();
    const onSetArchived = vi.fn().mockResolvedValue(undefined);
    render(<ProductCard locale="en" variants={[product]} onSell={vi.fn()} canManageArchive isArchived onSetArchived={onSetArchived} />);

    expect(screen.queryByRole("button", { name: "Sell this product" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Restore product" }));
    expect(onSetArchived).toHaveBeenCalledWith(false);
  });

  it("lets an Owner correct only the product code and keeps the barcode out of the editor", async () => {
    const user = userEvent.setup();
    const onUpdateCode = vi.fn().mockResolvedValue(undefined);
    render(<ProductCard locale="en" variants={[product]} canEdit onUpdateCode={onUpdateCode} />);

    await user.click(screen.getByRole("button", { name: "Edit product" }));
    const codeInput = screen.getByRole("textbox", { name: "Product code" });
    expect(codeInput).toHaveValue("TR07");
    expect(screen.getByText("Barcode is not changed here.")).toBeInTheDocument();
    await user.clear(codeInput);
    await user.type(codeInput, "0007-AZ");
    await user.click(screen.getByRole("button", { name: "Save code" }));

    await waitFor(() => expect(onUpdateCode).toHaveBeenCalledWith("0007-AZ"));
    expect(screen.getByText("Product code updated.")).toBeInTheDocument();
  });

  it("hides product-code editing from a Seller and localizes a duplicate-code error", async () => {
    const user = userEvent.setup();
    const onUpdateCode = vi.fn().mockRejectedValue(new Error('Product code "0007-AZ" is already used in this store'));
    const { rerender } = render(<ProductCard locale="en" variants={[product]} />);
    expect(screen.queryByRole("button", { name: "Edit product" })).not.toBeInTheDocument();

    rerender(<ProductCard locale="tr" variants={[product]} canEdit onUpdateCode={onUpdateCode} />);
    await user.click(screen.getByRole("button", { name: "Ürünü düzenle" }));
    await user.click(screen.getByRole("button", { name: "Kodu kaydet" }));
    await waitFor(() => expect(screen.getByText("Bu ürün kodu bu mağazada zaten kullanılıyor.")).toBeInTheDocument());
  });

  it("sends the selected size variant to movement history", async () => {
    const user = userEvent.setup();
    const onViewHistory = vi.fn();
    render(<ProductCard locale="en" variants={[product, { ...product, id: "variant-2", size: "L" }]} onViewHistory={onViewHistory} />);

    await user.click(screen.getByRole("button", { name: "Movement history" }));
    expect(onViewHistory).toHaveBeenCalledWith(expect.objectContaining({ id: "variant-1", size: "M" }));
    await user.click(screen.getByRole("button", { name: /L/ }));
    await user.click(screen.getByRole("button", { name: "Movement history" }));
    expect(onViewHistory).toHaveBeenLastCalledWith(expect.objectContaining({ id: "variant-2", size: "L" }));
  });
});
