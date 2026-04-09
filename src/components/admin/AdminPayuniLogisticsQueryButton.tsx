"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { FormMenuSelect } from "@/components/ui/select";
import {
  formatPayuniGoodsTypeDisplay,
  formatPayuniServiceTypeDisplay,
  formatPayuniShipTypeDisplay,
  formatPayuniTradeTypeDisplay,
} from "@/lib/payuni/logistics-display-labels";
import { cn } from "@/lib/utils";

const LGS_OPTIONS: { value: string; label: string }[] = [
  { value: "HOME", label: "黑貓宅配（HOME）" },
  { value: "B2C", label: "7-ELEVEN 大宗寄倉（B2C）" },
  { value: "C2C", label: "7-ELEVEN 店到店（C2C）" },
  { value: "C2B", label: "7-ELEVEN 退貨便（C2B）" },
];

const TRADE_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "1", label: "正物流" },
  { value: "2", label: "逆物流" },
];

const DIALOG_SELECT_POSITIONER = "z-[220]";

/** 查詢結果僅顯示以下常用欄位（有值才列出） */
const RESULT_ROWS_COMMON: { key: string; label: string }[] = [
  { key: "ShipStatusDesc", label: "貨態說明" },
  { key: "ShipStatusTime", label: "貨態時間" },
  { key: "ShipStatus", label: "貨態狀態碼" },
  { key: "Odno", label: "出貨單／託運單號" },
  { key: "ShipTradeNo", label: "UNi 物流序號" },
  { key: "TradeType", label: "宅配類別" },
  { key: "GoodsType", label: "寄件型態" },
  { key: "ShipType", label: "通路" },
  { key: "ServiceType", label: "取件／服務方式" },
  { key: "ShipAmt", label: "取貨付款金額" },
  { key: "StoreID", label: "門市代碼" },
  { key: "StoreName", label: "門市名稱" },
  { key: "ValidationNo", label: "驗證碼" },
  { key: "RefundODNO", label: "退貨便單號" },
];

function formatFieldValue(key: string, raw: string): string {
  switch (key) {
    case "GoodsType":
      return formatPayuniGoodsTypeDisplay(raw);
    case "ServiceType":
      return formatPayuniServiceTypeDisplay(raw);
    case "ShipType":
      return formatPayuniShipTypeDisplay(raw);
    case "TradeType":
      return formatPayuniTradeTypeDisplay(raw);
    default:
      return raw.trim();
  }
}

function pickCommonPayloadRows(payload: Record<string, string>) {
  const rows: { label: string; value: string }[] = [];
  for (const { key, label } of RESULT_ROWS_COMMON) {
    const v = payload[key];
    if (v != null && String(v).trim() !== "") {
      rows.push({ label, value: formatFieldValue(key, String(v)) });
    }
  }
  return rows;
}

export function AdminPayuniLogisticsQueryButton({
  orderId,
  className,
  defaultLgsType,
  defaultShipTradeNo,
  defaultReturnOdno,
  defaultTradeType,
  shipTradePrefilledFromTracking = false,
}: {
  orderId: string;
  className?: string;
  defaultLgsType: string;
  defaultShipTradeNo: string;
  defaultReturnOdno: string;
  defaultTradeType: string;
  shipTradePrefilledFromTracking?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lgsType, setLgsType] = useState(defaultLgsType);
  const [shipTradeNo, setShipTradeNo] = useState(defaultShipTradeNo);
  const [returnOdno, setReturnOdno] = useState(defaultReturnOdno);
  const [tradeType, setTradeType] = useState(defaultTradeType);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending]);

  useEffect(() => {
    if (!open) return;
    setLgsType(defaultLgsType);
    setShipTradeNo(defaultShipTradeNo);
    setReturnOdno(defaultReturnOdno);
    setTradeType(defaultTradeType);
    setError(null);
    setPayload(null);
  }, [open, defaultLgsType, defaultShipTradeNo, defaultReturnOdno, defaultTradeType]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPayload(null);
    setPending(true);
    try {
      const body: Record<string, string | number | undefined> = { lgsType };
      if (lgsType === "C2B") {
        body.returnOdno = returnOdno.trim();
      } else {
        body.shipTradeNo = shipTradeNo.trim();
        if (lgsType === "HOME" && tradeType !== "") {
          body.tradeType = Number(tradeType);
        }
      }
      const res = await fetch(`/api/admin/orders/${orderId}/payuni-logistics-query`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        payload?: Record<string, string>;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? `查詢失敗（${res.status}）`);
        return;
      }
      if (data.payload) {
        setPayload(data.payload);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "查詢失敗");
    } finally {
      setPending(false);
    }
  }

  const isC2B = lgsType === "C2B";
  const hasCached =
    defaultShipTradeNo.trim().length > 0 || defaultReturnOdno.trim().length > 0;

  const modal = open ? (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        aria-label="關閉"
        disabled={pending}
        onClick={() => !pending && setOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payuni-lgs-query-title"
        className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-lg min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-lg shadow-black/10"
      >
        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 px-6 pt-6 pb-2">
            <h2 id="payuni-lgs-query-title" className="text-lg font-semibold text-foreground">
              PAYUNi 物流狀態查詢
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {shipTradePrefilledFromTracking ? (
                <>
                  UNi 物流序號欄已帶入與「收件與配送」相同的<strong className="font-medium text-foreground/90">
                    追蹤號碼
                  </strong>
                  。多數黑貓／PAYUNi 宅配可直接查詢；若後台實際序號不同請手動修改。7-ELEVEN 大宗／店到店亦可至{" "}
                  <a
                    href="https://tracking.shopmore.com.tw/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    數網查件
                  </a>
                  ；黑貓託運單號可查{" "}
                  <a
                    href="https://www.t-cat.com.tw/inquire/trace.aspx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    黑貓包裹查詢
                  </a>
                  。
                </>
              ) : hasCached ? (
                <>已從訂單帶入儲存的物流型態與序號（含 PAYUNi Notify 曾回傳時）。若與實際不符請手動修改。</>
              ) : (
                <>
                  請輸入 PAYUNi 後台的 <strong className="font-medium text-foreground/90">UNi 物流序號</strong>
                  ，或先在「收件與配送」完成出貨並填寫追蹤號碼後再開啟，將自動帶入。7-ELEVEN 大宗／店到店亦可至{" "}
                  <a
                    href="https://tracking.shopmore.com.tw/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    數網查件
                  </a>
                  ；黑貓託運單號可查{" "}
                  <a
                    href="https://www.t-cat.com.tw/inquire/trace.aspx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    黑貓包裹查詢
                  </a>
                  。
                </>
              )}
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-6 py-2">
            <div className="flex flex-col gap-3">
              <div>
                <label
                  htmlFor="payuni_lgs_type"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  物流型態（LgsType）
                </label>
                <FormMenuSelect
                  id="payuni_lgs_type"
                  name="payuni_lgs_type"
                  defaultValue={lgsType}
                  options={LGS_OPTIONS}
                  onValueChange={setLgsType}
                  disabled={pending}
                  positionerClassName={DIALOG_SELECT_POSITIONER}
                />
              </div>

              {isC2B ? (
                <div>
                  <label
                    htmlFor="payuni_return_odno"
                    className="mb-1.5 block text-xs font-medium text-muted-foreground"
                  >
                    退貨便編號（12 碼：8 碼單號＋4 碼驗證碼）
                  </label>
                  <input
                    id="payuni_return_odno"
                    value={returnOdno}
                    onChange={(e) => setReturnOdno(e.target.value)}
                    disabled={pending}
                    maxLength={12}
                    autoComplete="off"
                    placeholder="例：123456781234"
                    className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-60"
                  />
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="payuni_ship_trade_no"
                    className="mb-1.5 block text-xs font-medium text-muted-foreground"
                  >
                    UNi 物流序號（ShipTradeNo）
                  </label>
                  <input
                    id="payuni_ship_trade_no"
                    value={shipTradeNo}
                    onChange={(e) => setShipTradeNo(e.target.value)}
                    disabled={pending}
                    autoComplete="off"
                    placeholder="由 PAYUNi 物流工具取得"
                    className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-60"
                  />
                </div>
              )}

              {lgsType === "HOME" ? (
                <div className="space-y-1.5">
                  <label
                    htmlFor="payuni_trade_type"
                    className="mb-1.5 block text-xs font-medium text-muted-foreground"
                  >
                    宅配類別（TradeType，選填）
                  </label>
                  <FormMenuSelect
                    id="payuni_trade_type"
                    name="payuni_trade_type"
                    defaultValue={tradeType}
                    options={TRADE_TYPE_OPTIONS}
                    emptyOption={{ label: "未指定（PAYUNi 預設為正物流）" }}
                    onValueChange={setTradeType}
                    disabled={pending}
                    positionerClassName={DIALOG_SELECT_POSITIONER}
                  />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground/85">正物流</span>
                    ：一般銷售出貨，貨件由您的倉儲／門市送往消費者或指定地址。
                    <span className="font-medium text-foreground/85"> 逆物流</span>
                    ：例如消費者退貨，貨件由買方端或取件點退回您或物流中心（與「賣出去」方向相反）。
                  </p>
                </div>
              ) : null}

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              {payload ? (
                <div className="rounded-lg border border-border/80 bg-muted/20 p-3 text-sm">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">查詢結果（常用貨態）</p>
                  <dl className="space-y-2">
                    {pickCommonPayloadRows(payload).map(({ label, value }, idx) => (
                      <div
                        key={`${idx}-${label}`}
                        className="grid gap-0.5 sm:grid-cols-[8.5rem_1fr] sm:gap-2"
                      >
                        <dt className="text-muted-foreground">{label}</dt>
                        <dd className="break-all font-medium text-foreground">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}
            </div>
          </div>

          <div className="shrink-0 border-t border-border/80 bg-card px-6 py-4">
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="rounded-full"
                disabled={pending}
                onClick={() => setOpen(false)}
              >
                關閉
              </Button>
              <Button type="submit" size="lg" className="rounded-full" disabled={pending}>
                {pending ? "查詢中…" : "查詢"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <div className={cn(className)}>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="rounded-full"
        onClick={() => setOpen(true)}
      >
        PAYUNi 物流查詢
      </Button>
      {mounted && modal ? createPortal(modal, document.body) : null}
    </div>
  );
}
