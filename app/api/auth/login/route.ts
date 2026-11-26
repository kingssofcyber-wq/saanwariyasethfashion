  }

  // Use the same response for an unknown account and a wrong password.
  if (!user) {
    return NextResponse.json(
      { error: "Email or password is incorrect." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (typeof user.passwordHash !== "string" || user.passwordHash.length === 0) {
    console.error("[auth/login] account_password_hash_missing", {
      userId: user.id,
    });
    return unavailableResponse();
  }

  // Step 2: Verify the password hash.
  let passwordMatches = false;
  try {
    passwordMatches = await bcrypt.compare(password, user.passwordHash);
  } catch (error) {
    console.error("[auth/login] password_verification_failed", safeErrorDetails(error));
    return unavailableResponse();
  }

  if (!passwordMatches) {
    return NextResponse.json(
      { error: "Email or password is incorrect." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  // Step 3: Create the authenticated session/cookie.
  try {
    await createSession(user);
  } catch (error) {
    console.error("[auth/login] session_creation_failed", safeErrorDetails(error));
    return unavailableResponse();
  }

  return NextResponse.json(
    {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
