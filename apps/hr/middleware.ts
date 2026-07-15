import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth-callback") ||
    pathname.includes("favicon.ico")
  ) {
    return NextResponse.next();
  }

  // Presence check only — the API remains the authority. The shared session cookie is set by
  // the SSO exchange on the .ganzafrica.org parent domain (host-only on localhost in dev).
  const session = request.cookies.get("ganzafrica_auth")?.value;
  if (!session) {
    const login = new URL(`${PORTAL_URL}/login`);
    login.searchParams.set("next", request.url);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
