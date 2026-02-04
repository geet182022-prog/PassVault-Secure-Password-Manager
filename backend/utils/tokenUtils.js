import jwt from "jsonwebtoken";
import crypto from "crypto";

export const signAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

export const signRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
