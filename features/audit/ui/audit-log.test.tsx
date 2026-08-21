import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AuditLog } from "./audit-log";

describe("AuditLog localization", () => {
  it("translates visible categories and empty state while keeping category query keys internal", async () => {
    const load = vi.fn().mockResolvedValue({ items: [], hasMore: false });
    render(<AuditLog locale="tr" load={load} />);

    expect(await screen.findByText("Bu filtreyle eşleşen denetim kaydı yok.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Satış" })).toBeInTheDocument();
    expect(screen.getByLabelText("İşlemi yapan")).toHaveTextContent("Tüm işlemi yapanlar");
    expect(screen.getByLabelText("Kayıt")).toHaveTextContent("Tüm kayıt türleri");
    expect(screen.getByLabelText("Tarih")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Önceki" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Sonraki" })).toBeDisabled();
    await screen.getByRole("button", { name: "Satış" }).click();
    expect(load).toHaveBeenLastCalledWith(1, "sale");
  });

  it("only enables navigation for a real non-empty next page and returns from the last page", async () => {
    const user = userEvent.setup();
    const firstPage = { items: [{ id: "1", action: "sale.confirmed", category: "sale" as const, entityType: "sale", entityId: "sale-1", actorName: "Owner", createdAt: "2026-08-13T10:00:00Z", details: {} }], hasMore: true };
    const lastPage = { items: [{ ...firstPage.items[0], id: "2", action: "sale.cancelled" }], hasMore: false };
    const load = vi.fn().mockResolvedValueOnce(firstPage).mockResolvedValueOnce(lastPage).mockResolvedValue(firstPage);
    render(<AuditLog locale="en" load={load} />);

    expect(await screen.findByText("Sale confirmed")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText("Sale cancelled")).toBeInTheDocument();
    expect(screen.getByText("2", { exact: true })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Previous" }));
    await waitFor(() => expect(load).toHaveBeenLastCalledWith(1, undefined));
  });

  it("resets actor, entity, date and category filters to the first page without allowing an empty continuation", async () => {
    const user = userEvent.setup();
    const firstPage = { items: [
      { id: "1", action: "sale.confirmed", category: "sale" as const, entityType: "sale", entityId: "sale-1", actorName: "Owner", createdAt: "2026-08-13T10:00:00Z", details: {} },
      { id: "2", action: "receipt.confirmed", category: "receipt" as const, entityType: "receipt", entityId: "receipt-1", actorName: "Seller", createdAt: "2026-08-12T10:00:00Z", details: {} },
    ], hasMore: true };
    const secondPage = { items: [{ ...firstPage.items[0], id: "3", action: "sale.adjusted" }], hasMore: true };
    const load = vi.fn().mockResolvedValue(firstPage).mockResolvedValueOnce(firstPage).mockResolvedValueOnce(secondPage);
    render(<AuditLog locale="en" load={load} />);

    await screen.findByText("Sale confirmed");
    await user.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByText("Sale adjusted");
    await user.selectOptions(screen.getByLabelText("Actor"), "Owner");
    await waitFor(() => expect(load).toHaveBeenLastCalledWith(1, undefined));
    expect(screen.getByText("1", { exact: true })).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Record"), "sale");
    expect(screen.getByText("1", { exact: true })).toBeInTheDocument();
    await user.type(screen.getByLabelText("Date"), "08/13/2026");
    expect(screen.getByText("1", { exact: true })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Sale" }));
    await waitFor(() => expect(load).toHaveBeenLastCalledWith(1, "sale"));

    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "2026-08-14" } });
    expect(screen.getByText("No audit events match this filter.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  });

  it("ignores a stale page response after a filter reset", async () => {
    const user = userEvent.setup();
    const firstPage = { items: [{ id: "1", action: "sale.confirmed", category: "sale" as const, entityType: "sale", entityId: "sale-1", actorName: "Owner", createdAt: "2026-08-13T10:00:00Z", details: {} }], hasMore: true };
    let resolvePageTwo: ((value: { items: typeof firstPage.items; hasMore: boolean }) => void) | undefined;
    let resolveSaleFilter: ((value: { items: typeof firstPage.items; hasMore: boolean }) => void) | undefined;
    const load = vi.fn((page: number, category?: string) => {
      if (page === 1 && !category) return Promise.resolve(firstPage);
      if (page === 2) return new Promise<{ items: typeof firstPage.items; hasMore: boolean }>((resolve) => { resolvePageTwo = resolve; });
      return new Promise<{ items: typeof firstPage.items; hasMore: boolean }>((resolve) => { resolveSaleFilter = resolve; });
    });
    render(<AuditLog locale="en" load={load} />);

    await screen.findByText("Sale confirmed");
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Sale" }));
    await waitFor(() => expect(resolveSaleFilter).toBeTypeOf("function"));
    resolveSaleFilter?.({ items: [{ ...firstPage.items[0], id: "filtered", action: "sale.filtered" }], hasMore: false });
    expect(await screen.findByText("Sale filtered")).toBeInTheDocument();
    resolvePageTwo?.({ items: [{ ...firstPage.items[0], id: "stale", action: "sale.stale" }], hasMore: true });
    await waitFor(() => expect(screen.queryByText("Sale updated")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("filters loaded audit records and never renders sensitive metadata", async () => {
    const user = userEvent.setup();
    const load = vi.fn().mockResolvedValue({ items: [
      { id: "1", action: "sale.confirmed", category: "sale", entityType: "sale", entityId: "sale-1", actorName: "Owner", createdAt: "2026-08-13T10:00:00Z", details: { source: "web", email: "hidden@example.test", token: "hidden" } },
      { id: "2", action: "receipt.confirmed", category: "receipt", entityType: "receipt", entityId: "receipt-1", actorName: "Seller", createdAt: "2026-08-12T10:00:00Z", details: {} },
    ], hasMore: true });
    render(<AuditLog locale="en" load={load} />);

    expect(await screen.findByText("Sale confirmed")).toBeInTheDocument();
    expect(screen.getByText("Web app")).toBeInTheDocument();
    expect(screen.queryByText("hidden@example.test")).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Actor"), "Seller");
    expect(screen.queryByText("Sale confirmed")).not.toBeInTheDocument();
    expect(screen.getByText("Receipt confirmed")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(load).toHaveBeenLastCalledWith(2, undefined);
  });

  it("renders Turkish business labels while keeping raw evidence on demand", async () => {
    const load = vi.fn().mockResolvedValue({ items: [{ id: "1", action: "sale.confirmed", category: "sale" as const, entityType: "sale", entityId: "sale-1", actorName: "Taylan", createdAt: "2026-08-13T10:00:00Z", details: { source: "web", pricing_mode: "per_item" } }], hasMore: false });
    render(<AuditLog locale="tr" load={load} />);

    expect(await screen.findByText("Satış onaylandı")).toBeInTheDocument();
    expect(screen.getByText("Web uygulaması")).toBeInTheDocument();
    expect(screen.getByText("Ürün başına fiyat")).toBeInTheDocument();
    const technical = screen.getByText("Teknik referans").closest("details");
    expect(technical).not.toBeNull();
    expect(technical).not.toHaveAttribute("open");
    expect(technical).toHaveTextContent("sale.confirmed");
  });
});
