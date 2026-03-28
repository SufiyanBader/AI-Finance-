import arcjet, { tokenBucket } from "@arcjet/next";

/**
 * Arcjet client configured with a token-bucket rate limiter.
 * Used inside Server Actions to protect expensive endpoints.
 *
 * Allows 10 requests per user per hour.
 */
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["userId"],
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 10,
      interval: 3600, // seconds – 1 hour
      capacity: 10,
    }),
  ],
});

export default aj;
