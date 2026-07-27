"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  STORE_CART_KEY,
  type CartLine,
} from "@/lib/store/types";

type CartContextValue = {
  items: CartLine[];
  count: number;
  subtotal: number;
  ready: boolean;
  addItem: (item: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORE_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartLine[]) {
  window.localStorage.setItem(STORE_CART_KEY, JSON.stringify(items));
}

export function StoreCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const skipPersist = useRef(true);

  useEffect(() => {
    setItems(readCart());
    setReady(true);
    // Allow one frame before persisting so the initial hydrate does not rewrite storage.
    const timer = window.setTimeout(() => {
      skipPersist.current = false;
    }, 0);

    const onStorage = (event: StorageEvent) => {
      if (event.key === STORE_CART_KEY) setItems(readCart());
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    if (!ready || skipPersist.current) return;
    saveCart(items);
  }, [items, ready]);

  const lastAddAt = useRef<Record<string, number>>({});

  const addItem = useCallback((item: Omit<CartLine, "quantity">, quantity = 1) => {
    const qty = Math.max(1, Math.floor(quantity));
    const now = Date.now();
    const prevAt = lastAddAt.current[item.variantId] ?? 0;
    // Ignore accidental double-fires (Strict Mode / double-click) within 400ms.
    if (now - prevAt < 400) return;
    lastAddAt.current[item.variantId] = now;

    setItems((prev) => {
      const existing = prev.find((line) => line.variantId === item.variantId);
      if (existing) {
        return prev.map((line) =>
          line.variantId === item.variantId
            ? { ...line, quantity: line.quantity + qty }
            : line,
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
  }, []);

  const setQuantity = useCallback((variantId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((line) => line.variantId !== variantId);
      return prev.map((line) =>
        line.variantId === variantId ? { ...line, quantity } : line,
      );
    });
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setItems((prev) => prev.filter((line) => line.variantId !== variantId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((sum, line) => sum + line.quantity, 0),
      subtotal: items.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
      ready,
      addItem,
      setQuantity,
      removeItem,
      clear,
    }),
    [items, ready, addItem, setQuantity, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useStoreCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useStoreCart must be used within StoreCartProvider");
  return ctx;
}
