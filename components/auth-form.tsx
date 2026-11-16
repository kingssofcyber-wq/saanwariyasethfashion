"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Please try again.");
      router.push(params.get("next") || "/account"); router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  }

  return <form onSubmit={submit} className="auth-form auth-luxe-form">
    {mode === "register" && <label className="auth-luxe-field"><span>Your name</span><div><UserRound size={17}/><input required minLength={2} autoComplete="name" placeholder="Enter your full name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })}/></div></label>}
    <label className="auth-luxe-field"><span>Email address</span><div><Mail size={17}/><input required type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })}/></div></label>
    <label className="auth-luxe-field"><span>Password</span><div><LockKeyhole size={17}/><input required type={showPassword ? "text" : "password"} minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="At least 8 characters" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })}/><button type="button" className="auth-password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div><small>Use at least 8 characters for your password.</small></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="btn btn-dark full-btn auth-submit-button" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in securely" : "Create my account"}</button>
    <p className="auth-switch">{mode === "login" ? "New to Saanwariya? " : "Already part of Saanwariya? "}<Link href={mode === "login" ? "/register" : "/login"}>{mode === "login" ? "Create an account" : "Sign in"}</Link></p>
  </form>;
}
