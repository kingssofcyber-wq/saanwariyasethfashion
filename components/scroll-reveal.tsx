"use client";
import { useEffect, useRef, type ReactNode } from "react";
export function ScrollReveal({children,className="",delay=0}:{children:ReactNode;className?:string;delay?:number}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{const el=ref.current;if(!el)return;el.classList.add("reveal-ready");el.style.setProperty("--reveal-delay",`${delay}ms`);if(!("IntersectionObserver" in window)){el.classList.add("is-visible");return;}const observer=new IntersectionObserver((entries)=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target);}}},{threshold:.12,rootMargin:"0px 0px -35px 0px"});observer.observe(el);return()=>observer.disconnect();},[delay]);
 return <div ref={ref} className={`scroll-reveal ${className}`}>{children}</div>;
}
