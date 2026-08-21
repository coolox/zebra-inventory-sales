/** Product codes may contain any visible Unicode letters, numbers and punctuation.
 * Control and format characters are never a valid catalog identity. */
export function hasForbiddenProductCodeCharacter(value: string) {
  return /[\p{Cc}\p{Cf}]/u.test(value);
}

export function isProductCodeKeyboardTerminator(key: string) {
  return key === "Enter" || key === "Go" || key === "Done";
}
