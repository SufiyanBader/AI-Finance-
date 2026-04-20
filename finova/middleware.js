import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/cloudflare";

// Only initialize if env vars exist — prevents errors during build / cold start
const redis =
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const rateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: false, // analytics:true fires background fetches that can hang the Edge Runtime
      prefix: "finova:global",
    })
  : null;

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
  "/goals(.*)",
  "/analytics(.*)",
  "/search(.*)",
  "/onboarding(.*)",
  "/trips(.*)",
]);

// Known malicious scanners / scrapers
const BOT_USER_AGENTS = [
  "sqlmap",
  "nikto",
  "nmap",
  "masscan",
  "zgrab",
  "python-requests",
  "go-http-client",
  "curl/",
  "wget/",
  "libwww-perl",
  "scrapy",
  "ahrefsbot",
  "semrushbot",
  "mj12bot",
  "dotbot",
];

// Legitimate crawlers that should never be blocked
const ALLOWED_BOTS = [
  "googlebot",
  "bingbot",
  "slurp",
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "facebot",
  "ia_archiver",
  "vercelbot",
  "nextjs",
];

function isMaliciousBot(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  if (ALLOWED_BOTS.some((bot) => ua.includes(bot))) return false;
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

function getClientIp(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "127.0.0.1"
  );
}

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // Skip middleware entirely for static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // Bot protection
  const userAgent = request.headers.get("user-agent") || "";
  if (isMaliciousBot(userAgent)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Block common attack patterns
  // NOTE: .php is intentionally excluded — it false-positives on Next.js RSC URLs
  const url = request.url.toLowerCase();
  const suspiciousPatterns = [
    "wp-admin",
    "wp-login",
    "xmlrpc",
    "eval(",
    "base64_decode",
    "../",
    "etc/passwd",
    "cmd=",
    "exec(",
  ];

  if (suspiciousPatterns.some((p) => url.includes(p))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Global IP-based rate limiting
  if (rateLimiter) {
    const ip = getClientIp(request);
    try {
      const { success, remaining, reset } = await rateLimiter.limit(`ip:${ip}`);
      if (!success) {
        return new NextResponse(
          JSON.stringify({
            error: "Too many requests",
            message: "Please wait before making more requests",
            retryAfter: Math.ceil((reset - Date.now()) / 1000),
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "X-RateLimit-Remaining": remaining.toString(),
              "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
            },
          }
        );
      }
    } catch (error) {
      // Redis unavailable — allow the request through
      console.error("Rate limit check failed:", error.message);
    }
  }

  // Clerk route protection
  // IMPORTANT: auth() inside clerkMiddleware is synchronous in @clerk/nextjs v6.
  // Do NOT use `await auth()` — it returns a Promise whose .userId is always undefined,
  // which would redirect every authenticated user to the sign-in page.
  if (isProtectedRoute(request)) {
    const authObj = auth();
    if (!authObj.userId) {
      return authObj.redirectToSignIn();
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
