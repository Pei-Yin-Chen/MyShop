export const WISHLIST_STORAGE_KEY = "wishlist_product_ids";

export function readWishlistIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

export function writeWishlistIds(ids: string[]) {
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
}

export function emitWishlistUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("wishlist-updated"));
}
