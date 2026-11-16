import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import Link from "next/link";
import { ArrowLeft, Gift, Gem, Heart } from "lucide-react";

export default function Register() {
  return <div className="container auth-page auth-luxe-page auth-register-page">
    <div className="auth-art auth-luxe-art"><img src="/images/suits-gallery-02.webp" alt="Indian ethnic fashion collection at Saanwariya Seth Fashion"/><div className="auth-art-glow"/><div className="auth-art-caption"><span>YOUR STYLE STORY STARTS HERE</span><h2>Make room for<br/><i>more beautiful.</i></h2><p>Create an account to keep your favourite finds and orders together.</p></div><div className="auth-art-seal"><Gift size={21}/><span>A LITTLE<br/>EXTRA JOY</span></div></div>
    <div className="auth-panel auth-luxe-panel"><Link href="/" className="auth-back-link"><ArrowLeft size={15}/> Back to home</Link><div className="auth-brand-mini"><img src="/brand/saanwariya-lotus-mark.svg" alt=""/><span>SAANWARIYA SETH FASHION</span></div><span className="eyebrow">JOIN OUR STYLE HOUSE</span><h1>Create your <i>account.</i></h1><p>A personal space for the pieces you love and the orders you place.</p><Suspense><AuthForm mode="register"/></Suspense><div className="auth-trust-notes"><span><Gem size={14}/> Curated collections</span><span><Heart size={14}/> Save favourites</span></div></div>
  </div>;
}
