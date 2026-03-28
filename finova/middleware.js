import arcjet, { shield, detectBot, createMiddleware } from "@arcjet/next";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Arcjet middleware layer – blocks bad bots and suspicious traffic
 * while allowing known crawlers / monitors through.
 */
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:PREVIEW",
        "CATEGORY:MONITOR",
        "GO_HTTP",
      ],
    }),
  ],
});

/** Routes that require an authenticated Clerk session. */
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);

/**
 * Clerk middleware layer – redirects unauthenticated users
 * away from protected routes.
 */
const clerk = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (!userId && isProtectedRoute(req)) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  return NextResponse.next();
});

/**
 * Compose Arcjet → Clerk middleware chain.
 * Arcjet runs first; only clean requests reach Clerk.
 */
export default createMiddleware(aj, clerk);

export const config = {
  matcher: [
    // Skip Next.js internals and static assets
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
