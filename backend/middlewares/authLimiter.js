import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // only 10 attempts
  message: "Too many login attempts. Try again after 15 minutes.",
});
