import { NextRequest, NextResponse } from "next/server";

/**
 * Subdomain + path middleware for Titan Journal CRM public docs.
 *
 * ┌──────────────────────────────────────────────────────────────┐
 * │ CLOUDFLARE TUNNEL — two scenarios                            │
 * │                                                              │
 * │ A) Quick tunnel (cloudflared tunnel --url localhost:3000)    │
 * │    → You get one URL:  https://abc-xyz.trycloudflare.com     │
 * │    → Share docs as:    https://abc-xyz.trycloudflare.com/    │
 * │                                  docs-public                 │
 * │    → No subdomain support on trycloudflare.com               │
 * │                                                              │
 * │ B) Named tunnel (custom domain on Cloudflare)                │
 * │    → Zero Trust → Tunnels → Edit → Public Hostnames:         │
 * │        yourdomain.com      → http://localhost:3000           │
 * │        docs.yourdomain.com → http://localhost:3000  ← ADD   │
 * │    → Host header preserved; middleware detects docs.*        │
 * │    → docs.yourdomain.com auto-rewrites to /docs-public       │
 * └──────────────────────────────────────────────────────────────┘
 *
 * ROUTING:
 *   docs.*  (any host starting with "docs.")  →  rewrite to /docs-public
 *   /docs-public  on any domain               →  allowed (public, no auth)
 *   /docs         on any domain               →  allowed (dashboard, auth required)
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const url  = request.nextUrl.clone();

  // Detect docs subdomain (docs.something or docs-something)
  const isDocsSub = /^docs[.\-]/i.test(host);

  if (isDocsSub) {
    // Rewrite all paths on the docs subdomain to /docs-public
    if (!url.pathname.startsWith("/docs-public")) {
      url.pathname = "/docs-public";
      return NextResponse.rewrite(url);
    }
  }

  // /docs-public is intentionally accessible on the main domain too.
  // This makes it work with the quick CF tunnel (trycloudflare.com/docs-public).
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|api/).*)"],
};
