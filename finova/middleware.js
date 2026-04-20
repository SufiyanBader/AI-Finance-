import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Route protection — all routes below require an authenticated Clerk session
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Middleware
// NOTE: Rate-limiting is intentionally NOT done here.
// Upstash/ratelimit has Node.js internals that crash the Vercel Edge Runtime.
// Per-action rate limiting is enforced in lib/rate-limit.js (Node.js runtime).
// ---------------------------------------------------------------------------
export default clerkMiddleware(async (auth, request) => {
  // IMPORTANT: auth() inside clerkMiddleware is synchronous in @clerk/nextjs v6.
  // Do NOT await it — awaiting returns a Promise whose .userId is always undefined,
  // which redirects every authenticated user to sign-in.
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
