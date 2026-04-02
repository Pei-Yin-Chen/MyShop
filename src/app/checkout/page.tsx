"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, CreditCard, Truck, User, ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ShippingMethod = "home" | "store";
type PaymentMethod = "credit" | "transfer" | "linepay";

type CheckoutFormData = {
  name: string;
  phone: string;
  email: string;
  address: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();

  // 用來避免成功下單後清空購物車導致本頁 useEffect 把路由又導回 /cart
  const redirectingToSuccessRef = useRef(false);

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("home");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  // 防止重新整理時 items 為空導致無法顯示
  useEffect(() => {
    if (items.length === 0 && !redirectingToSuccessRef.current) {
      const timer = setTimeout(() => router.replace("/cart"), 300);
      return () => clearTimeout(timer);
    }
  }, [items.length, router]);

  const shippingFee = useMemo(() => {
    return totalPrice >= 1000 || shippingMethod === "store" ? 0 : 150;
  }, [totalPrice, shippingMethod]);

  const finalTotal = totalPrice + shippingFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

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
          paymentMethod,
          formData,
          items: items.map((it) => ({ id: it.id, quantity: it.quantity })),
        }),
      });

      const data: { orderId?: string; error?: string } = await res.json();
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
      // 由伺服器扣庫存與寫入訂單成功後再清空購物車
      router.push(`/checkout/success?orderId=${encodeURIComponent(orderId)}`);
      // 先跳到 success，避免本頁因 clearCart 觸發「items 為空導回 /cart」
      clearCart();
    } catch {
      setSubmitError("網路錯誤，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-10 lg:py-16">
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
                        className={cn(
                          "w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-all",
                          errors.phone
                            ? "border-destructive ring-2 ring-destructive/10"
                            : "border-border focus:ring-2 focus:ring-primary/20",
                        )}
                        placeholder="0912-345-678"
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
                    <CreditCard className="size-5 text-primary" />
                    付款方式
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <label className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input
                      type="radio"
                      name="payment"
                      value="credit"
                      checked={paymentMethod === "credit"}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="size-4 text-primary"
                    />
                    <span className="font-medium">信用卡 / 簽帳金融卡</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input
                      type="radio"
                      name="payment"
                      value="transfer"
                      checked={paymentMethod === "transfer"}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="size-4 text-primary"
                    />
                    <span className="font-medium">銀行轉帳</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input
                      type="radio"
                      name="payment"
                      value="linepay"
                      checked={paymentMethod === "linepay"}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="size-4 text-primary"
                    />
                    <span className="font-medium">LINE Pay</span>
                  </label>
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
                  className="w-full text-muted-foreground rounded-full"
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

      <Footer />
    </div>
  );
}

