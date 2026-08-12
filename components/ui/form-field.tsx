import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

type FieldFrameProps = { label: string; children: ReactNode; error?: string; hint?: string };

export function FormField({ label, children, error, hint }: FieldFrameProps) {
  return <label className="block">
    <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[.14em] text-zinc-500">{label}</span>
    {children}
    {hint && !error && <span className="mt-1.5 block text-[11px] text-zinc-500">{hint}</span>}
    {error && <span role="alert" className="mt-1.5 block text-[11px] text-red-300">{error}</span>}
  </label>;
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };
export function TextInput({ className = "", invalid = false, ...props }: TextInputProps) {
  return <input {...props} aria-invalid={invalid || undefined} className={`form-control h-10 w-full px-3 text-xs ${invalid ? "form-control-invalid" : ""} ${className}`} />;
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };
export function TextArea({ className = "", invalid = false, ...props }: TextAreaProps) {
  return <textarea {...props} aria-invalid={invalid || undefined} className={`form-control w-full p-3 text-sm ${invalid ? "form-control-invalid" : ""} ${className}`} />;
}
