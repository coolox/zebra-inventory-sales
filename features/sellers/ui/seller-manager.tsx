import type { Locale } from "@/lib/i18n";
import type { Seller } from "@/lib/types";
import type { SellerMembershipStatus } from "@/features/sellers/model/types";
import { InviteSellerForm } from "./invite-seller-form";
import { SellerList } from "./seller-list";

type InviteValues = { fullName: string; email: string; phone: string };
type Props = {
  locale: Locale;
  role: "owner" | "seller";
  sellers: Seller[];
  onInvite: (values: InviteValues) => Promise<{ emailSent: boolean; idempotentReplay: boolean }>;
  onSetStatus: (seller: Seller, status: SellerMembershipStatus) => Promise<void>;
};

/** Owner-only composition. Its explicit callbacks work for either demo or live adapters. */
export function SellerManager({ locale, role, sellers, onInvite, onSetStatus }: Props) {
  if (role !== "owner") return null;
  return <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[1.1fr_.9fr]">
    <div><p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{locale === "tr" ? "Satıcı erişimi" : "Seller access"}</p><SellerList locale={locale} sellers={sellers} onSetStatus={onSetStatus} /></div>
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40"><InviteSellerForm locale={locale} onInvite={onInvite} /></div>
  </div>;
}
