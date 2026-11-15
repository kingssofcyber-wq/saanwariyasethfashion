"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";
type CartItem = { product: Product; quantity: number };
type StoreContextType = { items:CartItem[]; add:(p:Product)=>void; remove:(id:string)=>void; setQty:(id:string,n:number)=>void; clear:()=>void; wishlist:string[]; toggleWish:(id:string)=>void };
const StoreContext = createContext<StoreContextType | null>(null);
export function Providers({ children }:{children:React.ReactNode}) {
  const [items,setItems] = useState<CartItem[]>([]); const [wishlist,setWishlist] = useState<string[]>([]); const [ready,setReady] = useState(false);
  useEffect(()=>{ try { const c=localStorage.getItem("saanwariya_cart"); const w=localStorage.getItem("saanwariya_wishlist"); if(c)setItems(JSON.parse(c)); if(w)setWishlist(JSON.parse(w)); } catch {} setReady(true); },[]);
  useEffect(()=>{ if(ready)localStorage.setItem("saanwariya_cart",JSON.stringify(items)); },[items,ready]);
  useEffect(()=>{ if(ready)localStorage.setItem("saanwariya_wishlist",JSON.stringify(wishlist)); },[wishlist,ready]);
  const value=useMemo(()=>({items, wishlist, add:(p:Product)=>setItems(old=>{const found=old.find(x=>x.product.id===p.id);return found?old.map(x=>x.product.id===p.id?{...x,quantity:x.quantity+1}:x):[...old,{product:p,quantity:1}]}), remove:(id:string)=>setItems(old=>old.filter(x=>x.product.id!==id)), setQty:(id:string,n:number)=>setItems(old=>old.map(x=>x.product.id===id?{...x,quantity:Math.max(1,n)}:x)), clear:()=>setItems([]), toggleWish:(id:string)=>setWishlist(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id])}),[items,wishlist]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
export function useStore(){const ctx=useContext(StoreContext);if(!ctx)throw new Error("useStore must be used inside Providers");return ctx;}
