"use client";

import { useEffect, type RefObject } from "react";

const focusableSelector = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

export function useDialogFocus(active: boolean, dialogRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!active) return;
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusFirst = () => (dialogRef.current?.querySelector<HTMLElement>(focusableSelector) ?? dialogRef.current)?.focus();
    const frame = window.requestAnimationFrame(focusFirst);
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const elements = [...(dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [])];
      if (!elements.length) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", trapFocus);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", trapFocus);
      returnFocus?.focus();
    };
  }, [active, dialogRef]);
}
