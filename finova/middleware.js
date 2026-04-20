import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/cloudflare";

// Only initialize if env vars exist
// Prevents build errors
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
      analytics: true,
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

// Bot user agents to block
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

// Allowed legitimate bots
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

  // Allow good bots first
  const isAllowed = ALLOWED_BOTS.some((bot) => ua.includes(bot));
  if (isAllowed) return false;

  // Block known bad bots
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

  // Skip middleware for static files
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

  // Block suspicious request patterns
  const url = request.url.toLowerCase();
  const suspiciousPatterns = [
    "wp-admin",
    "wp-login",
    ".php",
    "xmlrpc",
    "eval(",
    "base64_decode",
    "../",
    "etc/passwd",
    "cmd=",
    "exec(",
  ];

  const isSuspicious = suspiciousPatterns.some((pattern) =>
    url.includes(pattern)
  );

  if (isSuspicious) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Global rate limiting by IP
  if (rateLimiter) {
    const ip = getClientIp(request);
    const identifier = `ip:${ip}`;

    try {
      const { success, remaining, reset } = await rateLimiter.limit(identifier);

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
      // If Redis is down, allow the request
      console.error("Rate limit check failed:", error.message);
    }
  }

  // Protect routes - redirect to sign in if not authenticated
  if (isProtectedRoute(request)) {
    const authObj = await auth();
    if (!authObj.userId) {
      return authObj.redirectToSignIn();
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
