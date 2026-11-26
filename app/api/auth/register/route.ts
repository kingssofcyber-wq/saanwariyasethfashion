import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RegisterBody = {
  name?: unknown;
  email?: unknown;
  password?: unknown;
};

function getErrorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}

function safeErrorDetails(error: unknown) {
  const value = error instanceof Error ? error : new Error("Unknown error");
  return {
    name: value.name,
    code: getErrorCode(error),
    message: value.message
      .replace(/mysql:\/\/[^\s"'`]+/gi, "[DATABASE_URL]")
      .replace(/(password|secret|token)\s*[:=]\s*[^,\s]+/gi, "$1=[REDACTED]")
      .slice(0, 300),
  };
}

export async function POST(req: NextRequest) {
  let body: RegisterBody;

  try {
    body = (await req.json()) as RegisterBody;
  } catch {
    return NextResponse.json(
      { error: "Please submit a valid registration request." },
      { status: 400 }
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (name.length < 2 || name.length > 120 || !validEmail || password.length < 8 || password.length > 128) {
    return NextResponse.json(
      { error: "Enter a valid name and email, and a password between 8 and 128 characters." },
      { status: 400 }
    );
  }

  let user: { id: string; name: string; email: string; role: string };
  let stage = "user_lookup";

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    stage = "password_hash";
    const passwordHash = await bcrypt.hash(password, 12);

    stage = "user_create";
    user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, role: true },
    });
  } catch (error) {
    const details = safeErrorDetails(error);
    console.error("[auth/register] Failed:", { stage, ...details });

    if (details.code === "P2002") {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Registration could not be completed. Please try again later." },
      { status: 503 }
    );
  }

  // The account is already stored at this point. A session failure must not
  // misleadingly report that account creation itself failed.
  stage = "session_creation";
  try {
    await createSession(user);
    return NextResponse.json(
      { user, authenticated: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("[auth/register] Failed:", {
      stage,
      ...safeErrorDetails(error),
    });

    return NextResponse.json(
      {
        user,
        authenticated: false,
        message: "Your account was created. Please sign in once authentication is available.",
      },
      { status: 201 }
    );
  }
}
