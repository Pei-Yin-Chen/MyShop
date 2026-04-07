"use client";

import { useEffect } from "react";

const KEY = "payuni_pending_order_id";

/** 離開 PAYUNi 回到成功頁後清除「付款中」標記，避免結帳頁誤判 */
export function ClearPayuniSession() {
  useEffect(() => {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);
  return null;
}
