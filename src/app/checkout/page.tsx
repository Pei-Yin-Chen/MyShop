"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, CreditCard, Truck, User, CheckCircle2, ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const router = useRouter();
  const [shippingMethod, setShippingMethod] = useState("home");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  // 監聽輸入變化並即時清除錯誤
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // 即時驗證邏輯
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        
        if (name === "email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (emailRegex.test(value)) {
            delete next.email;
          } else {
            next.email = "請輸入有效的電子郵件格式";
          }
        } else if (value.trim() !== "") {
          delete next[name];
        }
        
        return next;
      });
    }
  };

  // 當切換運送方式為自取時，自動清除地址錯誤
  useEffect(() => {
    if (shippingMethod === "store" && errors.address) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.address;
        return next;
      });
    }
  }, [shippingMethod, errors.address]);

  // 防止重新整理時 items 為空導致無法顯示
  useEffect(() => {
    if (items.length === 0) {
      const timer = setTimeout(() => {
        if (items.length === 0) router.replace("/cart");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [items, router]);

  // 運費邏輯：滿 1000 免運，或是自取免運
  const shippingFee = (totalPrice >= 1000 || shippingMethod === "store") ? 0 : 150;
  const finalTotal = totalPrice + shippingFee;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "請輸入姓名";
    if (!formData.phone.trim()) newErrors.phone = "請輸入電話";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "請輸入電子郵件";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "請輸入有效的電子郵件格式";
    }

    if (shippingMethod === "home" && !formData.address.trim()) {
      newErrors.address = "請輸入收件地址";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 儲存訂單資訊供成功頁面顯示
    const orderData = {
      id: `MP-${Math.floor(Math.random() * 1000000)}`,
      date: new Date().toLocaleDateString("zh-TW", { year: 'numeric', month: 'long', day: 'numeric' }),
      total: finalTotal,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }))
    };
    sessionStorage.setItem("lastOrder", JSON.stringify(orderData));

    // 模擬提交並導向
    clearCart();
    router.push("/checkout/success");
  };

  if (items.length === 0) {
    return null; // 由 useEffect 處理導向
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-10 lg:py-16">
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">結帳</h1>
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/cart" className="hover:text-primary transition-colors">購物車</Link>
              <ChevronRight className="size-3.5" />
              <span className="text-foreground font-medium">填寫資料</span>
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
            <div className="space-y-8">
              {/* 顧客基本資料 */}
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
                      <label className="text-sm font-medium text-muted-foreground block mb-1.5" htmlFor="name">姓名</label>
                      <input 
                        name="name" 
                        id="name" 
                        value={formData.name}
                        onChange={handleInputChange}
                        className={cn(
                          "w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-all",
                          errors.name ? "border-destructive ring-2 ring-destructive/10" : "border-border focus:ring-2 focus:ring-primary/20"
                        )} 
                        placeholder="請輸入真實姓名" 
                      />
                      {errors.name && <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground block mb-1.5" htmlFor="phone">電話</label>
                      <input 
                        name="phone" 
                        id="phone" 
                        type="tel" 
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={cn(
                          "w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-all",
                          errors.phone ? "border-destructive ring-2 ring-destructive/10" : "border-border focus:ring-2 focus:ring-primary/20"
                        )} 
                        placeholder="0912-345-678" 
                      />
                      {errors.phone && <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">{errors.phone}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground block mb-1.5" htmlFor="email">電子郵件</label>
                    <input 
                      name="email" 
                      id="email" 
                      type="email" 
                      value={formData.email}
                      onChange={handleInputChange}
                      className={cn(
                        "w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-all",
                        errors.email ? "border-destructive ring-2 ring-destructive/10" : "border-border focus:ring-2 focus:ring-primary/20"
                      )} 
                      placeholder="example@mail.com" 
                    />
                    {errors.email && <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">{errors.email}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* 運送方式 */}
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
                        onChange={(e) => setShippingMethod(e.target.value)}
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
                        onChange={(e) => setShippingMethod(e.target.value)}
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
                      <label className="text-sm font-medium text-muted-foreground block mb-1.5" htmlFor="address">收件地址</label>
                      <input 
                        name="address" 
                        id="address" 
                        value={formData.address}
                        onChange={handleInputChange}
                        className={cn(
                          "w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-all",
                          errors.address ? "border-destructive ring-2 ring-destructive/10" : "border-border focus:ring-2 focus:ring-primary/20"
                        )} 
                        placeholder="請輸入詳細地址" 
                      />
                      {errors.address && <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">{errors.address}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 付款方式 */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="size-5 text-primary" />
                    付款方式
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <label className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input type="radio" name="payment" value="credit" defaultChecked className="size-4 text-primary" />
                    <span className="font-medium">信用卡 / 簽帳金融卡</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input type="radio" name="payment" value="transfer" className="size-4 text-primary" />
                    <span className="font-medium">銀行轉帳</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input type="radio" name="payment" value="linepay" className="size-4 text-primary" />
                    <span className="font-medium">LINE Pay</span>
                  </label>
                </CardContent>
              </Card>
            </div>

            {/* 訂單摘要 */}
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
                          <span className="text-muted-foreground line-clamp-1 flex-1 mr-4">
                            {item.name} x {item.quantity}
                          </span>
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
                      {shippingFee > 0 && (
                        <p className="text-[10px] text-primary text-right italic">再買 NT$ {1000 - totalPrice} 即可享免運</p>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>總計</span>
                      <span className="text-primary tabular-nums">NT$ {finalTotal}</span>
                    </div>

                    <Button type="submit" size="lg" className="w-full rounded-full font-bold h-12 mt-4 shadow-md shadow-primary/10">
                      確認下單
                    </Button>
                    
                    <p className="text-[11px] text-center text-muted-foreground">
                      點擊「確認下單」即代表您同意本站之服務條款與隱私權政策。
                    </p>
                  </CardContent>
                </Card>
                
                <Button variant="ghost" className="w-full text-muted-foreground rounded-full" render={<Link href="/cart" />} nativeButton={false}>
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
