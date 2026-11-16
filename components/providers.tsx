"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";

type CartItem = { product: Product; quantity: number };
type StoreContextType = {
  items: CartItem[];
  add: (p: Product) => void;
  remove: (id: string) => void;
  setQty: (id: string, n: number) => void;
  clear: () => void;
  wishlist: string[];
  toggleWish: (id: string) => void;
  compare: string[];
  toggleCompare: (id: string) => void;
};
const StoreContext = createContext<StoreContextType | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const cart = localStorage.getItem("saanwariya_cart");
      const saved = localStorage.getItem("saanwariya_wishlist");
      const compared = localStorage.getItem("saanwariya_compare");
      if (cart) setItems(JSON.parse(cart));
      if (saved) setWishlist(JSON.parse(saved));
      if (compared) setCompare(JSON.parse(compared));
    } catch { /* Ignore malformed local browser state and start with an empty store. */ }
    setReady(true);
  }, []);

  useEffect(() => { if (ready) localStorage.setItem("saanwariya_cart", JSON.stringify(items)); }, [items, ready]);
  useEffect(() => { if (ready) localStorage.setItem("saanwariya_wishlist", JSON.stringify(wishlist)); }, [wishlist, ready]);
  useEffect(() => { if (ready) localStorage.setItem("saanwariya_compare", JSON.stringify(compare)); }, [compare, ready]);

  const value = useMemo<StoreContextType>(() => ({
    items,
    wishlist,
    compare,
    add: (product) => setItems((old) => {
      const found = old.find((item) => item.product.id === product.id);
      return found
        ? old.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...old, { product, quantity: 1 }];
    }),
    remove: (id) => setItems((old) => old.filter((item) => item.product.id !== id)),
    setQty: (id, quantity) => setItems((old) => old.map((item) => item.product.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)),
    clear: () => setItems([]),
    toggleWish: (id) => setWishlist((old) => old.includes(id) ? old.filter((item) => item !== id) : [...old, id]),
    toggleCompare: (id) => setCompare((old) => old.includes(id) ? old.filter((item) => item !== id) : old.length >= 4 ? old : [...old, id]),
  }), [items, wishlist, compare]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside Providers");
  return context;
}
