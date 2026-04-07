"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type PayuniFields = {
  MerID: string;
  Version: string;
  EncryptInfo: string;
  HashInfo: string;
};

function postToPayuni(actionUrl: string, fields: PayuniFields) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = actionUrl;
  form.style.display = "none";
  const add = (name: string, value: string) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  };
  add("MerID", fields.MerID);
  add("Version", fields.Version);
  add("EncryptInfo", fields.EncryptInfo);
  add("HashInfo", fields.HashInfo);
  document.body.appendChild(form);
  form.submit();
}

/** 待付款 PAYUNi 訂單：重新開啟統一金流付款頁（關閉分頁或未選付款方式時使用） */
export function PayuniResumePaymentButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/payuni-resume`, {
        method: "POST",
      });
      const data: {
        error?: string;
        payuni?: { actionUrl: string; fields: PayuniFields };
      } = await res.json();
      if (!res.ok) {
        setError(data.error ?? "無法開啟付款頁，請稍後再試");
        return;
      }
      if (!data.payuni?.actionUrl || !data.payuni.fields) {
        setError("無法建立付款資料，請稍後再試或聯絡客服");
        return;
      }
      postToPayuni(data.payuni.actionUrl, data.payuni.fields);
    } catch {
      setError("網路錯誤，請稍後再試");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="lg"
        className="w-fit min-h-11 justify-center gap-2 rounded-full px-6"
        disabled={loading}
        onClick={() => void handleClick()}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <CreditCard className="size-4 shrink-0" />
        )}
        {loading ? "準備中…" : "繼續完成線上付款"}
      </Button>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-prose">
        點選後會開啟統一金流安全付款頁，再選擇信用卡、ATM、超商等方式完成這筆訂單。
      </p>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
