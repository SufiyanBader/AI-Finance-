import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

/**
 * Retrieves the currently authenticated Clerk user and
 * ensures a matching record exists in the database.
 * Creates a new User record on first sign-in.
 *
 * @returns {Promise<import("@prisma/client").User | null>}
 */
export async function checkUser() {
  const user = await currentUser();

  if (!user) return null;

  try {
    // Return existing user if already synced
    const loggedInUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (loggedInUser) return loggedInUser;

    // First login – persist user to database
    const name = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ");

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name: name || null,
        imageUrl: user.imageUrl ?? null,
        email: user.emailAddresses[0]?.emailAddress ?? "",
      },
    });

    return newUser;
  } catch (error) {
    console.error("[checkUser] Error syncing user:", error.message);
    return null;
  }
}
