"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Heart, LogOut, Package, ShieldCheck, Sparkles, UserRound, WalletCards } from "lucide-react";

type AccountUser = { id: string; name: string; email: string; role: string; createdAt: string };

export default function Account() {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const router = useRouter();

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me").then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load your account.");
      if (active) setUser(data.user || null);
    }).catch((error: unknown) => {
      if (active) setLoadError(error instanceof Error ? error.message : "Unable to load your account.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (loading) return <div className="container page-wrap account-loading"><span className="eyebrow">SAANWARIYA MEMBER SPACE</span><div className="account-loading-card"><span/><span/><span/></div></div>;

  if (!user) return <section className="container page-wrap account-guest">
    <div className="account-guest-card"><div className="account-guest-mark"><UserRound size={28}/></div><span className="eyebrow">A MORE PERSONAL SHOPPING EXPERIENCE</span><h1>Your style, <i>all in one place.</i></h1><p>Sign in to revisit your orders, save the pieces you love and keep your Saanwariya favourites close.</p>{loadError && <small className="account-load-error">{loadError}</small>}<div className="account-guest-actions"><Link href="/login" className="btn btn-dark">Sign in <ArrowUpRight size={16}/></Link><Link href="/register" className="btn btn-outline">Create an account</Link></div><div className="account-guest-perks"><span><Package size={16}/> Order updates</span><span><Heart size={16}/> Saved favourites</span><span><ShieldCheck size={16}/> Secure account</span></div></div>
  </section>;

  const firstName = user.name?.trim().split(/\s+/)[0] || "there";
  const joined = user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "Saanwariya member";

  return <div className="container page-wrap account-dashboard">
    <section className="account-welcome-panel"><div className="account-welcome-copy"><span className="eyebrow"><Sparkles size={13}/> YOUR SAANWARIYA SPACE</span><h1>Welcome back, <i>{firstName}.</i></h1><p>Your personal corner for orders, saved styles and all things Saanwariya.</p><small>MEMBER SINCE {joined.toUpperCase()}</small></div><div className="account-welcome-emblem"><img src="/brand/saanwariya-lotus-mark.svg" alt=""/><span>STYLE IS<br/>PERSONAL</span></div></section>
    <section className="account-profile-card"><div className="account-profile-avatar"><UserRound size={27}/></div><div className="account-profile-copy"><span className="eyebrow">ACCOUNT PROFILE</span><h2>{user.name}</h2><p>{user.email}</p><small><ShieldCheck size={13}/> Your account details are private and secure</small></div><span className="account-member-pill">{user.role === "ADMIN" ? "STORE ADMIN" : "SAANWARIYA MEMBER"}</span></section>
    <section className="account-shortcuts"><Link href="/orders" className="account-shortcut"><span className="account-shortcut-icon"><Package/></span><span><small>SHOPPING HISTORY</small><b>Your orders</b><em>View order status and purchase details</em></span><ArrowUpRight className="account-shortcut-arrow"/></Link><Link href="/wishlist" className="account-shortcut"><span className="account-shortcut-icon"><Heart/></span><span><small>YOUR COLLECTION</small><b>Saved favourites</b><em>Return to the styles you loved</em></span><ArrowUpRight className="account-shortcut-arrow"/></Link><Link href="/compare" className="account-shortcut"><span className="account-shortcut-icon"><WalletCards/></span><span><small>MAKE A CHOICE</small><b>Compare products</b><em>Review details side by side</em></span><ArrowUpRight className="account-shortcut-arrow"/></Link>{user.role === "ADMIN" && <Link href="/admin" className="account-shortcut account-admin-shortcut"><span className="account-shortcut-icon"><ShieldCheck/></span><span><small>STORE MANAGEMENT</small><b>Admin dashboard</b><em>Manage products, orders and reviews</em></span><ArrowUpRight className="account-shortcut-arrow"/> </Link>}</section>
    <section className="account-bottom-row"><div><span className="eyebrow">A NOTE FROM SAANWARIYA</span><p>Thank you for being part of our story. We hope every visit helps you find something that feels like you.</p></div><button className="account-signout" type="button" onClick={logout}><LogOut size={16}/> Sign out</button></section>
  </div>;
}
