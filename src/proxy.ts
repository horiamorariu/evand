import { NextResponse, type NextRequest } from "next/server";

// Proxy rulează în Edge Runtime — firebase-admin nu este disponibil aici.
// Verificăm doar existența cookie-ului de sesiune pentru redirect-uri UX.
// Securitatea reală (verificarea token-ului) se face în Server Components și API routes.

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("__session")?.value;

  const isAuthRoute = pathname.startsWith("/auth");
  const isPublicRoute = pathname === "/";
  // Rutele API nu sunt niciodată redirecționate — gestionează autorizarea intern (401)
  const isApiRoute = pathname.startsWith("/api");

  if (!sessionCookie && !isAuthRoute && !isPublicRoute && !isApiRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  if (sessionCookie && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
