import type { Locale } from "@/lib/i18n";

const aliases: Record<string, string> = {
  black: "black", siyah: "black",
  white: "white", beyaz: "white",
  blue: "blue", mavi: "blue",
  beige: "beige", bej: "beige",
  grey: "grey", gray: "grey", gri: "grey",
  brown: "brown", kahverengi: "brown",
  navy: "navy", lacivert: "navy", darkblue: "navy", "dark blue": "navy",
  stone: "stone", soil: "stone", ecru: "ecru", ekru: "ecru",
};

const labels: Record<string, { en: string; tr: string }> = {
  black: { en: "Black", tr: "Siyah" }, white: { en: "White", tr: "Beyaz" }, blue: { en: "Blue", tr: "Mavi" },
  beige: { en: "Beige", tr: "Bej" }, grey: { en: "Grey", tr: "Gri" }, brown: { en: "Brown", tr: "Kahverengi" },
  navy: { en: "Navy", tr: "Lacivert" }, stone: { en: "Stone", tr: "Taş" }, ecru: { en: "Ecru", tr: "Ekru" },
};

function compact(value: string) { return value.trim().toLowerCase().replace(/\s+/g, " "); }
function titleCase(value: string) { return value.replace(/\b\p{L}/gu, (letter) => letter.toUpperCase()); }

/** Stable catalog value persisted by manual receipt. Known EN/TR variants collapse to one value. */
export function canonicalColor(value: string) {
  const cleaned = compact(value);
  return labels[aliases[cleaned] ?? cleaned] ? labels[aliases[cleaned] ?? cleaned].en : titleCase(cleaned);
}

export function colorLabel(value: string, locale: Locale) {
  const canonical = canonicalColor(value);
  const key = Object.entries(labels).find(([, label]) => label.en === canonical)?.[0];
  return key ? labels[key][locale] : canonical;
}

/** Do not surface known temporary data labels as a colour choice. It remains auditable in the database until explicit cleanup approval. */
export function isUsableColor(value: string) {
  const cleaned = compact(value);
  return Boolean(cleaned) && !/\bboundary\b|\b(EUR|USD|TRY|RUB|GBP)\b/i.test(cleaned);
}

export function colorOptions(values: string[], locale: Locale) {
  return [...new Map(values.filter(isUsableColor).map((value) => {
    const canonical = canonicalColor(value);
    return [canonical.toLocaleLowerCase(), { value: canonical, label: colorLabel(canonical, locale) }];
  })).values()];
}
