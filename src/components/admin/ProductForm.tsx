"use client";

import {
  useActionState,
  useEffect,
  useState,
  startTransition,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createProductAction,
  updateProductAction,
  type ProductFormState,
} from "@/app/admin/(panel)/products/actions";
import {
  validateDisplayOrderField,
  validatePriceField,
  validateProductNameField,
  validateStockField,
} from "@/lib/admin/product-form-fields";
import { Button } from "@/components/ui/button";
import { ProductDescriptionEditor } from "@/components/admin/ProductDescriptionEditor";
import { FormMenuSelect } from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** 與結帳頁「顧客基本資料」欄位一致：label 與輸入框間距 */
const labelClass =
  "text-sm font-medium text-muted-foreground block mb-1.5";
const inputClass = (invalid?: boolean) =>
  cn(
    "w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-all",
    invalid
      ? "border-destructive ring-2 ring-destructive/10"
      : "border-border focus:ring-2 focus:ring-primary/20",
  );

export type CategoryOption = { id: string; name: string };

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "draft", label: "草稿" },
  { value: "active", label: "上架" },
  { value: "archived", label: "下架" },
  { value: "sold_out", label: "售完" },
];

export function ProductForm({
  mode,
  categories,
  initial,
  onBeforeSave,
}: {
  mode: "create" | "edit";
  categories: CategoryOption[];
  initial?: {
    id: string;
    name: string;
    description: string;
    price: number;
    category_id: string;
    stock_quantity: number;
    status: string;
    display_order: number;
  };
  /** 編輯頁：在送出商品表單前執行（例如先寫入圖片排序）；回傳 false 則中止儲存 */
  onBeforeSave?: () => Promise<boolean>;
}) {
  const router = useRouter();
  const action =
    mode === "create"
      ? createProductAction
      : updateProductAction.bind(null, initial!.id);

  const [state, formAction, isPending] = useActionState(
    action as (
      p: ProductFormState | undefined,
      fd: FormData,
    ) => Promise<ProductFormState>,
    undefined,
  );

  const [nameStr, setNameStr] = useState(() => initial?.name ?? "");
  const [priceStr, setPriceStr] = useState(() =>
    initial != null ? String(initial.price) : "",
  );
  const [stockStr, setStockStr] = useState(() =>
    initial != null ? String(initial.stock_quantity) : "",
  );
  const [displayOrderStr, setDisplayOrderStr] = useState(() =>
    initial != null ? String(initial.display_order) : "0",
  );
  const [clientFieldErrors, setClientFieldErrors] = useState<{
    name?: string;
    price?: string;
    stock_quantity?: string;
    display_order?: string;
  }>({});
  const [suppressedServer, setSuppressedServer] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    if (!state?.ok) return;
    if (mode === "create" && "productId" in state && state.productId) {
      router.push(`/admin/products/${state.productId}`);
    }
  }, [state, mode, router]);

  useEffect(() => {
    setSuppressedServer(new Set());
  }, [state]);

  useEffect(() => {
    if (!initial) return;
    setNameStr(initial.name);
    setPriceStr(String(initial.price));
    setStockStr(String(initial.stock_quantity));
    setDisplayOrderStr(String(initial.display_order));
  }, [initial?.id]);

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const serverError = state && !state.ok ? state.error : undefined;

  const nameErr =
    (!suppressedServer.has("name") ? fieldErrors?.name : undefined) ??
    clientFieldErrors.name;
  const priceErr =
    (!suppressedServer.has("price") ? fieldErrors?.price : undefined) ??
    clientFieldErrors.price;
  const stockErr =
    (!suppressedServer.has("stock_quantity")
      ? fieldErrors?.stock_quantity
      : undefined) ?? clientFieldErrors.stock_quantity;
  const displayOrderErr =
    (!suppressedServer.has("display_order")
      ? fieldErrors?.display_order
      : undefined) ?? clientFieldErrors.display_order;

  const formId = "admin-product-form";

  /** 名稱：僅 blur／送出時驗證（與 server「請填寫名稱」一致） */
  function blurName() {
    setSuppressedServer((s) => new Set(s).add("name"));
    setClientFieldErrors((prev) => {
      const err = validateProductNameField(nameStr);
      const next = { ...prev };
      if (err) next.name = err;
      else delete next.name;
      return next;
    });
  }

  /** 離開欄位時驗證（與送出時同一套規則） */
  function blurPrice() {
    setSuppressedServer((s) => new Set(s).add("price"));
    setClientFieldErrors((prev) => {
      const err = validatePriceField(priceStr);
      const next = { ...prev };
      if (err) next.price = err;
      else delete next.price;
      return next;
    });
  }
  function blurStock() {
    setSuppressedServer((s) => new Set(s).add("stock_quantity"));
    setClientFieldErrors((prev) => {
      const err = validateStockField(stockStr);
      const next = { ...prev };
      if (err) next.stock_quantity = err;
      else delete next.stock_quantity;
      return next;
    });
  }
  function blurDisplayOrder() {
    setSuppressedServer((s) => new Set(s).add("display_order"));
    setClientFieldErrors((prev) => {
      const err = validateDisplayOrderField(displayOrderStr);
      const next = { ...prev };
      if (err) next.display_order = err;
      else delete next.display_order;
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (onBeforeSave) {
      const ok = await onBeforeSave();
      if (!ok) return;
    }
    const formEl =
      e.currentTarget instanceof HTMLFormElement
        ? e.currentTarget
        : document.getElementById(formId);
    if (!(formEl instanceof HTMLFormElement)) return;

    const nErr = validateProductNameField(nameStr);
    const pErr = validatePriceField(priceStr);
    const sErr = validateStockField(stockStr);
    const dErr = validateDisplayOrderField(displayOrderStr);
    if (nErr || pErr || sErr || dErr) {
      setClientFieldErrors({
        ...(nErr ? { name: nErr } : {}),
        ...(pErr ? { price: pErr } : {}),
        ...(sErr ? { stock_quantity: sErr } : {}),
        ...(dErr ? { display_order: dErr } : {}),
      });
      return;
    }
    setClientFieldErrors({});

    const fd = new FormData(formEl);
    startTransition(() => {
      formAction(fd);
    });
  }

  return (
    <form id={formId} noValidate onSubmit={handleSubmit} className="w-full p-0">
      <div className="max-w-2xl space-y-8">
        <div className="space-y-5">
        <div className="space-y-2">
          <label className={labelClass} htmlFor="name">
            名稱
          </label>
          <input
            id="name"
            name="name"
            value={nameStr}
            onChange={(e) => {
              const v = e.target.value;
              setNameStr(v);
              if (fieldErrors?.name || clientFieldErrors.name) {
                setSuppressedServer((s) => new Set(s).add("name"));
                const err = validateProductNameField(v);
                setClientFieldErrors((prev) => {
                  const next = { ...prev };
                  if (err) next.name = err;
                  else delete next.name;
                  return next;
                });
              }
            }}
            onBlur={blurName}
            className={inputClass(!!nameErr)}
          />
          {nameErr && (
            <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
              {nameErr}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label className={labelClass} htmlFor="price">
              價格（NT$，整數）
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              step={1}
              value={priceStr}
              onChange={(e) => {
                const v = e.target.value;
                setPriceStr(v);
                if (fieldErrors?.price || clientFieldErrors.price) {
                  setSuppressedServer((s) => new Set(s).add("price"));
                  const err = validatePriceField(v);
                  setClientFieldErrors((prev) => {
                    const next = { ...prev };
                    if (err) next.price = err;
                    else delete next.price;
                    return next;
                  });
                }
              }}
              onBlur={blurPrice}
              className={inputClass(!!priceErr)}
            />
            {priceErr && (
              <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                {priceErr}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className={labelClass} htmlFor="stock_quantity">
              庫存
            </label>
            <input
              id="stock_quantity"
              name="stock_quantity"
              type="number"
              min={0}
              step={1}
              value={stockStr}
              onChange={(e) => {
                const v = e.target.value;
                setStockStr(v);
                if (fieldErrors?.stock_quantity || clientFieldErrors.stock_quantity) {
                  setSuppressedServer((s) => new Set(s).add("stock_quantity"));
                  const err = validateStockField(v);
                  setClientFieldErrors((prev) => {
                    const next = { ...prev };
                    if (err) next.stock_quantity = err;
                    else delete next.stock_quantity;
                    return next;
                  });
                }
              }}
              onBlur={blurStock}
              className={inputClass(!!stockErr)}
            />
            {stockErr && (
              <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                {stockErr}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelClass} htmlFor="category_id">
            分類
          </label>
          <FormMenuSelect
            id="category_id"
            name="category_id"
            required
            defaultValue={initial?.category_id ?? ""}
            invalid={!!fieldErrors?.category_id}
            emptyOption={{ label: "請選擇" }}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
          {fieldErrors?.category_id && (
            <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
              {fieldErrors.category_id}
            </p>
          )}
          <p className="text-xs text-muted-foreground pt-0.5">
            需新增分類請至{" "}
            <Link href="/admin/products/categories" className="font-medium text-primary underline-offset-4 hover:underline">
              商品分類
            </Link>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label className={labelClass} htmlFor="status">
              狀態
            </label>
            <FormMenuSelect
              id="status"
              name="status"
              required
              defaultValue={initial?.status ?? "draft"}
              invalid={!!fieldErrors?.status}
              options={STATUS_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
            />
            {fieldErrors?.status && (
              <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                {fieldErrors.status}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className={labelClass} htmlFor="display_order">
              列表顯示順序
            </label>
            <input
              id="display_order"
              name="display_order"
              type="number"
              min={0}
              step={1}
              value={displayOrderStr}
              onChange={(e) => {
                const v = e.target.value;
                setDisplayOrderStr(v);
                if (fieldErrors?.display_order || clientFieldErrors.display_order) {
                  setSuppressedServer((s) => new Set(s).add("display_order"));
                  const err = validateDisplayOrderField(v);
                  setClientFieldErrors((prev) => {
                    const next = { ...prev };
                    if (err) next.display_order = err;
                    else delete next.display_order;
                    return next;
                  });
                }
              }}
              onBlur={blurDisplayOrder}
              className={inputClass(!!displayOrderErr)}
            />
            {displayOrderErr && (
              <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                {displayOrderErr}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelClass} htmlFor="description">
            描述
          </label>
          <ProductDescriptionEditor
            key={initial?.id ?? "new-product"}
            initialDescription={initial?.description}
            invalid={!!fieldErrors?.description}
          />
          {fieldErrors?.description && (
            <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
              {fieldErrors.description}
            </p>
          )}
        </div>
        </div>

        {serverError && !fieldErrors && (
          <p className="text-sm text-destructive">{serverError}</p>
        )}
        {serverError && fieldErrors && Object.keys(fieldErrors).length === 0 && (
          <p className="text-sm text-destructive">{serverError}</p>
        )}

        {mode === "create" && (
          <p className="border-t border-border/60 pt-4 text-xs text-muted-foreground">
            新增商品只需填寫基本資料並建立；尚無圖片上傳，建立成功後會進入編輯頁，再於「商品圖片」區新增即可。
          </p>
        )}
        {mode === "edit" && (
          <p className="border-t border-border/60 pt-4 text-xs text-muted-foreground">
            下方「商品圖片」的修改會立即儲存；本表名稱、價格、描述等須按「儲存變更」。
          </p>
        )}

        <div className="flex justify-end border-t border-border/60 pt-4">
          <Button type="submit" disabled={isPending} className="min-w-[9rem]">
            {isPending ? "儲存中…" : mode === "create" ? "建立商品" : "儲存變更"}
          </Button>
        </div>
      </div>
    </form>
  );
}
