"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Boxes,
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PackageCheck,
  PackagePlus,
  Plus,
  ReceiptText,
  Search,
  Shirt,
  Store,
  Sun,
  Target,
  TrendingUp,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { LowStockCarousel } from "@/components/low-stock-carousel";
import { Modal } from "@/components/modal";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AppHeader } from "@/components/layout/app-header";
import { AppNav } from "@/components/layout/app-nav";
import { Overview } from "@/features/overview/ui/overview";
import { ProductCard } from "@/features/catalog/ui/product-card";
import { setProductModelArchived } from "@/features/catalog/data/archive-product";
import { catalogCopy } from "@/features/catalog/model/catalog-copy";
import { ReceiveFlow } from "@/features/receipts/ui/receive-flow";
import { confirmLiveReceipt } from "@/features/receipts/data/confirm-live-receipt";
import { createDemoReceipt } from "@/features/receipts/model/create-demo-receipt";
import { receiptCopy } from "@/features/receipts/model/receipt-copy";
import type { ReceiptDraft } from "@/features/receipts/model/types";
import { confirmLiveSale } from "@/features/sales/data/confirm-live-sale";
import { loadPaymentRates } from "@/features/sales/data/load-payment-rates";
import { createDemoSale } from "@/features/sales/model/create-demo-sale";
import { demoPaymentRates, type PaymentRateMap } from "@/features/sales/model/payments";
import type { SaleDraftLine, SalePaymentDraft, SalePricingMode } from "@/features/sales/model/types";
import { SaleFlow } from "@/features/sales/ui/sale-flow";
import { SellerGoalCard } from "@/features/seller-goals/ui/seller-goal-card";
import { FxRateManager } from "@/features/exchange-rates/ui/fx-rate-manager";
import { loadMovementHistory } from "@/features/inventory/data/load-movement-history";
import { MovementHistory } from "@/features/inventory/ui/movement-history";
import { AdjustmentForm } from "@/features/inventory/ui/adjustment-form";
import { confirmInventoryAdjustment } from "@/features/inventory/data/confirm-adjustment";
import { setLowStockThreshold } from "@/features/inventory/data/set-low-stock-threshold";
import { confirmInventoryCount } from "@/features/inventory-counts/data/confirm-inventory-count";
import { InventoryCountForm } from "@/features/inventory-counts/ui/inventory-count-form";
import { loadSuppliers, saveSupplier, setSupplierArchived } from "@/features/suppliers/data/suppliers";
import { SupplierManager } from "@/features/suppliers/ui/supplier-manager";
import type { Supplier } from "@/features/suppliers/model/types";
import { inviteSeller } from "@/features/sellers/data/invite-seller";
import { updateSellerStatus } from "@/features/sellers/data/update-seller-status";
import { SellerManager } from "@/features/sellers/ui/seller-manager";
import { AuditLog } from "@/features/audit/ui/audit-log";
import { loadAuditLog } from "@/features/audit/data/load-audit-log";
import type { SellerMembershipStatus } from "@/features/sellers/model/types";
import { selectChartData, selectMetrics, selectSellerRanking } from "@/features/overview/model/metrics";
import { filterInventoryProducts, paginateInventoryProducts } from "@/features/inventory/model/filter-products";
import { isLiveMode as configuredLiveMode } from "@/features/workspace/model/app-mode";
import { createInitialWorkspaceData } from "@/features/workspace/model/workspace-data";
import { loadLiveWorkspace } from "@/features/workspace/data/load-live-workspace";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { uploadProductImages } from "@/lib/product-images";
import { copy, persistLocale, readStoredLocale, type Locale } from "@/lib/i18n";
import { stores } from "@/lib/mock-data";
import type { Activity as ActivityType, Period, Product, Role, Sale, Seller, StoreId } from "@/lib/types";

type StoreFilter = "all" | StoreId;
type ModalName = "sale" | "receive" | "sellers" | "fx" | "activity" | "archived" | "count" | "suppliers" | null;

const storeIcons: Record<StoreId, typeof Shirt> = {
  clothing: Shirt,
  shoes: Shirt,
  bags: BriefcaseBusiness,
};

const initialWorkspaceData = createInitialWorkspaceData();

const money = (value: number, currency = "EUR") =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);

const integer = (value: number) => new Intl.NumberFormat("en-US").format(value);

const getStore = (id: StoreId) => stores.find((store) => store.id === id)!;

function MetricCard({
  label,
  value,
  delta,
  icon: Icon,
  accent = false,
  inverse = false,
}: {
  label: string;
  value: string;
  delta: string;
  icon: typeof Activity;
  accent?: boolean;
  inverse?: boolean;
}) {
  return (
    <article className={`panel metric-glow relative min-w-0 overflow-hidden rounded-2xl p-5 ${accent ? "purple-shadow border-violet-500/30" : ""}`}>
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{label}</p>
          <p className="mt-3 truncate text-[clamp(1.45rem,2.5vw,2rem)] font-semibold tracking-[-0.04em] text-zinc-50">{value}</p>
          <div className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${inverse ? "text-amber-400" : "text-emerald-400"}`}>
            {inverse ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
            <span>{delta}</span>
          </div>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${accent ? "border-violet-400/25 bg-violet-500/15 text-violet-300" : "border-zinc-800 bg-zinc-900 text-zinc-400"}`}>
          <Icon size={19} strokeWidth={1.8} />
        </span>
      </div>
    </article>
  );
}

export default function Home() {
  // Runtime environment values can differ between the Next server and the
  // browser during local debugging. Start in a deterministic demo shell, then
  // enable live mode after hydration so React never compares different trees.
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [role, setRole] = useState<Role>("owner");
  const [selectedStore, setSelectedStore] = useState<StoreFilter>("clothing");
  const [period, setPeriod] = useState<Period>("day");
  const [products, setProducts] = useState<Product[]>(initialWorkspaceData.products);
  const [sales, setSales] = useState<Sale[]>(initialWorkspaceData.sales);
  const [sellers, setSellers] = useState<Seller[]>(initialWorkspaceData.sellers);
  const [activities, setActivities] = useState<ActivityType[]>(initialWorkspaceData.activities);
  const [search, setSearch] = useState("");
  const [inventoryPage, setInventoryPage] = useState(1);
  const [modal, setModal] = useState<ModalName>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [selectedProductCode, setSelectedProductCode] = useState<string | null>(null);
  const [historyVariant, setHistoryVariant] = useState<Product | null>(null);
  const [adjustmentVariant, setAdjustmentVariant] = useState<Product | null>(null);
  const [saleCodePrefill, setSaleCodePrefill] = useState("");
  const [accessLoading, setAccessLoading] = useState(false);
  const [workspaceStatus, setWorkspaceStatus] = useState<"idle" | "loading" | "ready" | "error">("ready");
  const [authenticatedName, setAuthenticatedName] = useState("");
  const [authenticatedUserId, setAuthenticatedUserId] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>("en");
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);
  const [paymentRates, setPaymentRates] = useState<PaymentRateMap>(demoPaymentRates);
  const [supplierDirectory, setSupplierDirectory] = useState<Supplier[]>(() => [...new Set(initialWorkspaceData.products.map((product) => product.supplier))].map((name, index) => ({ id: `demo-supplier-${index}`, name, phone: null, notes: null, isActive: true })));

  useEffect(() => {
    setIsLiveMode(configuredLiveMode);
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem("zebra-theme");
    const next = saved === "light" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    const nextLocale: Locale = readStoredLocale();
    setLocale(nextLocale);
    persistLocale(nextLocale);
    document.documentElement.lang = nextLocale;
  }, []);

  const applyWorkspaceData = (data: Awaited<ReturnType<typeof loadLiveWorkspace>>) => {
    setProducts(data.products);
    setSales(data.sales);
    setSellers(data.sellers);
    setActivities(data.activities);
  };

  const refreshLiveWorkspace = async () => {
    if (!isLiveMode || !activeStoreId) return;
    const data = await loadLiveWorkspace(activeStoreId);
    applyWorkspaceData(data);
    setWorkspaceStatus("ready");
  };

  const refreshPaymentRates = async () => {
    if (!isLiveMode) {
      setPaymentRates(demoPaymentRates);
      return;
    }
    if (!activeStoreId) return;
    try {
      setPaymentRates(await loadPaymentRates());
    } catch {
      setPaymentRates({ EUR: 1, USD: null, TRY: null, RUB: null, GBP: null });
    }
  };

  useEffect(() => {
    if (!isLiveMode || !activeStoreId) return;
    let active = true;
    setWorkspaceStatus("loading");
    setProducts([]);
    setSales([]);
    setSellers([]);
    setActivities([]);
    void loadLiveWorkspace(activeStoreId)
      .then((data) => {
        if (!active) return;
        applyWorkspaceData(data);
        setWorkspaceStatus("ready");
      })
      .catch(() => {
        if (active) setWorkspaceStatus("error");
      });
    return () => { active = false; };
  }, [activeStoreId, isLiveMode]);

  useEffect(() => {
    void refreshPaymentRates();
  }, [activeStoreId, isLiveMode]);

  useEffect(() => {
    if (!isLiveMode) return;

    setAccessLoading(true);

    fetch("/api/session", { cache: "no-store" })
      .then(async (response) => ({ response, body: await response.json() }))
      .then(({ response, body }) => {
        if (!response.ok || !body.memberships?.length) {
          window.location.assign("/access-denied");
          return;
        }
        const membership = body.memberships[0];
        setRole(membership.role === "owner" ? "owner" : "seller");
        setActiveStoreId(membership.store_id);
        setAuthenticatedUserId(body.user?.id || null);
        setAuthenticatedName(body.user?.fullName || "Zebra team member");
        const profileLocale: Locale = body.profile?.locale === "tr" ? "tr" : "en";
        setLocale(profileLocale);
        window.localStorage.setItem("zebra-locale", profileLocale);
        document.documentElement.lang = profileLocale;
        setAccessLoading(false);
      })
      .catch(() => window.location.assign("/access-denied"));
  }, [isLiveMode]);

  const currentSeller = sellers.find((seller) => seller.id === authenticatedUserId) ?? sellers[0] ?? {
    id: authenticatedUserId ?? "current-user",
    name: authenticatedName || "Zebra team member",
    initials: "ZR",
    store: "clothing" as const,
    status: "offline" as const,
    email: "—",
    phone: "—",
  };
  const roleStore: StoreId = "clothing";
  const maxDays = { day: 0, week: 6, month: 30, year: 365 }[period];

  const visibleSales = useMemo(
    () => sales.filter((sale) => sale.store === roleStore && sale.dayOffset <= maxDays && (role === "owner" || sale.sellerId === currentSeller.id)),
    [sales, roleStore, maxDays, role, currentSeller.id],
  );

  const visibleProducts = useMemo(() => filterInventoryProducts(products, roleStore, search), [products, roleStore, search]);
  const archivedProducts = useMemo(
    () => products.filter((product) => product.store === roleStore && product.isActive === false),
    [products, roleStore],
  );
  const inventoryPageSize = 10;
  const { page: safeInventoryPage, pageCount: inventoryPageCount, items: paginatedProducts } = paginateInventoryProducts(visibleProducts, inventoryPage, inventoryPageSize);

  const selectedProductVariants = useMemo(
    () => selectedProductCode ? products.filter((product) => product.code === selectedProductCode && product.store === "clothing") : [],
    [products, selectedProductCode],
  );

  useEffect(() => {
    setInventoryPage(1);
  }, [search, activeStoreId]);

  const metrics = useMemo(() => selectMetrics(visibleSales, visibleProducts), [visibleSales, visibleProducts]);

  const chartData = useMemo(() => {
    return selectChartData(sales, roleStore, role === "owner" ? undefined : currentSeller.id);
  }, [sales, roleStore, role, currentSeller.id]);
  const chartMax = Math.max(...chartData.map((day) => day.value), 1);

  const rankedSellers = useMemo(() => {
    return selectSellerRanking(sellers, sales, selectedStore === "all" ? roleStore : selectedStore, maxDays);
  }, [sellers, sales, selectedStore, maxDays]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const switchRole = (next: Role) => {
    if (isLiveMode) return;
    setRole(next);
    setSelectedStore("clothing");
  };

  const changeLocale = async (next: Locale) => {
    setLocale(next);
    window.localStorage.setItem("zebra-locale", next);
    document.documentElement.lang = next;
    if (isLiveMode) await createSupabaseClient().rpc("update_my_preferences", { preferred_theme: theme, preferred_locale: next });
  };

  const signOut = async () => {
    if (!isLiveMode) return;
    await createSupabaseClient().auth.signOut();
    window.location.assign("/login");
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("zebra-theme", next);
  };

  const completeSale = async (lines: SaleDraftLine[], payments: SalePaymentDraft[], pricingMode: SalePricingMode) => {
    if (!lines.length) return;
    if (isLiveMode) {
      await confirmLiveSale({ storeId: activeStoreId ?? "", lines, payments, products, locale, pricingMode });
      await refreshLiveWorkspace().catch(() => setWorkspaceStatus("error"));
      setModal(null);
      notify(locale === "tr" ? "Satış kaydedildi" : "Sale saved to the staging database");
      return;
    }
    const seller = role === "seller" ? currentSeller : sellers[0] ?? currentSeller;
    const result = createDemoSale(lines, products, seller, locale, new Date(), pricingMode, payments, paymentRates);
    setSales((current) => [...result.sales, ...current]);
    setProducts(result.products);
    setActivities((current) => [result.activity, ...current].slice(0, 6));
    setModal(null);
    notify(locale === "tr"
      ? `${seller.name} adına ${result.totalItems} ürünlük satış kaydedildi`
      : `Sale with ${result.totalItems} items recorded for ${seller.name}`);
  };

  const saveReceipt = async (lines: ReceiptDraft[]) => {
    if (!lines.length) return;
    if (isLiveMode) {
      await confirmLiveReceipt({ storeId: activeStoreId ?? "", lines, locale });
      await refreshLiveWorkspace().catch(() => setWorkspaceStatus("error"));
      setModal(null);
      notify(locale === "tr" ? "Kabul staging veritabanına kaydedildi" : "Receipt saved to the staging database");
      return;
    }
    const result = createDemoReceipt(lines, products);
    setProducts(result.products);
    setActivities((current) => [result.activity, ...current].slice(0, 6));
    setModal(null);
    notify(`${result.totalItems} items received`);
  };

  const addProductPhotos = async (files: File[]) => {
    const modelId = selectedProductVariants[0]?.modelId;
    if (!isLiveMode || !activeStoreId || !modelId) {
      throw new Error("Photo upload is available for saved products in the live catalog.");
    }
    await uploadProductImages({ storeId: activeStoreId, modelId, files });
    await refreshLiveWorkspace().catch(() => setWorkspaceStatus("error"));
    notify(locale === "tr" ? "Fotoğraflar eklendi" : "Photos added to the product card");
  };

  const setSelectedProductArchived = async (archived: boolean) => {
    const model = selectedProductVariants[0];
    if (!model) throw new Error("Product model is unavailable.");
    if (isLiveMode) {
      if (!activeStoreId || !model.modelId) throw new Error("Product model is unavailable.");
      await setProductModelArchived({ storeId: activeStoreId, modelId: model.modelId, archived });
      await refreshLiveWorkspace().catch(() => setWorkspaceStatus("error"));
    } else {
      setProducts((current) => current.map((product) => product.code === model.code ? { ...product, isActive: !archived } : product));
    }
    notify(locale === "tr" ? (archived ? "Ürün arşivlendi" : "Ürün geri yüklendi") : (archived ? "Product archived" : "Product restored"));
  };

  const saveAdjustment = async (delta: number, reason: string) => {
    const variant = adjustmentVariant;
    if (!variant) return;
    if (isLiveMode) {
      if (!activeStoreId || !variant.variantId) throw new Error("Variant is unavailable.");
      await confirmInventoryAdjustment({ storeId: activeStoreId, variantId: variant.variantId, quantityDelta: delta, reason, locale });
      await refreshLiveWorkspace();
    } else {
      setProducts((current) => current.map((product) => product.id === variant.id ? { ...product, stock: product.stock + delta } : product));
    }
    setAdjustmentVariant(null);
    notify(locale === "tr" ? "Stok düzeltmesi kaydedildi" : "Stock adjustment saved");
  };

  const saveInventoryCount = async (lines: { variantId?: string; productId: Product["id"]; countedQuantity: number }[], notes: string) => {
    if (isLiveMode) {
      if (!activeStoreId || lines.some((line) => !line.variantId)) throw new Error("Saved variants are required for a live count.");
      await confirmInventoryCount({ storeId: activeStoreId, lines: lines.map((line) => ({ variantId: line.variantId!, countedQuantity: line.countedQuantity })), notes, locale });
      await refreshLiveWorkspace();
    } else {
      const next = new Map(lines.map((line) => [String(line.productId), line.countedQuantity]));
      setProducts((current) => current.map((product) => next.has(String(product.id)) ? { ...product, stock: next.get(String(product.id))! } : product));
    }
    setModal(null);
    notify(locale === "tr" ? "Stok sayımı onaylandı" : "Inventory count confirmed");
  };

  const refreshSuppliers = async () => {
    if (isLiveMode && activeStoreId) setSupplierDirectory(await loadSuppliers(activeStoreId, true));
  };
  const saveSupplierDirectory = async (values: { supplier?: Supplier; name: string; phone: string; notes: string }) => {
    if (isLiveMode) {
      if (!activeStoreId) throw new Error("Store is unavailable.");
      await saveSupplier({ storeId: activeStoreId, ...values }); await refreshSuppliers();
    } else {
      const id = values.supplier?.id ?? `demo-supplier-${crypto.randomUUID()}`;
      setSupplierDirectory((current) => values.supplier ? current.map((item) => item.id === id ? { ...item, name: values.name.trim(), phone: values.phone || null, notes: values.notes || null } : item) : [...current, { id, name: values.name.trim(), phone: values.phone || null, notes: values.notes || null, isActive: true }]);
    }
  };
  const archiveSupplierDirectory = async (supplier: Supplier) => {
    if (isLiveMode) { if (!activeStoreId) throw new Error("Store is unavailable."); await setSupplierArchived(activeStoreId, supplier.id, supplier.isActive); await refreshSuppliers(); }
    else setSupplierDirectory((current) => current.map((item) => item.id === supplier.id ? { ...item, isActive: !item.isActive } : item));
  };
  const sendSellerInvite = async (values: { fullName: string; email: string; phone: string }) => {
    if (isLiveMode) { if (!activeStoreId) throw new Error("Store is unavailable."); const result = await inviteSeller({ storeId: activeStoreId, ...values }); await refreshLiveWorkspace(); return result; }
    const initials = values.fullName.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join(""); setSellers((current) => [...current, { id: Date.now(), name: values.fullName, initials, store: "clothing", status: "offline", email: values.email, phone: values.phone }]); return { emailSent: false, idempotentReplay: false };
  };
  const setSellerMembershipStatus = async (seller: Seller, status: SellerMembershipStatus) => {
    if (isLiveMode) {
      if (!activeStoreId) throw new Error("Store is unavailable.");
      await updateSellerStatus({ storeId: activeStoreId, sellerId: String(seller.id), status });
      await refreshLiveWorkspace();
      return;
    }
    setSellers((current) => current.map((item) => item.id === seller.id ? { ...item, membershipStatus: status } : item));
  };
  const saveLowStockThreshold = async (threshold: number) => {
    const model = selectedProductVariants[0];
    if (!model) return;
    if (isLiveMode) { if (!activeStoreId || !model.modelId) throw new Error("Product model is unavailable."); await setLowStockThreshold(activeStoreId, model.modelId, threshold); await refreshLiveWorkspace(); }
    else setProducts((current) => current.map((product) => product.code === model.code ? { ...product, lowStockThreshold: threshold } : product));
    notify(locale === "tr" ? "Düşük stok eşiği kaydedildi" : "Low-stock threshold saved");
  };

  const openSale = async (code = "") => {
    setSaleCodePrefill(code);
    await refreshPaymentRates();
    setModal("sale");
  };

  const sellProductFromCard = (code: string) => {
    setSelectedProductCode(null);
    void openSale(code);
  };

  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileNav(false);
  };

  const text = copy[locale];
  const periodLabels: Record<Period, string> = { day: text.today, week: text.week, month: text.month, year: text.year };
  const navItems = [
    { id: "overview", label: text.overview, Icon: LayoutDashboard },
    { id: "inventory", label: text.inventory, Icon: Boxes },
    { id: "sales", label: text.sales, Icon: CircleDollarSign },
    ...(role === "owner" ? [{ id: "team", label: text.team, Icon: Users }] : [{ id: "goal", label: text.myGoal, Icon: Target }]),
  ];

  const displayName = isLiveMode ? authenticatedName || "Zebra team member" : role === "owner" ? "Arslan Zengin" : currentSeller.name;
  const displayInitials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "ZB";

  const nav = <AppNav items={navItems} workspaceLabel={text.workspace} storeLabel="Zebra Boutique" storeMeta={text.clothingActive} onNavigate={jumpTo} onClose={() => setMobileNav(false)} closeLabel={text.close} profile={<div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-[10px] font-bold text-zinc-300">{isLiveMode ? displayInitials : role === "owner" ? "AZ" : currentSeller.initials}</div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-zinc-200">{displayName}</p>
              <p className="text-[10px] text-zinc-600">{role === "owner" ? text.networkOwner : text.sellerClothing}</p>
            </div>
          </div>} />;

  if (isLiveMode && accessLoading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#09090b] text-sm text-zinc-500">Checking secure workspace access…</main>;
  }

  return (
    <DashboardShell nav={nav} mobileOpen={mobileNav} onMobileClose={() => setMobileNav(false)}>
        <AppHeader navigation={<button type="button" onClick={() => setMobileNav(true)} className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 lg:hidden" aria-label={text.workspace}><Menu size={19} /></button>} store={role === "owner" ? <div className="flex h-9 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 text-xs font-medium text-zinc-200"><Store size={14} className="text-zinc-500" /> Zebra Boutique</div> : undefined} controls={<>
            {!isLiveMode && <div className="hidden rounded-lg border border-zinc-800 bg-zinc-900 p-0.5 sm:flex">
              <button type="button" onClick={() => switchRole("owner")} className={`rounded-md px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition ${role === "owner" ? "bg-violet-600 text-white" : "text-zinc-600 hover:text-zinc-300"}`}>{text.owner}</button>
              <button type="button" onClick={() => switchRole("seller")} className={`rounded-md px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition ${role === "seller" ? "bg-violet-600 text-white" : "text-zinc-600 hover:text-zinc-300"}`}>{text.seller}</button>
            </div>}
            <div className="hidden rounded-lg border border-zinc-800 bg-zinc-900 p-0.5 sm:flex" aria-label="Language">
              <button type="button" onClick={() => changeLocale("en")} className={`rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition ${locale === "en" ? "bg-violet-600 text-white" : "text-zinc-600 hover:text-zinc-300"}`}>EN</button>
              <button type="button" onClick={() => changeLocale("tr")} className={`rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition ${locale === "tr" ? "bg-violet-600 text-white" : "text-zinc-600 hover:text-zinc-300"}`}>TR</button>
            </div>
            <button type="button" onClick={() => changeLocale(locale === "en" ? "tr" : "en")} className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 px-2 text-[10px] font-semibold text-zinc-400 transition hover:text-zinc-100 sm:hidden" aria-label="Change language">{locale.toUpperCase()}</button>
            <button type="button" onClick={toggleTheme} className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-500 transition hover:text-violet-400" aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}>{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button>
            <button type="button" className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-500 transition hover:text-zinc-200" aria-label="Notifications">
              <Bell size={17} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-violet-400" />
            </button>
            {isLiveMode ? <button type="button" onClick={signOut} className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-500 transition hover:text-zinc-200" aria-label="Sign out"><LogOut size={16} /></button> : <button type="button" onClick={() => switchRole(role === "owner" ? "seller" : "owner")} className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-[10px] font-bold text-zinc-200 sm:hidden">{role === "owner" ? "AZ" : "ED"}</button>}
        </>} />

        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:py-8 xl:px-8">
          {isLiveMode && workspaceStatus === "loading" && <div className="mb-4 rounded-xl border border-violet-500/20 bg-violet-500/[0.06] px-4 py-3 text-xs text-violet-200">{text.loadingData}</div>}
          {isLiveMode && workspaceStatus === "error" && <div className="mb-4 flex flex-col gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-200 sm:flex-row sm:items-center sm:justify-between"><span>{text.dataError}</span><button type="button" onClick={() => { setWorkspaceStatus("loading"); void refreshLiveWorkspace().catch(() => setWorkspaceStatus("error")); }} className="rounded-lg border border-red-400/25 px-3 py-2 font-semibold text-red-100">{text.retry}</button></div>}
          <section id="overview" className="scroll-mt-24">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                  <span className="h-px w-5 bg-violet-500" />
                  {role === "owner" ? text.networkControl : text.personalShift}
                </div>
                <h1 className="mt-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">{role === "owner" ? text.businessPulse : [text.goodDay, displayName.split(" ")[0]].join(", ")}</h1>
                <p className="mt-1 text-sm text-zinc-600">{role === "owner" ? text.ownerSubtitle : text.sellerSubtitle}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {role === "owner" && <button type="button" onClick={() => setModal("fx")} className="flex h-10 items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 text-xs font-semibold text-zinc-300 transition hover:border-zinc-600 hover:text-white"><CircleDollarSign size={16} /> FX rates</button>}
                <button type="button" onClick={() => setModal("receive")} className="flex h-10 items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 text-xs font-semibold text-zinc-300 transition hover:border-zinc-600 hover:text-white">
                  <PackageCheck size={16} /> {text.receive}
                </button>
                <button type="button" onClick={() => void openSale()} className="purple-shadow flex h-10 items-center gap-2 rounded-lg bg-violet-600 px-4 text-xs font-semibold text-white transition hover:bg-violet-500">
                  <Plus size={16} /> {text.newSale}
                </button>
              </div>
            </div>

            <div className="mt-7 flex w-fit rounded-lg border border-zinc-800 bg-zinc-900/70 p-0.5">
              {(Object.keys(periodLabels) as Period[]).map((item) => (
                <button key={item} type="button" onClick={() => setPeriod(item)} className={`rounded-md px-3 py-1.5 text-[11px] font-medium transition ${period === item ? "bg-zinc-700/80 text-zinc-100" : "text-zinc-600 hover:text-zinc-300"}`}>{periodLabels[item]}</button>
              ))}
            </div>

            <Overview role={role} period={period} metrics={metrics} chartData={chartData} rankedSellers={rankedSellers} products={visibleProducts} live={isLiveMode} onManageTeam={() => setModal("sellers")} labels={{ revenue: text.revenue, sales: text.salesMetric, grossMargin: text.grossMargin, myResult: text.myResult, unitsShort: text.unitsShort, todayDelta: text.todayDelta, periodDelta: text.periodDelta, itemsDelta: text.itemsDelta, ofRevenue: text.ofRevenue, salesTrend: text.salesTrend, lastSevenDays: text.lastSevenDays, sellerResults: text.sellerResults, revenueRanking: text.revenueRanking, manage: text.manage }} />
          </section>

          <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.75fr)]">
            <article id="inventory" className="panel min-w-0 scroll-mt-24 overflow-hidden rounded-2xl">
              <div className="flex flex-col gap-4 border-b border-zinc-800/80 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <p className="text-sm font-semibold">{text.stock}</p>
                  <div className="mt-1 flex items-center gap-2"><p className="text-xs text-zinc-600">{integer(metrics.units)} {text.units} · {visibleProducts.length} SKU</p>{role === "owner" && archivedProducts.length > 0 && <button type="button" onClick={() => setModal("archived")} className="text-[10px] font-semibold text-violet-400 transition hover:text-violet-300">{locale === "tr" ? `Arşiv (${archivedProducts.length})` : `Archived (${archivedProducts.length})`}</button>}</div>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">{role === "owner" && <div className="grid grid-cols-2 gap-2 sm:contents"><button type="button" onClick={() => { void refreshSuppliers(); setModal("suppliers"); }} className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-[10px] font-semibold text-zinc-300 transition hover:border-violet-500/50 hover:text-white"><Store size={13} /> {locale === "tr" ? "Tedarikçi" : "Suppliers"}</button><button type="button" onClick={() => setModal("count")} className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-[10px] font-semibold text-zinc-300 transition hover:border-violet-500/50 hover:text-white"><Boxes size={14} /> {locale === "tr" ? "Sayım" : "Count stock"}</button></div>}<div className="relative w-full sm:w-72">
                  <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input value={search} onChange={(event) => { setSearch(event.target.value); setInventoryPage(1); }} placeholder={text.search} className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-9 pr-3 text-xs text-zinc-200 outline-none placeholder:text-zinc-700 focus:border-violet-500" />
                </div></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-zinc-800/70 text-[9px] uppercase tracking-[0.14em] text-zinc-600">
                      <th className="px-6 py-3 font-semibold">{text.product}</th>
                      <th className="px-4 py-3 font-semibold">{text.store}</th>
                      <th className="px-4 py-3 font-semibold">{text.sizeColor}</th>
                      <th className="px-4 py-3 font-semibold">{text.supplier}</th>
                      <th className="px-4 py-3 text-right font-semibold">{text.purchase}</th>
                      <th className="px-6 py-3 text-right font-semibold">{text.onHand}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.map((product) => {
                      const Icon = storeIcons[product.store];
                      return (
                        <tr key={product.id} role="button" tabIndex={0} onClick={() => setSelectedProductCode(product.code)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedProductCode(product.code); }} className="cursor-pointer border-b border-zinc-800/55 transition last:border-0 hover:bg-zinc-900/55 focus:bg-violet-500/[0.06] focus:outline-none">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-500">{product.photos?.[0] ? <img src={product.photos[0]} alt="" className="h-full w-full object-cover" /> : <Icon size={16} />}</span>
                              <div><p className="text-xs font-medium text-zinc-200">{product.name}</p><p className="mt-1 text-[10px] font-medium text-zinc-600">{product.brand} · {product.code}</p></div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-[11px] text-zinc-500">{getStore(product.store).short}</td>
                          <td className="px-4 py-4"><p className="text-[11px] text-zinc-300">{product.size}</p><p className="mt-1 text-[10px] text-zinc-600">{product.color}</p></td>
                          <td className="px-4 py-4 text-[11px] text-zinc-500">{product.supplier}</td>
                          <td className="px-4 py-4 text-right text-[11px] font-medium text-zinc-300">{product.cost} {product.currency}</td>
                          <td className="px-6 py-4 text-right"><span className={`inline-flex min-w-12 justify-center rounded-md border px-2 py-1 text-[10px] font-semibold ${product.stock <= 2 ? "border-amber-500/25 bg-amber-500/10 text-amber-300" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"}`}>{product.stock} pcs</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {!visibleProducts.length && <div className="px-6 py-14 text-center text-xs text-zinc-600">{text.noResults}</div>}
              </div>
              {visibleProducts.length > inventoryPageSize && <div className="flex items-center justify-between border-t border-zinc-800/80 px-5 py-3 sm:px-6"><p className="text-[10px] text-zinc-600">{(safeInventoryPage - 1) * inventoryPageSize + 1}–{Math.min(safeInventoryPage * inventoryPageSize, visibleProducts.length)} of {visibleProducts.length} SKU</p><div className="flex items-center gap-2"><button type="button" onClick={() => setInventoryPage((page) => Math.max(1, page - 1))} disabled={safeInventoryPage === 1} className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 disabled:opacity-35"><ChevronLeft size={15} /></button><span className="min-w-12 text-center text-[10px] font-semibold text-zinc-400">{safeInventoryPage} / {inventoryPageCount}</span><button type="button" onClick={() => setInventoryPage((page) => Math.min(inventoryPageCount, page + 1))} disabled={safeInventoryPage === inventoryPageCount} className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 disabled:opacity-35"><ChevronRight size={15} /></button></div></div>}
            </article>

            <article className="panel rounded-2xl p-5 sm:p-6">
              <div className="flex items-start justify-between">
                <div><p className="text-sm font-semibold">{text.activity}</p><p className="mt-1 text-xs text-zinc-600">{text.recentOperations}</p></div>
                <Activity size={17} className="text-zinc-700" />
              </div>
              <div className="mt-5 space-y-1">
                {activities.slice(0, 5).map((item, index) => {
                  const Icon = item.type === "sale" ? CircleDollarSign : item.type === "receipt" ? PackagePlus : Boxes;
                  return (
                    <div key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
                      {index < activities.slice(0, 5).length - 1 && <span className="absolute left-[15px] top-8 h-[calc(100%-28px)] w-px bg-zinc-800" />}
                      <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${item.type === "sale" ? "border-violet-500/20 bg-violet-500/10 text-violet-400" : "border-zinc-800 bg-zinc-900 text-zinc-500"}`}><Icon size={14} /></span>
                      <div className="min-w-0 flex-1 pt-0.5"><div className="flex justify-between gap-3"><p className="truncate text-[11px] font-medium text-zinc-300">{item.title}</p>{item.amount !== undefined && <span className="shrink-0 text-[11px] font-semibold text-zinc-200">+{item.converted ? "≈" : ""}{money(item.amount, item.currency)}</span>}</div><p className="mt-1 truncate text-[10px] text-zinc-600">{item.meta}</p></div>
                    </div>
                  );
                })}
              </div>
              <button type="button" onClick={() => setModal("activity")} className="mt-5 w-full rounded-lg border border-zinc-800 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500 transition hover:border-zinc-700 hover:text-zinc-300">{text.allActivity}</button>
            </article>
          </section>

          <footer className="mt-8 flex flex-col gap-2 border-t border-zinc-900 py-5 text-[10px] text-zinc-700 sm:flex-row sm:items-center sm:justify-between">
            <p>{isLiveMode ? text.liveWorkspace : text.localDemo}</p>
            <p>{isLiveMode ? text.liveNotice : text.mockNotice}</p>
          </footer>
        </main>

      {toast && <div className="fade-up fixed bottom-5 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-xl border border-emerald-500/25 bg-[#121713] px-4 py-3 text-xs font-medium text-emerald-300 shadow-2xl"><Check size={15} />{toast}</div>}

      {modal === "sale" && (
        <Modal title={locale === "tr" ? "Yeni satış" : "New sale"} eyebrow={locale === "tr" ? "Satış işlemi" : "Sale operation"} onClose={() => setModal(null)} wide>
          <SaleFlow key={`sale-${saleCodePrefill}`} locale={locale} paymentRates={paymentRates} initialCode={saleCodePrefill} products={products.filter((product) => product.isActive !== false)} sellerName={isLiveMode ? displayName : role === "seller" ? currentSeller.name : sellers[0]?.name ?? displayName} onCancel={() => setModal(null)} onComplete={completeSale} />
        </Modal>
      )}

      {modal === "receive" && (
        <Modal title={receiptCopy[locale].dialogTitle} eyebrow={receiptCopy[locale].dialogEyebrow} onClose={() => setModal(null)} wide>
          <ReceiveFlow locale={locale} products={products.filter((product) => product.isActive !== false)} onCancel={() => setModal(null)} onSave={saveReceipt} />
        </Modal>
      )}

      {modal === "fx" && role === "owner" && (
        <Modal title={locale === "tr" ? "Döviz kurları" : "Exchange rates"} eyebrow={locale === "tr" ? "Sahip ayarları" : "Owner settings"} onClose={() => setModal(null)}>
          <FxRateManager locale={locale} onClose={() => setModal(null)} />
        </Modal>
      )}

      {modal === "activity" && role === "owner" && isLiveMode && (
        <Modal title="Audit log" eyebrow="Owner-only store history" onClose={() => setModal(null)} wide><AuditLog load={(page, category) => activeStoreId ? loadAuditLog(activeStoreId, { page, categories: category ? [category] : undefined }) : Promise.resolve({ items: [], page, pageSize: 25, hasMore: false })} /></Modal>
      )}
      {modal === "activity" && (!isLiveMode || role !== "owner") && (
        <Modal title="All activity" eyebrow="Store history" onClose={() => setModal(null)}>
          <div className="divide-y divide-zinc-800/70 p-5 sm:p-7">{activities.length ? activities.map((item) => { const Icon = item.type === "sale" ? CircleDollarSign : item.type === "receipt" ? PackagePlus : Boxes; return <div key={item.id} className="flex gap-3 py-4 first:pt-0"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${item.type === "sale" ? "border-violet-500/20 bg-violet-500/10 text-violet-400" : "border-zinc-800 bg-zinc-900 text-zinc-500"}`}><Icon size={15} /></span><div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><p className="truncate text-xs font-medium text-zinc-200">{item.title}</p>{item.amount !== undefined && <span className="shrink-0 text-xs font-semibold text-zinc-100">+{item.converted ? "≈" : ""}{money(item.amount, item.currency)}</span>}</div><p className="mt-1 text-[11px] text-zinc-600">{item.meta}</p></div></div>; }) : <p className="py-10 text-center text-xs text-zinc-600">No operations yet.</p>}</div>
        </Modal>
      )}

      {historyVariant && (
        <Modal title={locale === "tr" ? "Stok hareketleri" : "Stock movements"} eyebrow={`${historyVariant.name} · ${historyVariant.color} / ${historyVariant.size}`} onClose={() => { setSelectedProductCode(historyVariant.code); setHistoryVariant(null); }}>
          <MovementHistory locale={locale} loadHistory={() => isLiveMode && activeStoreId && historyVariant.variantId ? loadMovementHistory({ storeId: activeStoreId, variantId: historyVariant.variantId }) : Promise.resolve([])} />
        </Modal>
      )}

      {adjustmentVariant && role === "owner" && (
        <Modal title={locale === "tr" ? "Stok düzeltme" : "Stock adjustment"} eyebrow={`${adjustmentVariant.name} · ${adjustmentVariant.color} / ${adjustmentVariant.size}`} onClose={() => setAdjustmentVariant(null)}>
          <AdjustmentForm locale={locale} currentStock={adjustmentVariant.stock} onConfirm={saveAdjustment} />
        </Modal>
      )}

      {modal === "count" && role === "owner" && (
        <Modal title={locale === "tr" ? "Başlangıç stok sayımı" : "Initial inventory count"} eyebrow={locale === "tr" ? "Sahip kontrolü" : "Owner control"} onClose={() => setModal(null)} wide>
          <InventoryCountForm locale={locale} products={visibleProducts} onConfirm={saveInventoryCount} />
        </Modal>
      )}

      {modal === "suppliers" && role === "owner" && (
        <Modal title={locale === "tr" ? "Tedarikçiler" : "Suppliers"} eyebrow={locale === "tr" ? "Mağaza rehberi" : "Store directory"} onClose={() => setModal(null)} wide>
          <SupplierManager suppliers={supplierDirectory} onSave={saveSupplierDirectory} onArchive={archiveSupplierDirectory} />
        </Modal>
      )}

      {modal === "sellers" && role === "owner" && (
        <Modal title={locale === "tr" ? "Satıcı ekibi" : "Seller team"} eyebrow={locale === "tr" ? "Mağaza erişimi" : "Store access"} onClose={() => setModal(null)} wide>
          <SellerManager locale={locale} role={role} sellers={sellers} onInvite={sendSellerInvite} onSetStatus={setSellerMembershipStatus} />
        </Modal>
      )}

      {modal === "archived" && role === "owner" && (
        <Modal title={locale === "tr" ? "Arşivlenen ürünler" : "Archived products"} eyebrow={catalogCopy[locale].productDetails} onClose={() => setModal(null)}>
          <div className="divide-y divide-zinc-800/70 p-5 sm:p-7">{archivedProducts.length ? [...new Map(archivedProducts.map((product) => [product.code, product])).values()].map((product) => <button key={product.code} type="button" onClick={() => { setModal(null); setSelectedProductCode(product.code); }} className="flex w-full items-center justify-between gap-4 py-4 text-left first:pt-0 last:pb-0"><span><span className="block text-xs font-medium text-zinc-200">{product.name}</span><span className="mt-1 block font-mono text-[10px] text-zinc-600">{product.brand} · {product.code}</span></span><span className="rounded-md border border-violet-500/25 bg-violet-500/10 px-2 py-1 text-[10px] font-semibold text-violet-200">{locale === "tr" ? "Geri yükle" : "Restore"}</span></button>) : <p className="py-8 text-center text-xs text-zinc-600">{locale === "tr" ? "Arşivlenen ürün yok." : "No archived products."}</p>}</div>
        </Modal>
      )}

      {selectedProductVariants.length > 0 && (
        <Modal title={selectedProductVariants[0].name} eyebrow={catalogCopy[locale].productDetails} onClose={() => setSelectedProductCode(null)} wide>
        <ProductCard locale={locale} variants={selectedProductVariants} onUploadPhotos={isLiveMode ? addProductPhotos : undefined} onSell={sellProductFromCard} canManageArchive={role === "owner"} isArchived={selectedProductVariants[0].isActive === false} onSetArchived={setSelectedProductArchived} onViewHistory={(variant) => { setHistoryVariant(variant); setSelectedProductCode(null); }} onAdjust={role === "owner" ? (variant) => { setAdjustmentVariant(variant); setSelectedProductCode(null); } : undefined} onSetLowStockThreshold={role === "owner" ? saveLowStockThreshold : undefined} />
        </Modal>
      )}

    </DashboardShell>
  );
}
