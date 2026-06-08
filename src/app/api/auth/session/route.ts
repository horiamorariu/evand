import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie } from "@/lib/firebase/session";
import { SESSION_COOKIE, SESSION_DURATION_MS } from "@/lib/firebase/constants";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { idToken } = await request.json();

  if (!idToken || typeof idToken !== "string") {
    return NextResponse.json({ error: "idToken lipsă" }, { status: 400 });
  }

  try {
    const sessionCookie = await createSessionCookie(idToken);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION_MS / 1000,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Token invalid" }, { status: 401 });
  }
}
