"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { request } from "@arcjet/next";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/prisma";
import aj from "@/lib/arcjet";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts Prisma Decimal fields to plain JS numbers.
 *
 * @param {object} obj
 * @returns {object}
 */
function serializeTransaction(obj) {
  const serialized = { ...obj };
  if (obj.balance !== undefined && obj.balance !== null) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount !== undefined && obj.amount !== null) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
}

/**
 * Resolves the authenticated Clerk user to a database User record.
 *
 * @returns {Promise<{ userId: string, user: import("@prisma/client").User }>}
 */
async function getAuthenticatedUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  return { userId, user };
}

/**
 * Calculates the next due date for a recurring transaction.
 *
 * @param {Date|string} startDate
 * @param {"DAILY"|"WEEKLY"|"MONTHLY"|"YEARLY"} interval
 * @returns {Date}
 */
function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      throw new Error(`Unknown recurring interval: ${interval}`);
  }

  return date;
}

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

/**
 * Creates a new transaction and updates the associated account balance.
 * Rate-limited per user via Arcjet (10 req / hour).
 *
 * @param {{
 *   type: "INCOME"|"EXPENSE",
 *   amount: number,
 *   description?: string,
 *   date: Date|string,
 *   category: string,
 *   accountId: string,
 *   isRecurring?: boolean,
 *   recurringInterval?: "DAILY"|"WEEKLY"|"MONTHLY"|"YEARLY"
 * }} data
 * @returns {Promise<{ success: true, data: object }>}
 */
export async function createTransaction(data) {
  try {
    const { userId, user } = await getAuthenticatedUser();

    // ── Rate limiting ────────────────────────────────────────────────────────
    const req = await request();
    const decision = await aj.protect(req, { userId, requested: 1 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error("[createTransaction] Rate limit exceeded", {
          remaining,
          reset,
        });
        throw new Error("Too many requests. Please try again later.");
      }
      throw new Error("Request blocked");
    }

    // ── Verify account ownership ─────────────────────────────────────────────
    const account = await db.account.findUnique({
      where: { id: data.accountId, userId: user.id },
    });
    if (!account) throw new Error("Account not found");

    // ── Balance calculation ───────────────────────────────────────────────────
    const balanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = account.balance.toNumber() + balanceChange;

    // ── Atomic create + balance update ────────────────────────────────────────
    const newTransaction = await db.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          type: data.type,
          amount: data.amount,
          description: data.description ?? null,
          date: new Date(data.date),
          category: data.category,
          accountId: data.accountId,
          userId: user.id,
          isRecurring: data.isRecurring ?? false,
          recurringInterval: data.recurringInterval ?? null,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
          status: "COMPLETED",
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return transaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeTransaction(newTransaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Fetches a single transaction by ID, scoped to the authenticated user.
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function getTransaction(id) {
  try {
    const { user } = await getAuthenticatedUser();

    const transaction = await db.transaction.findUnique({
      where: { id, userId: user.id },
    });

    if (!transaction) throw new Error("Transaction not found");

    return serializeTransaction(transaction);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Updates an existing transaction and recalculates the account balance
 * based on the difference between the old and new amounts/types.
 *
 * @param {string} id
 * @param {object} data - Updated transaction fields.
 * @returns {Promise<{ success: true, data: object }>}
 */
export async function updateTransaction(id, data) {
  try {
    const { user } = await getAuthenticatedUser();

    // Fetch original to compute balance delta
    const original = await db.transaction.findUnique({
      where: { id, userId: user.id },
      include: { account: true },
    });
    if (!original) throw new Error("Transaction not found");

    // Effect the original transaction had on the account balance
    const oldEffect =
      original.type === "EXPENSE"
        ? -original.amount.toNumber()
        : original.amount.toNumber();

    // Effect the updated transaction will have
    const newEffect =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    // Net change to apply to the balance
    const netChange = newEffect - oldEffect;

    const updatedTransaction = await db.$transaction(async (tx) => {
      const transaction = await tx.transaction.update({
        where: { id, userId: user.id },
        data: {
          ...data,
          date: new Date(data.date),
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: original.accountId },
        data: { balance: { increment: netChange } },
      });

      return transaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${original.accountId}`);

    return {
      success: true,
      data: serializeTransaction(updatedTransaction),
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Uses Gemini Vision to extract structured receipt data from an uploaded image.
 *
 * @param {File} file - The receipt image file.
 * @returns {Promise<{
 *   amount: number,
 *   date: string,
 *   description: string,
 *   category: string,
 *   merchantName: string
 * }>}
 */
export async function scanReceipt(file) {
  try {
    await getAuthenticatedUser(); // auth guard only – no user data needed

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const arrayBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
Analyze this receipt image and extract the following information in JSON format:
- amount: total amount (number only)
- date: date of purchase (ISO 8601 format)
- description: brief description or merchant name
- category: one of these exact values:
  housing, transportation, groceries, utilities, entertainment, food,
  shopping, healthcare, education, travel, insurance, gifts, bills,
  other-expense, salary, freelance, investments, business, rental, other-income
- merchantName: store or merchant name

Only respond with valid JSON in this exact format, no markdown fences:
{
  "amount": 0,
  "date": "ISO date string",
  "description": "string",
  "category": "string",
  "merchantName": "string"
}

If the image is not a receipt, return an empty object: {}
`.trim();

    const result = await model.generateContent([
      { inlineData: { data: base64String, mimeType: file.type } },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const { amount, date, description, category, merchantName } =
        JSON.parse(cleanText);
      return { amount, date, description, category, merchantName };
    } catch (parseError) {
      console.error("[scanReceipt] Error parsing JSON:", parseError);
      throw new Error("Invalid response format from AI model");
    }
  } catch (error) {
    console.error("[scanReceipt] Error scanning receipt:", error);
    throw new Error("Failed to scan receipt");
  }
}
