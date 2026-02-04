import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 500, // per IP
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});
