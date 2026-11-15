import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
const COOKIE = "saanwariya_session";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "development-only-change-this-secret-please-123456");
export async function createSession(user: { id:string; name:string; email:string; role:string }) {
  const token = await new SignJWT({ name:user.name, email:user.email, role:user.role })
    .setProtectedHeader({ alg:"HS256" }).setSubject(user.id).setIssuedAt().setExpirationTime("7d").sign(secret);
  const jar = await cookies();
  jar.set(COOKIE, token, { httpOnly:true, secure:process.env.NODE_ENV === "production", sameSite:"lax", path:"/", maxAge:60*60*24*7 });
}
export async function clearSession() { const jar = await cookies(); jar.delete(COOKIE); }
export async function getSession() {
  try {
    const jar = await cookies(); const token = jar.get(COOKIE)?.value; if (!token) return null;
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub) return null;
    return { id:String(payload.sub), name:String(payload.name || ""), email:String(payload.email || ""), role:String(payload.role || "USER") };
  } catch { return null; }
}
export async function requireAdmin() {
  const session = await getSession();
  return session?.role === "ADMIN" ? session : null;
}
export async function findSafeUser(id:string) {
  return prisma.user.findUnique({ where:{ id }, select:{ id:true, name:true, email:true, role:true, createdAt:true } });
}
