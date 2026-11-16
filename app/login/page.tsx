import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import Link from "next/link";
import { ArrowLeft, Gem, Heart, ShieldCheck } from "lucide-react";

export default function Login() {
  return <div className="container auth-page auth-luxe-page">
    <div className="auth-art auth-luxe-art"><img src="/images/hero-saree.webp" alt="Burgundy saree from the Saanwariya fashion collection"/><div className="auth-art-glow"/><div className="auth-art-caption"><span>THE SAANWARIYA EXPERIENCE</span><h2>Elegance is<br/><i>always personal.</i></h2><p>Thoughtful finds. Beautiful moments. Your own kind of style.</p></div><div className="auth-art-seal"><Gem size={21}/><span>CURATED<br/>WITH CARE</span></div></div>
    <div className="auth-panel auth-luxe-panel"><Link href="/" className="auth-back-link"><ArrowLeft size={15}/> Back to home</Link><div className="auth-brand-mini"><img src="/brand/saanwariya-lotus-mark.svg" alt=""/><span>SAANWARIYA SETH FASHION</span></div><span className="eyebrow">WELCOME BACK</span><h1>Sign in to your <i>style space.</i></h1><p>Access your orders, saved pieces and personal shopping details.</p><Suspense><AuthForm mode="login"/></Suspense><div className="auth-trust-notes"><span><ShieldCheck size={14}/> Private account</span><span><Heart size={14}/> Your saved styles</span></div></div>
  </div>;
}
