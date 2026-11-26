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

function getPrismaCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}

export async function POST(req: NextRequest) {
  let rawBody: unknown;

  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Please submit a valid registration request." },
      { status: 400 }
    );
  }

  if (
    typeof rawBody !== "object" ||
    rawBody === null ||
    Array.isArray(rawBody)
  ) {
    return NextResponse.json(
      { error: "Please submit a valid registration request." },
      { status: 400 }
    );
  }

  const body = rawBody as RegisterBody;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  // Keep validation simple and explicit. The dot before the domain is escaped.
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (name.length < 2 || name.length > 80 || !validEmail || password.length < 8) {
    return NextResponse.json(
      {
        error:
          "Enter a valid name, email address, and password with at least 8 characters.",
      },
      { status: 400 }
    );
  }

  let stage = "user_lookup";

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    stage = "password_hash";
    const passwordHash = await bcrypt.hash(password, 12);

    stage = "user_create";
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    // Registration creates a regular account according to the Prisma schema's
    // default role. Never accept an ADMIN role from public registration input.
    stage = "session_creation";
    await createSession(user);