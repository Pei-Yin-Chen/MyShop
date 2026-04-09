"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

const DURATION_MS = 4000;

type ActionSuccessLike = { ok?: boolean; message?: string } | undefined;

/**
 * `useActionState` 每次成功回傳新物件時觸發一次 toast（避免同一個 state 參考重複顯示）。
 */
export function useActionSuccessToast(state: ActionSuccessLike, fallbackMessage: string) {
  const lastSuccessRef = useRef<unknown>(undefined);
  useEffect(() => {
    if (!state?.ok) return;
    if (lastSuccessRef.current === state) return;
    lastSuccessRef.current = state;
    const text =
      typeof state.message === "string" && state.message.trim() !== ""
        ? state.message
        : fallbackMessage;
    toast.success(text, { duration: DURATION_MS });
  }, [state, fallbackMessage]);
}
