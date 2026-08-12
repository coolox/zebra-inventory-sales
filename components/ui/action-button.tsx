import type { ButtonHTMLAttributes, ReactNode } from "react";

export function ActionButton({ children, loading = false, className = "", disabled, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; children: ReactNode }) {
  return <button {...props} disabled={disabled || loading} aria-busy={loading || undefined} className={`action-button flex h-11 items-center justify-center rounded-xl px-4 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${className}`}>{children}</button>;
}
