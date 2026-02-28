import { NextRequest, NextResponse } from "next/server";

/**
 * Subdomain middleware for Titan Journal CRM.
 *
 * CLOUDFLARE TUNNEL SETUP:
 * -----------------------------------------------------------------
 * To enable docs.yourdomain.com you need TWO public hostnames in
 * Cloudflare Zero Trust → Tunnels → Edit → Public Hostnames:
 *
 *   1. yourdomain.com          → http://localhost:3000  (main app)
 *   2. docs.yourdomain.com     → http://localhost:3000  (same port)
 *
 * CF Tunnel preserves the Host header, so Next.js middleware can
 * detect which subdomain is being accessed and route accordingly.
 *
 * BEHAVIOUR:
 *   docs.*  →  rewrites to /docs-public (standalone docs site, no auth)
 *   main domain /docs-public  →  redirect to /docs (access guard)
 * -----------------------------------------------------------------
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const url  = request.nextUrl.clone();

  // Detect docs subdomain: matches "docs." or "docs-" prefix
  const isDocsSub = /^docs[.\-]/i.test(host);

  if (isDocsSub) {
    // All paths on docs subdomain serve the standalone docs app.
    // Static assets / _next / api are excluded by the matcher below.
    if (!url.pathname.startsWith("/docs-public")) {
      url.pathname = "/docs-public";
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // On main domain: prevent direct access to the internal docs-public route
  if (url.pathname.startsWith("/docs-public")) {
    url.pathname = "/docs";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals, static files, and API
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|api/).*)"],
};
