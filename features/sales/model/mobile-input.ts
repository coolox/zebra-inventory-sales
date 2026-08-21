import type { ChangeEvent } from "react";

/** Android keyboard dismissal can dispatch a late input event after blur.
 * A controlled field must not accept a value once it no longer owns focus. */
export function acceptsFocusedInput(event: ChangeEvent<HTMLInputElement>) {
  return document.activeElement === event.currentTarget || (event.nativeEvent as InputEvent).isComposing;
}

export function isKeyboardTerminator(key: string) {
  return key === "Enter" || key === "Go" || key === "Done";
}
