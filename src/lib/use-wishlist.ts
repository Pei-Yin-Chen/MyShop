"use client";

import { useCallback, useEffect, useState } from "react";
import {
  emitWishlistUpdated,
  readWishlistIds,
  writeWishlistIds,
} from "@/lib/wishlist-storage";

export function useWishlist(productId: string) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- 僅在掛載後讀取 localStorage */
    setIds(readWishlistIds());
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const isWishlisted = ids.includes(productId);

  const toggle = useCallback(() => {
    // 以目前 localStorage 為準避免「同畫面多張卡片，各自 state 過期」導致覆蓋
    const current = readWishlistIds();
    const next = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];

    setIds(next);
    try {
      writeWishlistIds(next);
    } catch {
      // ignore quota / private mode
    }
    // 不可在 setState updater 內同步 dispatch：會讓 Navbar 在 ProductInfo 渲染週期內 setState
    queueMicrotask(() => emitWishlistUpdated());
  }, [productId]);

  return { isWishlisted, toggle, hydrated };
}
