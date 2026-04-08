"use client";

import React, { createContext, useContext, useSyncExternalStore } from "react";
import type { Product } from "@/data/products";

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function maxQuantityForProduct(product: Product): number {
  if (product.status === "sold_out") return 0;
  if (product.stockQuantity == null) return 99;
  return Math.min(99, Math.max(0, product.stockQuantity));
}

let lastCartRaw: string | null = null;
let lastCartParsed: CartItem[] = [];
const EMPTY_CART: CartItem[] = [];

function parseCartRaw(raw: string | null): CartItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function readCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem("cart");
  if (raw === lastCartRaw) return lastCartParsed;
  lastCartRaw = raw;
  lastCartParsed = parseCartRaw(raw);
  return lastCartParsed;
}

function writeCartToStorage(items: CartItem[]) {
  const raw = JSON.stringify(items);
  lastCartRaw = raw;
  lastCartParsed = items;
  window.localStorage.setItem("cart", raw);
  window.dispatchEvent(new Event("cart-updated"));
}

function subscribeToCartChanges(callback: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === "cart") callback();
  };
  const onLocal = () => callback();
  window.addEventListener("storage", onStorage);
  window.addEventListener("cart-updated", onLocal);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("cart-updated", onLocal);
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(
    subscribeToCartChanges,
    readCartFromStorage,
    () => EMPTY_CART,
  );

  const addItem = (product: Product, quantity = 1) => {
    if (product.status === "sold_out") return;
    const cap = maxQuantityForProduct(product);
    if (cap <= 0) return;
    const q = Math.min(Math.max(1, quantity), cap);
    const prev = readCartFromStorage();
    const existing = prev.find((item) => item.id === product.id);
    if (existing) {
      const nextQty = Math.min(existing.quantity + q, cap);
      writeCartToStorage(
        prev.map((it) => (it.id === product.id ? { ...it, quantity: nextQty } : it)),
      );
      return;
    }
    writeCartToStorage([...prev, { ...product, quantity: q }]);
  };

  const removeItem = (productId: string) => {
    const prev = readCartFromStorage();
    writeCartToStorage(prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    const prev = readCartFromStorage();
    writeCartToStorage(
      prev.map((item) => {
        if (item.id !== productId) return item;
        const cap = maxQuantityForProduct(item);
        return { ...item, quantity: Math.min(quantity, cap) };
      }),
    );
  };

  const clearCart = () => {
    writeCartToStorage([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
