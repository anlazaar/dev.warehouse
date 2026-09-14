import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "dev_warehouse_session";
const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "default_dev_warehouse_secret_key_32_chars_min"
);

async function checkSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAuthenticated = await checkSession(req);

  // Protected API routes
  if (pathname.startsWith("/api/")) {
    // Public API routes
    if (pathname.startsWith("/api/auth/login")) {
      return NextResponse.next();
    }
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Auth pages logic
  if (pathname === "/login") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/workspace", req.url));
    }
    return NextResponse.next();
  }

  // Root path redirect
  if (pathname === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/workspace", req.url));
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Protected application routes (/workspace and subroutes)
  if (pathname.startsWith("/workspace")) {
    if (!isAuthenticated) {
      const response = NextResponse.redirect(new URL("/login", req.url));
      // Ensure no browser caching for protected routes to enforce session locking
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      return response;
    }
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/workspace/:path*", "/api/:path*"],
};
