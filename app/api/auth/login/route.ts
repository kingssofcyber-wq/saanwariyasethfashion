import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

function getSafeErrorDetails(error: unknown) {
  const err = error instanceof Error ? error : new Error("Unknown authentication error");
  const errorObject =
    typeof error === "object" && error !== null
      ? (error as Record<string, unknown>)
      : undefined;

  const rawCode = errorObject?.code;
  const code = typeof rawCode === "string" ? rawCode : undefined;

  // Do not log request bodies, passwords, cookies, tokens, or DATABASE_URL.
  const message = err.message
    .replace(/mysql:\/\/[^\s"'`]+/gi, "[DATABASE_URL REDACTED]")
    .replace(/(password|secret|token)\s*[:=]\s*[^,\s]+/gi, "$1=[REDACTED]")
    .slice(0, 400);

  return {
    name: err.name,
    code,
    message,
  };
}

export async function POST(req: NextRequest) {
  let body: LoginBody;

  try {
    body = (await req.json()) as LoginBody;
  } catch {
    return NextResponse.json(
      { error: "Please submit a valid login request." },
      { status: 400 }
    );
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Enter both your email and password." },
      { status: 400 }
    );
  }

  let stage = "user_lookup";

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email or password is incorrect." },
        { status: 401 }
      );
    }

    stage = "password_verification";
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Email or password is incorrect." },
        { status: 401 }
      );
    }

    stage = "session_creation";
    await createSession(user);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    console.error("[auth/login] Failed", {
      stage,
      ...getSafeErrorDetails(error),
    });

    return NextResponse.json(
      {
        error: "Login service is temporarily unavailable. Please try again later.",
      },
      { status: 503 }
    );
  }
}
