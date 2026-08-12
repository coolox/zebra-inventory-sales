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

  it("confirms a saved low-stock threshold", async () => {
    const user = userEvent.setup();
    const onSetLowStockThreshold = vi.fn().mockResolvedValue(undefined);
    render(<ProductCard locale="en" variants={[product]} onSetLowStockThreshold={onSetLowStockThreshold} />);
    await user.clear(screen.getByLabelText("Low-stock threshold"));
    await user.type(screen.getByLabelText("Low-stock threshold"), "3");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(onSetLowStockThreshold).toHaveBeenCalledWith(3));
    expect(screen.getByRole("button", { name: "Saved" })).toBeInTheDocument();
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
