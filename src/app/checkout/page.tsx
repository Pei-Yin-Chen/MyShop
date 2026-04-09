"use client";

import React, {
  startTransition,
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  CreditCard,
  Loader2,
  StickyNote,
  Truck,
  User,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FooterClient } from "@/components/FooterClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { flushSync } from "react-dom";

type ShippingMethod = "home" | "store";

type CheckoutFormData = {
  name: string;
  phone: string;
  email: string;
  address: string;
  orderNote: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PAYUNI_SESSION_KEY = "payuni_pending_order_id";

const MAX_ORDER_NOTE_LENGTH = 500;

const PAY_RETURN_HINT: Record<string, string> = {
  config: "金流尚未設定完成。",
  bad: "無法讀取付款回傳資料。",
  missing: "付款回傳缺少必要欄位。",
  missing_get: "付款回傳網址缺少參數（若持續發生請洽 PAYUNi）。",
  hash: "付款資料驗證未通過。若銀行已扣款，訂單可能稍後由背景通知更新；請至會員中心確認。",
  decrypt: "無法解密付款結果，請聯絡客服並提供訂單編號。",
  mer: "商店代號與回傳不符。",
  noorder: "回傳中找不到商店訂單編號。",
  server: "伺服器未設定 SUPABASE_SERVICE_ROLE_KEY，無法更新訂單狀態；請補上後重試背景通知。",
  db: "已導向成功頁，但更新付款狀態時發生錯誤；請至會員中心確認或聯絡客服。",
  failed:
    "此筆付款未成功（例如卡號錯誤、驗證失敗或銀行拒絕）。訂單仍為「待付款」，請登入後至該筆訂單點「繼續完成線上付款」再試。",
  unknown:
    "回傳中找不到對應訂單，請勿重複付款；請聯絡客服並提供商店訂單編號或交易畫面。",
  amt: "回傳金額與訂單不符，請勿重複操作付款；請聯絡客服並提供訂單編號。",
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CheckoutPageInner />
    </Suspense>
  );
}

function payMessageFromCode(code: string): string {
  return (
    PAY_RETURN_HINT[code] ?? `付款流程發生問題（代碼：${code}）。`
  );
}

/** 網址已 replace 後，仍依 sticky 代碼顯示說明（避免標題變成「已前往付款」） */
function payEmptyCardTitle(
  payFromUrl: string | null,
  stickyPayCode: string | null,
  payReturnHint: string | null,
): string {
  const code = payFromUrl ?? stickyPayCode;
  if (payReturnHint || code) {
    if (code === "failed" || code === "amt") return "付款未成功";
    return "付款回傳提醒";
  }
  return "已前往付款";
}

function CheckoutPageInner() {
  const searchParams = useSearchParams();
  const payFromUrl = searchParams.get("pay");
  const orderIdFromUrl = searchParams.get("orderId");

  /**
   * 僅當網址列仍有 ?pay= 時顯示紅字提醒；replace 清網址後即不顯示（避免 payCapture 導致文案卡死）。
   * sticky 僅保留代碼／訂單 id，供空購物車區塊與「登入後開啟此訂單」按鈕。
   */
  const [stickyPayCode, setStickyPayCode] = useState<string | null>(null);
  const [stickyOrderId, setStickyOrderId] = useState<string | null>(null);
  const [recentPayRedirect, setRecentPayRedirect] = useState(false);
  /** 即將 POST 至 PAYUNi（state 才會觸發重繪；ref 單獨無法保證與 clearCart 同一幀） */
  const [pendingPayuniNav, setPendingPayuniNav] = useState(false);

  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const pay = searchParams.get("pay");
    if (!pay) return;
    const orderId = searchParams.get("orderId");
    /** 延後一幀再導向，避免 App Router 尚未完成初始化時 dispatch（Internal: Router action dispatched before initialization） */
    const id = requestAnimationFrame(() => {
      /** 付款失敗／金額不符改走獨立頁（與成功頁類似），勿留在結帳頁以免空購物車導去購物車 */
      if (orderId && (pay === "failed" || pay === "amt")) {
        const qs = new URLSearchParams({ orderId });
        qs.set("reason", pay === "amt" ? "amt" : "failed");
        startTransition(() => {
          router.replace(`/checkout/payment-failed?${qs}`, { scroll: false });
        });
        return;
      }
      setStickyPayCode(pay);
      setRecentPayRedirect(true);
      startTransition(() => {
        router.replace("/checkout", { scroll: false });
      });
    });
    return () => cancelAnimationFrame(id);
  }, [searchParams, router]);

  /** 只在網址仍帶 pay= 時顯示紅字（replace 後改由 cardStickyMessage） */
  const payReturnHint = payFromUrl ? payMessageFromCode(payFromUrl) : null;
  const payReturnCode = payFromUrl ?? stickyPayCode;
  const payReturnOrderId = orderIdFromUrl ?? stickyOrderId;

  const supabase = useMemo(() => createClient(), []);

  // 用來避免成功下單後清空購物車導致本頁 useEffect 把路由又導回 /cart
  const redirectingToSuccessRef = useRef(false);
  /** 已準備 POST 至 PAYUNi（同步設置，早於 setState，避免 clearCart 後一幀仍顯示舊的 sticky failed） */
  const openingPayuniRef = useRef(false);

  useLayoutEffect(() => {
    if (searchParams.get("pay")) {
      openingPayuniRef.current = false;
      setPendingPayuniNav(false);
    }
  }, [searchParams]);

  const suppressFailureUi =
    pendingPayuniNav ||
    redirectingToSuccessRef.current ||
    openingPayuniRef.current;
  const cardPayHint = suppressFailureUi ? null : payReturnHint;
  const cardStickyCode = suppressFailureUi ? null : stickyPayCode;
  const cardStickyMessage =
    payFromUrl == null && cardStickyCode
      ? payMessageFromCode(cardStickyCode)
      : null;
  const cardPayReturnCode = payFromUrl ?? cardStickyCode;
  const cardPayReturnOrderId = suppressFailureUi ? null : payReturnOrderId;

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("home");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  /** 曾導向 PAYUNi、購物車已清空時，避免誤導回購物車 */
  const [payuniAwaitReturn, setPayuniAwaitReturn] = useState(false);

  const [formData, setFormData] = useState<CheckoutFormData>({
    name: "",
    phone: "",
    email: "",
    address: "",
    orderNote: "",
  });

  // Prefill from member profile (if available)
  useEffect(() => {
    let cancelled = false;
    async function prefill() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data } = await supabase
        .from("profiles")
        .select("default_shipping_address, mobile_phone, full_name")
        .eq("id", user.id)
        .maybeSingle<{
          default_shipping_address: string | null;
          mobile_phone: string | null;
          full_name: string | null;
        }>();

      setFormData((prev) => {
        let next = prev;
        const nameFromProfile = (data?.full_name ?? "").trim();
        if (nameFromProfile && !next.name.trim()) next = { ...next, name: nameFromProfile };

        const phoneDigits = (data?.mobile_phone ?? "").replace(/\D/g, "").trim();
        if (phoneDigits && !next.phone.trim()) next = { ...next, phone: phoneDigits };

        // Only prefill when the address field is relevant/visible and still empty.
        if (shippingMethod === "home" && !next.address.trim()) {
          const addr = data?.default_shipping_address?.trim() ?? "";
          if (addr) next = { ...next, address: addr };
        }
        return next;
      });
    }
    void prefill();
    return () => {
      cancelled = true;
    };
  }, [supabase, shippingMethod, formData.address, formData.phone]);

  /** 購物車有商品＝新一筆結帳，清掉上一筆失敗的 sticky，避免送出後空車畫面仍顯示「付款未成功」 */
  useEffect(() => {
    if (items.length > 0) {
      setStickyPayCode(null);
      setStickyOrderId(null);
      setRecentPayRedirect(false);
      setPendingPayuniNav(false);
    }
  }, [items.length]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(PAYUNI_SESSION_KEY)) {
        setPayuniAwaitReturn(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  /** 僅在「網址帶 pay=」時清除待付款 session（勿用 payReturnCode／會含舊的 sticky failed，誤清新一筆 PAYUNi） */
  useEffect(() => {
    if (payFromUrl) {
      try {
        sessionStorage.removeItem(PAYUNI_SESSION_KEY);
      } catch {
        /* ignore */
      }
      setPayuniAwaitReturn(false);
    }
  }, [payFromUrl]);

  // 防止重新整理時 items 為空導致無法顯示（PAYUNi 付款中／回傳錯誤時勿導回購物車）
  useEffect(() => {
    if (items.length === 0 && !redirectingToSuccessRef.current) {
      if (payReturnCode) return;
      try {
        if (sessionStorage.getItem(PAYUNI_SESSION_KEY)) return;
      } catch {
        /* ignore */
      }
      const timer = setTimeout(() => router.replace("/cart"), 300);
      return () => clearTimeout(timer);
    }
  }, [items.length, router, payReturnCode]);

  const shippingFee = useMemo(() => {
    return totalPrice >= 1000 || shippingMethod === "store" ? 0 : 150;
  }, [totalPrice, shippingMethod]);

  const finalTotal = totalPrice + shippingFee;

  const handleOrderNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, orderNote: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextValue = name === "phone" ? value.replace(/\D/g, "") : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));

    // 即時驗證邏輯（只針對目前已有錯誤的欄位）
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        if (name === "email") {
          if (emailRegex.test(value)) delete next.email;
          else next.email = "請輸入有效的電子郵件格式";
          return next;
        }
        if (String(value).trim() !== "") delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "請輸入姓名";
    if (!formData.phone.trim()) newErrors.phone = "請輸入電話";
    if (!formData.email.trim()) newErrors.email = "請輸入電子郵件";
    else if (!emailRegex.test(formData.email)) newErrors.email = "請輸入有效的電子郵件格式";

    if (shippingMethod === "home" && !formData.address.trim()) {
      newErrors.address = "請輸入收件地址";
    }

    return newErrors;
  };

  /** 離開欄位時驗證（與送出時 validate() 規則一致） */
  function blurCheckoutField(field: "name" | "phone" | "email" | "address") {
    setErrors((prev) => {
      const next = { ...prev };
      if (field === "name") {
        if (!formData.name.trim()) next.name = "請輸入姓名";
        else delete next.name;
      } else if (field === "phone") {
        if (!formData.phone.trim()) next.phone = "請輸入電話";
        else delete next.phone;
      } else if (field === "email") {
        if (!formData.email.trim()) next.email = "請輸入電子郵件";
        else if (!emailRegex.test(formData.email))
          next.email = "請輸入有效的電子郵件格式";
        else delete next.email;
      } else if (field === "address") {
        if (shippingMethod === "home" && !formData.address.trim())
          next.address = "請輸入收件地址";
        else delete next.address;
      }
      return next;
    });
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitError(null);
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (items.length === 0) {
      router.replace("/cart");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/checkout/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingMethod,
          formData,
          items: items.map((it) => ({ id: it.id, quantity: it.quantity })),
        }),
      });

      const data: {
        orderId?: string;
        error?: string;
        payuni?: {
          actionUrl: string;
          fields: {
            MerID: string;
            Version: string;
            EncryptInfo: string;
            HashInfo: string;
          };
        };
      } = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          // RLS 要求登入；把使用者導回登入頁
          router.push("/login");
          setSubmitError(data.error ?? "請先登入再結帳");
          return;
        }
        setSubmitError(data.error ?? "下單失敗，請稍後再試");
        return;
      }

      const orderId = data.orderId;
      if (!orderId) {
        setSubmitError("建立訂單失敗，請稍後再試");
        return;
      }

      redirectingToSuccessRef.current = true;

      if (!data.payuni?.actionUrl || !data.payuni.fields) {
        setSubmitError("無法建立 PAYUNi 付款資料，請稍後再試或聯絡客服。");
        return;
      }

      openingPayuniRef.current = true;
      flushSync(() => {
        setPendingPayuniNav(true);
        setStickyPayCode(null);
        setStickyOrderId(null);
        setRecentPayRedirect(false);
        setPayuniAwaitReturn(true);
      });

      try {
        sessionStorage.setItem(PAYUNI_SESSION_KEY, orderId);
      } catch {
        /* ignore */
      }
      clearCart();
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.payuni.actionUrl;
      form.style.display = "none";
      const add = (name: string, value: string) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      };
      const f = data.payuni.fields;
      add("MerID", f.MerID);
      add("Version", f.Version);
      add("EncryptInfo", f.EncryptInfo);
      add("HashInfo", f.HashInfo);
      document.body.appendChild(form);
      form.submit();
    } catch {
      setSubmitError("網路錯誤，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  };

  const showEmptyWithoutCart =
    items.length === 0 &&
    (Boolean(payReturnCode) || payuniAwaitReturn || recentPayRedirect);

  /** 送出後、POST 至 PAYUNi 前：勿顯示空購物車「已前往付款」卡（會像多一頁）；改全螢幕前往中 */
  if (pendingPayuniNav) {
    return (
      <div className="fixed inset-0 z-[100] flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="size-10 animate-spin text-primary" aria-hidden />
        <p className="text-sm font-medium text-foreground">正在前往統一金流付款頁…</p>
      </div>
    );
  }

  if (items.length === 0 && !showEmptyWithoutCart) return null;

  if (showEmptyWithoutCart) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <main className="flex-grow">
          <div className="container mx-auto max-w-lg px-4 py-16">
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  {payEmptyCardTitle(payFromUrl, cardStickyCode, cardPayHint)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                {cardPayHint ? (
                  <p className="text-destructive">{cardPayHint}</p>
                ) : null}
                {cardStickyMessage ? (
                  <p
                    className={
                      cardStickyCode === "failed" || cardStickyCode === "amt"
                        ? "text-destructive"
                        : "text-foreground"
                    }
                  >
                    {cardStickyMessage}
                  </p>
                ) : null}
                {!cardPayHint && !cardStickyMessage ? (
                  <p>
                    您已從本站前往 PAYUNi
                    付款頁，購物車已清空。若已完成付款，請稍候重新整理會員中心的訂單狀態，或點下方前往訂單。
                  </p>
                ) : null}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  {cardPayReturnOrderId &&
                  (cardPayReturnCode === "failed" ||
                    cardPayReturnCode === "amt") ? (
                    <Button
                      size="lg"
                      className="rounded-full"
                      nativeButton={false}
                      render={
                        <Link
                          href={`/login?redirectTo=${encodeURIComponent(`/member/orders/${cardPayReturnOrderId}`)}`}
                        />
                      }
                    >
                      登入後開啟此訂單
                    </Button>
                  ) : null}
                  <Button
                    size="lg"
                    className="rounded-full"
                    variant={
                      cardPayReturnOrderId &&
                      (cardPayReturnCode === "failed" ||
                        cardPayReturnCode === "amt")
                        ? "outline"
                        : "default"
                    }
                    nativeButton={false}
                    render={<Link href="/member/orders" />}
                  >
                    前往我的訂單
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full"
                    nativeButton={false}
                    render={<Link href="/cart" />}
                  >
                    回到購物車
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <FooterClient />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-10 lg:py-16">
          {payReturnHint && (
            <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {payReturnHint}
            </div>
          )}
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">結帳</h1>
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/cart" className="hover:text-primary transition-colors">
                購物車
              </Link>
              <ChevronRight className="size-3.5" />
              <span className="text-foreground font-medium">填寫資料</span>
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
            <div className="space-y-8">
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="size-5 text-primary" />
                    顧客基本資料
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground block mb-1.5" htmlFor="name">
                        姓名
                      </label>
                      <input
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        onBlur={() => blurCheckoutField("name")}
                        className={cn(
                          "w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-all",
                          errors.name
                            ? "border-destructive ring-2 ring-destructive/10"
                            : "border-border focus:ring-2 focus:ring-primary/20",
                        )}
                        placeholder="請輸入真實姓名"
                      />
                      {errors.name && (
                        <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground block mb-1.5" htmlFor="phone">
                        電話
                      </label>
                      <input
                        name="phone"
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        onBlur={() => blurCheckoutField("phone")}
                        className={cn(
                          "w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-all",
                          errors.phone
                            ? "border-destructive ring-2 ring-destructive/10"
                            : "border-border focus:ring-2 focus:ring-primary/20",
                        )}
                        placeholder="0912345678"
                      />
                      {errors.phone && (
                        <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground block mb-1.5" htmlFor="email">
                      電子郵件
                    </label>
                    <input
                      name="email"
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={() => blurCheckoutField("email")}
                      className={cn(
                        "w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-all",
                        errors.email
                          ? "border-destructive ring-2 ring-destructive/10"
                          : "border-border focus:ring-2 focus:ring-primary/20",
                      )}
                      placeholder="example@mail.com"
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Truck className="size-5 text-primary" />
                    運送方式
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                      <input
                        type="radio"
                        name="shipping"
                        value="home"
                        checked={shippingMethod === "home"}
                        onChange={(e) => {
                          setShippingMethod(e.target.value as ShippingMethod);
                        }}
                        className="size-4 text-primary"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between font-medium">
                          <span>低溫宅配</span>
                          <span>NT$ 150</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">出貨後約 1-2 天送達</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                      <input
                        type="radio"
                        name="shipping"
                        value="store"
                        checked={shippingMethod === "store"}
                        onChange={(e) => {
                          const next = e.target.value as ShippingMethod;
                          setShippingMethod(next);
                          // 若改自取就不需要地址，先清掉地址錯誤
                          if (next === "store") {
                            setErrors((prev) => {
                              if (!prev.address) return prev;
                              const copy = { ...prev };
                              delete copy.address;
                              return copy;
                            });
                          }
                        }}
                        className="size-4 text-primary"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between font-medium">
                          <span>店面自取</span>
                          <span>免運費</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">台北市信義區松山路 123 號</p>
                      </div>
                    </label>
                  </div>

                  {shippingMethod === "home" && (
                    <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <label className="text-sm font-medium text-muted-foreground block mb-1.5" htmlFor="address">
                        收件地址
                      </label>
                      <input
                        name="address"
                        id="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        onBlur={() => blurCheckoutField("address")}
                        className={cn(
                          "w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-all",
                          errors.address
                            ? "border-destructive ring-2 ring-destructive/10"
                            : "border-border focus:ring-2 focus:ring-primary/20",
                        )}
                        placeholder="請輸入詳細地址"
                      />
                      {errors.address && (
                        <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                          {errors.address}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <StickyNote className="size-5 text-primary" />
                    訂單備註
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground block" htmlFor="orderNote">
                    給賣家的留言（選填）
                  </label>
                  <textarea
                    id="orderNote"
                    name="orderNote"
                    value={formData.orderNote}
                    onChange={handleOrderNoteChange}
                    rows={3}
                    maxLength={MAX_ORDER_NOTE_LENGTH}
                    placeholder="例如：到貨時間、不要附餐具、發票抬頭…"
                    className={cn(
                      "w-full min-h-[88px] rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-all resize-y",
                      "border-border focus:ring-2 focus:ring-primary/20",
                    )}
                  />
                  <p className="text-xs text-muted-foreground text-right tabular-nums">
                    {formData.orderNote.length} / {MAX_ORDER_NOTE_LENGTH}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="size-5 text-primary" />
                    線上付款
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    按下「確認下單」後，將前往統一金流 PAYUNi 整合式付款頁，於該頁選擇信用卡、ATM、超商等付款方式；完成後會導回本站的訂單完成頁。
                  </p>
                  <p className="text-xs">
                    本站僅透過 PAYUNi 收款，不再提供站內模擬付款選項。
                  </p>
                </CardContent>
              </Card>
            </div>

            <aside className="space-y-6">
              <div className="sticky top-24 space-y-6">
                <Card className="border-border/60 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">訂單摘要</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground line-clamp-1 flex-1 mr-4">{item.name} x {item.quantity}</span>
                          <span className="font-medium tabular-nums">NT$ {item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">商品總計</span>
                        <span className="font-medium tabular-nums">NT$ {totalPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">運費</span>
                        <span className="font-medium tabular-nums">
                          {shippingFee === 0 ? "免運費" : `NT$ ${shippingFee}`}
                        </span>
                      </div>
                      {shippingFee > 0 && totalPrice < 1000 && (
                        <p className="text-[10px] text-primary text-right italic">再買 NT$ {1000 - totalPrice} 即可享免運</p>
                      )}
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span>總計</span>
                      <span className="text-primary tabular-nums">NT$ {finalTotal}</span>
                    </div>

                    {submitError && (
                      <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {submitError}
                      </p>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full rounded-full font-bold h-12 mt-4 shadow-md shadow-primary/10"
                      disabled={submitting}
                    >
                      {submitting ? "處理中…" : "確認下單"}
                    </Button>

                    <p className="text-[11px] text-center text-muted-foreground">
                      點擊「確認下單」即代表您同意本站之服務條款與隱私權政策。
                    </p>
                  </CardContent>
                </Card>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full rounded-full text-muted-foreground hover:text-foreground"
                  nativeButton={false}
                  render={<Link href="/cart" />}
                >
                  <ArrowLeft className="mr-2 size-4" />
                  返回購物車修改
                </Button>
              </div>
            </aside>
          </form>
        </div>
      </main>

      <FooterClient />
    </div>
  );
}

