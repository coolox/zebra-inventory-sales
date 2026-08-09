"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
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
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { LowStockCarousel } from "@/components/low-stock-carousel";
import { ProductCard } from "@/components/product-card";
import { ReceiveFlow, type ReceiptDraft } from "@/components/receive-flow";
import { SaleFlow, type PaymentMethod, type SaleDraftLine } from "@/components/sale-flow";
import { SellerGoalCard } from "@/components/seller-goal-card";
import { FxRateManager } from "@/components/fx-rate-manager";
import { isLiveMode } from "@/features/workspace/model/app-mode";
import { createInitialWorkspaceData } from "@/features/workspace/model/workspace-data";
import { loadLiveWorkspace } from "@/features/workspace/data/load-live-workspace";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { uploadProductImages } from "@/lib/product-images";
import { copy, type Locale } from "@/lib/i18n";
import { stores } from "@/lib/mock-data";
import type { Activity as ActivityType, Period, Product, Role, Sale, Seller, StoreId } from "@/lib/types";

type StoreFilter = "all" | StoreId;
type ModalName = "sale" | "receive" | "sellers" | "fx" | "activity" | null;

const storeIcons: Record<StoreId, typeof Shirt> = {
  clothing: Shirt,
  shoes: Shirt,
  bags: BriefcaseBusiness,
};

const fxToEur: Record<SaleDraftLine["currency"], number> = {
  EUR: 1,
  USD: 0.93,
  TRY: 0.028,
  RUB: 0.011,
  GBP: 1.17,
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

function Modal({ title, eyebrow, onClose, children, wide = false }: { title: string; eyebrow: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`fade-up max-h-[94vh] w-full overflow-y-auto rounded-t-[1.5rem] border border-zinc-800 bg-[#111114] shadow-2xl sm:rounded-[1.5rem] ${wide ? "max-w-3xl" : "max-w-xl"}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-zinc-800/80 bg-[#111114]/95 px-5 py-5 backdrop-blur sm:px-7">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">{eyebrow}</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-500 transition hover:border-zinc-700 hover:text-white" aria-label="Close">
            <X size={18} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

export default function Home() {
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
  const [saleCodePrefill, setSaleCodePrefill] = useState("");
  const [newSeller, setNewSeller] = useState({ name: "", email: "", phone: "" });
  const [accessLoading, setAccessLoading] = useState(isLiveMode);
  const [workspaceStatus, setWorkspaceStatus] = useState<"idle" | "loading" | "ready" | "error">(isLiveMode ? "idle" : "ready");
  const [authenticatedName, setAuthenticatedName] = useState("");
  const [authenticatedUserId, setAuthenticatedUserId] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>("en");
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("zebra-theme");
    const next = saved === "light" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    const savedLocale = window.localStorage.getItem("zebra-locale");
    const nextLocale: Locale = savedLocale === "tr" ? "tr" : "en";
    setLocale(nextLocale);
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
  }, [activeStoreId]);

  useEffect(() => {
    if (!isLiveMode) return;

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
  }, []);

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

  const visibleProducts = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return products.filter((product) => {
      const storeMatch = product.store === roleStore;
      const searchMatch = !needle || [product.code, product.name, product.brand, product.size, product.color, product.supplier].some((value) => String(value).toLowerCase().includes(needle));
      return storeMatch && searchMatch;
    });
  }, [products, roleStore, search]);
  const inventoryPageSize = 10;
  const inventoryPageCount = Math.max(1, Math.ceil(visibleProducts.length / inventoryPageSize));
  const safeInventoryPage = Math.min(inventoryPage, inventoryPageCount);
  const paginatedProducts = visibleProducts.slice((safeInventoryPage - 1) * inventoryPageSize, safeInventoryPage * inventoryPageSize);

  const selectedProductVariants = useMemo(
    () => selectedProductCode ? products.filter((product) => product.code === selectedProductCode && product.store === "clothing") : [],
    [products, selectedProductCode],
  );

  useEffect(() => {
    setInventoryPage(1);
  }, [search, activeStoreId]);

  const metrics = useMemo(() => {
    const revenue = visibleSales.reduce((sum, sale) => sum + sale.revenueEur, 0);
    const margin = visibleSales.reduce((sum, sale) => sum + sale.marginEur, 0);
    const units = visibleProducts.reduce((sum, product) => sum + product.stock, 0);
    const low = visibleProducts.filter((product) => product.stock <= 2).length;
    return { revenue, margin, units, low, count: visibleSales.reduce((sum, sale) => sum + sale.quantity, 0) };
  }, [visibleSales, visibleProducts]);

  const chartData = useMemo(() => {
    const labels = ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Today"];
    return labels.map((label, index) => {
      const offset = 6 - index;
      const total = sales
        .filter((sale) => sale.dayOffset === offset && sale.store === roleStore && (role === "owner" || sale.sellerId === currentSeller.id))
        .reduce((sum, sale) => sum + sale.revenueEur, 0);
      return { label, value: total };
    });
  }, [sales, roleStore, role, currentSeller.id]);
  const chartMax = Math.max(...chartData.map((day) => day.value), 1);

  const rankedSellers = useMemo(() => {
    return sellers
      .filter((seller) => selectedStore === "all" || seller.store === selectedStore)
      .map((seller) => {
        const sellerSales = sales.filter((sale) => sale.sellerId === seller.id && sale.store === "clothing" && sale.dayOffset <= maxDays);
        return {
          ...seller,
          revenue: sellerSales.reduce((sum, sale) => sum + sale.revenueEur, 0),
          count: sellerSales.reduce((sum, sale) => sum + sale.quantity, 0),
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
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

  const completeSale = async (lines: SaleDraftLine[], paymentMethod: PaymentMethod = "cash") => {
    if (!lines.length) return;
    if (isLiveMode) {
      if (!activeStoreId) throw new Error("Missing store membership.");
      const saleLines = lines.map((line) => {
        const product = products.find((item) => item.id === line.productId);
        if (!product?.variantId) throw new Error("Selected product is no longer available. Refresh the catalog and try again.");
        return { variant_id: product.variantId, quantity: line.quantity, unit_price: line.price, currency: line.currency };
      });
      const { error } = await createSupabaseClient().rpc("confirm_sale_with_payment", {
        p_store_id: activeStoreId,
        p_lines: saleLines,
        p_payment_method: paymentMethod,
        p_idempotency_key: crypto.randomUUID(),
      });
      if (error) {
        if (/Insufficient stock/i.test(error.message)) throw new Error("This size has just sold out. Refresh the catalog and try again.");
        if (/exchange rate/i.test(error.message)) throw new Error("Today’s exchange rate for this sale currency is missing. Ask the Owner to save it first.");
        throw new Error("Sale could not be saved. Please try again.");
      }
      await refreshLiveWorkspace().catch(() => setWorkspaceStatus("error"));
      setModal(null);
      notify(locale === "tr" ? "Satış kaydedildi" : "Sale saved to the staging database");
      return;
    }
    const stamp = Date.now();
    const seller = role === "seller" ? currentSeller : sellers[0] ?? currentSeller;
    const time = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    const created = lines.flatMap((line, index) => {
      const product = products.find((item) => item.id === line.productId);
      if (!product || product.stock < line.quantity) return [];
      const revenueEur = line.price * line.quantity * fxToEur[line.currency];
      const costEur = product.cost * line.quantity * fxToEur[product.currency];
      const sale: Sale = {
        id: stamp + index,
        productId: product.id,
        sellerId: seller.id,
        seller: seller.name,
        store: "clothing",
        product: product.name,
        code: product.code,
        size: product.size,
        quantity: line.quantity,
        revenueEur: Math.round(revenueEur),
        marginEur: Math.round(revenueEur - costEur),
        dayOffset: 0,
        time,
      };
      return [sale];
    });
    if (!created.length) return;
    setSales((current) => [...created, ...current]);
    setProducts((current) => current.map((product) => {
      const sold = lines.filter((line) => line.productId === product.id).reduce((sum, line) => sum + line.quantity, 0);
      return sold ? { ...product, stock: Math.max(0, product.stock - sold), updated: "Just now" } : product;
    }));
    const totalItems = created.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalEur = created.reduce((sum, sale) => sum + sale.revenueEur, 0);
    const saleActivity: ActivityType = { id: stamp, type: "sale", title: `Sale · ${totalItems} items`, meta: `${seller.name} · Zebra Boutique · just now`, amount: totalEur };
    setActivities((current) => [saleActivity, ...current].slice(0, 6));
    setModal(null);
    notify(`Sale with ${totalItems} items recorded for ${seller.name}`);
  };

  const saveReceipt = async (lines: ReceiptDraft[]) => {
    if (!lines.length) return;
    if (isLiveMode) {
      if (!activeStoreId) throw new Error("Missing store membership");
      const first = lines[0];
      const gender = first.gender;
      const { error } = await createSupabaseClient().rpc("confirm_inventory_receipt", {
        p_store_id: activeStoreId,
        p_model: {
          model_code: first.code,
          name: first.name,
          brand: first.brand,
          category: first.category,
          gender,
          supplier_name: first.supplier,
        },
        p_lines: lines.map((line) => ({ color: line.color, size: line.size, quantity: line.stock, unit_cost: line.cost, currency: line.currency })),
        p_idempotency_key: crypto.randomUUID(),
      });
      if (error) {
        throw new Error(error.message || "Receipt could not be saved.");
      }
      await refreshLiveWorkspace().catch(() => setWorkspaceStatus("error"));
      setModal(null);
      notify(locale === "tr" ? "Kabul staging veritabanına kaydedildi" : "Receipt saved to the staging database");
      return;
    }
    const stamp = Date.now();
    setProducts((current) => {
      const next = [...current];
      lines.forEach((line, index) => {
        const existingIndex = next.findIndex((product) => product.store === "clothing" && product.code.toLowerCase() === line.code.toLowerCase() && product.color.toLowerCase() === line.color.toLowerCase() && product.size.toLowerCase() === line.size.toLowerCase());
        if (existingIndex >= 0) next[existingIndex] = { ...next[existingIndex], ...line, stock: next[existingIndex].stock + line.stock, updated: "Just now" };
        else next.unshift({ ...line, id: stamp + index, updated: "Just now" });
      });
      return next;
    });
    const total = lines.reduce((sum, product) => sum + product.stock, 0);
    const suppliers = [...new Set(lines.map((line) => line.supplier))];
    const receiptActivity: ActivityType = { id: stamp, type: "receipt", title: `Receipt from ${suppliers[0]}`, meta: `${total} items · Zebra Boutique · just now` };
    setActivities((current) => [receiptActivity, ...current].slice(0, 6));
    setModal(null);
    notify(`${total} items received`);
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

  const sellProductFromCard = (code: string) => {
    setSelectedProductCode(null);
    setSaleCodePrefill(code);
    setModal("sale");
  };

  const addSeller = (event: FormEvent) => {
    event.preventDefault();
    if (!newSeller.name.trim()) return;
    const initials = newSeller.name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
    setSellers((current) => [...current, { id: Date.now(), name: newSeller.name.trim(), initials, store: "clothing", status: "offline", email: newSeller.email.trim(), phone: newSeller.phone || "+90 —" }]);
    setNewSeller({ name: "", email: "", phone: "" });
    notify(text.sellerAdded);
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
    ...(role === "owner" ? [{ id: "team", label: text.team, Icon: Users }] : []),
  ];

  const displayName = isLiveMode ? authenticatedName || "Zebra team member" : role === "owner" ? "Arslan Zengin" : currentSeller.name;
  const displayInitials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "ZB";

  const nav = (
    <>
      <div className="flex h-[72px] items-center gap-3 border-b border-zinc-800/80 px-5">
        <div className="flex h-9 w-9 items-center justify-center bg-violet-600 text-sm font-black tracking-tighter text-white">ZB</div>
        <div>
          <p className="text-sm font-bold tracking-[0.18em] text-zinc-100">ZEBRA</p>
          <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-600">Retail system</p>
        </div>
        <button onClick={() => setMobileNav(false)} className="ml-auto text-zinc-500 lg:hidden" aria-label={text.close}><X size={20} /></button>
      </div>
      <div className="flex flex-1 flex-col px-3 py-5">
        <p className="px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-600">{text.workspace}</p>
        <div className="mt-3 space-y-1">
          {navItems.map(({ id, label, Icon }, index) => (
            <button key={id} type="button" onClick={() => jumpTo(id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${index === 0 ? "bg-violet-500/10 text-violet-300" : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"}`}>
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <p className="mt-8 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-600">{text.pilotStore}</p>
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-3">
          <Shirt size={16} className="text-zinc-500" />
          <div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-zinc-200">Zebra Boutique</p><p className="mt-0.5 text-[9px] text-zinc-600">{text.clothingActive}</p></div>
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_#8b5cf6]" />
        </div>

        <div className="mt-auto rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-[10px] font-bold text-zinc-300">{isLiveMode ? displayInitials : role === "owner" ? "AZ" : currentSeller.initials}</div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-zinc-200">{displayName}</p>
              <p className="text-[10px] text-zinc-600">{role === "owner" ? text.networkOwner : text.sellerClothing}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (isLiveMode && accessLoading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#09090b] text-sm text-zinc-500">Checking secure workspace access…</main>;
  }

  return (
    <div className="min-h-screen bg-transparent text-zinc-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[224px] flex-col border-r border-zinc-800/80 bg-[#0d0d10] lg:flex">{nav}</aside>
      {mobileNav && <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setMobileNav(false)}><aside className="flex h-full w-[270px] flex-col border-r border-zinc-800 bg-[#0d0d10]" onClick={(event) => event.stopPropagation()}>{nav}</aside></div>}

      <div className="lg:pl-[224px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center border-b border-zinc-800/80 bg-[#0a0a0c]/88 px-4 backdrop-blur-xl sm:px-6 xl:px-8">
          <button type="button" onClick={() => setMobileNav(true)} className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 lg:hidden" aria-label={text.workspace}><Menu size={19} /></button>
          {role === "owner" && <div className="flex h-9 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 text-xs font-medium text-zinc-200"><Store size={14} className="text-zinc-500" /> Zebra Boutique</div>}

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
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
          </div>
        </header>

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
                <button type="button" onClick={() => { setSaleCodePrefill(""); setModal("sale"); }} className="purple-shadow flex h-10 items-center gap-2 rounded-lg bg-violet-600 px-4 text-xs font-semibold text-white transition hover:bg-violet-500">
                  <Plus size={16} /> {text.newSale}
                </button>
              </div>
            </div>

            <div className="mt-7 flex w-fit rounded-lg border border-zinc-800 bg-zinc-900/70 p-0.5">
              {(Object.keys(periodLabels) as Period[]).map((item) => (
                <button key={item} type="button" onClick={() => setPeriod(item)} className={`rounded-md px-3 py-1.5 text-[11px] font-medium transition ${period === item ? "bg-zinc-700/80 text-zinc-100" : "text-zinc-600 hover:text-zinc-300"}`}>{periodLabels[item]}</button>
              ))}
            </div>

            <div className={`mt-4 grid gap-3 ${role === "owner" ? "grid-cols-2 xl:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"}`}>
              <MetricCard label={text.revenue} value={money(metrics.revenue)} delta={isLiveMode ? text.liveData : period === "day" ? text.todayDelta : text.periodDelta} icon={WalletCards} accent />
              <MetricCard label={text.salesMetric} value={`${integer(metrics.count)} ${text.unitsShort}`} delta={isLiveMode ? text.liveData : text.itemsDelta} icon={ReceiptText} />
              <MetricCard label={role === "owner" ? text.grossMargin : text.myResult} value={money(metrics.margin)} delta={`${metrics.revenue ? Math.round((metrics.margin / metrics.revenue) * 100) : 0}% ${text.ofRevenue}`} icon={TrendingUp} />
              {role === "owner" && <LowStockCarousel products={visibleProducts} />}
            </div>
          </section>

          <section id="sales" className="mt-4 scroll-mt-24 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.75fr)]">
            <article className="panel rounded-2xl p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">{text.salesTrend}</p>
                  <p className="mt-1 text-xs text-zinc-600">{text.lastSevenDays}</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-500"><span className="h-2 w-2 rounded-full bg-violet-500" /> {text.revenue}</div>
              </div>
              <div className="chart-grid mt-8 flex h-52 items-end gap-2 rounded-lg px-1 pt-5 sm:gap-4">
                {chartData.map((day) => (
                  <div key={day.label} className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                    <div className="relative flex h-full w-full items-end justify-center">
                      <span className="pointer-events-none absolute bottom-[calc(var(--bar-height)+8px)] hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-[10px] font-medium text-white group-hover:block" style={{ left: "50%", ["--bar-height" as string]: `${Math.max(6, (day.value / chartMax) * 100)}%` }}>{money(day.value)}</span>
                      <div className="w-full max-w-11 rounded-t-md bg-gradient-to-t from-violet-700 to-violet-400 transition-all duration-500 group-hover:from-violet-600 group-hover:to-violet-300" style={{ height: `${Math.max(4, (day.value / chartMax) * 100)}%`, opacity: day.value ? 1 : 0.18 }} />
                    </div>
                    <span className="text-[10px] text-zinc-600">{day.label}</span>
                  </div>
                ))}
              </div>
            </article>

            {role === "owner" ? <article id="team" className="panel scroll-mt-24 rounded-2xl p-5 sm:p-6">
              <div className="flex items-start justify-between"><div><p className="text-sm font-semibold">{text.sellerResults}</p><p className="mt-1 text-xs text-zinc-600">{periodLabels[period].toLowerCase()} · {text.revenueRanking}</p></div>{!isLiveMode && <button type="button" onClick={() => setModal("sellers")} className="text-[11px] font-medium text-violet-400 transition hover:text-violet-300">{text.manage}</button>}</div>
              <div className="mt-5 space-y-4">{rankedSellers.slice(0, 4).map((seller, index) => <div key={seller.id} className="flex items-center gap-3"><span className="w-3 text-[10px] text-zinc-700">{String(index + 1).padStart(2, "0")}</span><span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-[10px] font-bold text-zinc-300">{seller.initials}<span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#111114] ${seller.status === "online" ? "bg-emerald-400" : "bg-zinc-600"}`} /></span><div className="min-w-0 flex-1"><div className="flex items-baseline justify-between gap-2"><p className="truncate text-xs font-medium text-zinc-300">{seller.name}</p><p className="text-xs font-semibold text-zinc-100">{money(seller.revenue)}</p></div><div className="mt-1.5 h-1 overflow-hidden rounded-full bg-zinc-800"><div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.max(8, (seller.revenue / Math.max(rankedSellers[0]?.revenue || 1, 1)) * 100)}%` }} /></div></div><span className="w-8 text-right text-[10px] text-zinc-600">{seller.count} pcs</span></div>)}</div>
            </article> : <SellerGoalCard actual={metrics.revenue} period={period} />}
          </section>

          <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.75fr)]">
            <article id="inventory" className="panel scroll-mt-24 overflow-hidden rounded-2xl">
              <div className="flex flex-col gap-4 border-b border-zinc-800/80 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <p className="text-sm font-semibold">{text.stock}</p>
                  <p className="mt-1 text-xs text-zinc-600">{integer(metrics.units)} {text.units} · {visibleProducts.length} SKU</p>
                </div>
                <div className="relative sm:w-72">
                  <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input value={search} onChange={(event) => { setSearch(event.target.value); setInventoryPage(1); }} placeholder={text.search} className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-9 pr-3 text-xs text-zinc-200 outline-none placeholder:text-zinc-700 focus:border-violet-500" />
                </div>
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
                      <div className="min-w-0 flex-1 pt-0.5"><div className="flex justify-between gap-3"><p className="truncate text-[11px] font-medium text-zinc-300">{item.title}</p>{item.amount && <span className="shrink-0 text-[11px] font-semibold text-zinc-200">+{money(item.amount, item.currency)}</span>}</div><p className="mt-1 truncate text-[10px] text-zinc-600">{item.meta}</p></div>
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
      </div>

      {toast && <div className="fade-up fixed bottom-5 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-xl border border-emerald-500/25 bg-[#121713] px-4 py-3 text-xs font-medium text-emerald-300 shadow-2xl"><Check size={15} />{toast}</div>}

      {modal === "sale" && (
        <Modal title="New sale" eyebrow="Cash operation" onClose={() => setModal(null)} wide>
          <SaleFlow key={`sale-${saleCodePrefill}`} initialCode={saleCodePrefill} products={products} sellerName={isLiveMode ? displayName : role === "seller" ? currentSeller.name : sellers[0]?.name ?? displayName} onCancel={() => setModal(null)} onComplete={completeSale} />
        </Modal>
      )}

      {modal === "receive" && (
        <Modal title="Receive products" eyebrow="Manual receipt" onClose={() => setModal(null)} wide>
          <ReceiveFlow locale={locale} products={isLiveMode ? [] : products} onCancel={() => setModal(null)} onSave={saveReceipt} />
        </Modal>
      )}

      {modal === "fx" && role === "owner" && (
        <Modal title={locale === "tr" ? "Döviz kurları" : "Exchange rates"} eyebrow={locale === "tr" ? "Sahip ayarları" : "Owner settings"} onClose={() => setModal(null)}>
          <FxRateManager locale={locale} onClose={() => setModal(null)} />
        </Modal>
      )}

      {modal === "activity" && (
        <Modal title="All activity" eyebrow="Store history" onClose={() => setModal(null)}>
          <div className="divide-y divide-zinc-800/70 p-5 sm:p-7">{activities.length ? activities.map((item) => { const Icon = item.type === "sale" ? CircleDollarSign : item.type === "receipt" ? PackagePlus : Boxes; return <div key={item.id} className="flex gap-3 py-4 first:pt-0"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${item.type === "sale" ? "border-violet-500/20 bg-violet-500/10 text-violet-400" : "border-zinc-800 bg-zinc-900 text-zinc-500"}`}><Icon size={15} /></span><div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><p className="truncate text-xs font-medium text-zinc-200">{item.title}</p>{item.amount !== undefined && <span className="shrink-0 text-xs font-semibold text-zinc-100">+{money(item.amount, item.currency)}</span>}</div><p className="mt-1 text-[11px] text-zinc-600">{item.meta}</p></div></div>; }) : <p className="py-10 text-center text-xs text-zinc-600">No operations yet.</p>}</div>
        </Modal>
      )}

      {selectedProductVariants.length > 0 && (
        <Modal title={selectedProductVariants[0].name} eyebrow="Product details" onClose={() => setSelectedProductCode(null)} wide>
        <ProductCard variants={selectedProductVariants} onUploadPhotos={isLiveMode ? addProductPhotos : undefined} onSell={sellProductFromCard} />
        </Modal>
      )}

      {modal === "sellers" && role === "owner" && !isLiveMode && (
        <Modal title="Seller team" eyebrow="Access and stores" onClose={() => setModal(null)} wide>
          <div className="grid gap-7 p-5 sm:p-7 md:grid-cols-[1.1fr_.9fr]">
            <div><p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Active sellers</p><div className="mt-3 divide-y divide-zinc-800/70 rounded-xl border border-zinc-800">{sellers.map((seller) => <div key={seller.id} className="flex items-center gap-3 p-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-[10px] font-bold text-zinc-300">{seller.initials}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-zinc-200">{seller.name}</p><p className="mt-1 truncate text-[10px] text-zinc-600">{seller.email} · {seller.phone}</p></div><button type="button" onClick={() => { setSellers((current) => current.filter((item) => item.id !== seller.id)); notify("Seller removed from demo"); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-700 transition hover:bg-red-500/10 hover:text-red-400" aria-label={`Remove ${seller.name}`}><Trash2 size={15} /></button></div>)}</div></div>
            <form onSubmit={addSeller}><div className="flex items-center gap-2"><UserPlus size={15} className="text-violet-400" /><p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Add seller</p></div><p className="mt-2 text-[10px] leading-relaxed text-zinc-600">Production will send this email a Magic Link for secure sign-in.</p><div className="mt-4 space-y-4"><label className="block"><span className="mb-2 block text-[10px] text-zinc-600">Full name</span><input required value={newSeller.name} onChange={(event) => setNewSeller((current) => ({ ...current, name: event.target.value }))} placeholder="For example, Deniz Arslan" className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs outline-none placeholder:text-zinc-700 focus:border-violet-500" /></label><label className="block"><span className="mb-2 block text-[10px] text-zinc-600">Magic Link email</span><input required type="email" value={newSeller.email} onChange={(event) => setNewSeller((current) => ({ ...current, email: event.target.value }))} placeholder="seller@zebra.store" className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs outline-none placeholder:text-zinc-700 focus:border-violet-500" /></label><label className="block"><span className="mb-2 block text-[10px] text-zinc-600">Phone</span><input required value={newSeller.phone} onChange={(event) => setNewSeller((current) => ({ ...current, phone: event.target.value }))} placeholder="+90 5__ ___ __ __" className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs outline-none placeholder:text-zinc-700 focus:border-violet-500" /></label><div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-[10px] text-zinc-500">Store access: <span className="text-zinc-300">Zebra Boutique</span></div><button type="submit" className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 text-xs font-semibold text-white hover:bg-violet-500"><UserPlus size={15} /> Add and send link</button></div></form>
          </div>
        </Modal>
      )}
    </div>
  );
}
