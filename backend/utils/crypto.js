import crypto from "crypto"

const ALGORITHM = "aes-256-cbc";

// Must be 32 bytes for AES-256
export const getKey = () => {
  if (!process.env.PASSWORD_SECRET) {
    throw new Error("PASSWORD_SECRET not set in environment variables");
  }
  return crypto
    .createHash("sha256")
    .update(process.env.PASSWORD_SECRET)
    .digest(); // 32 bytes
};

// IV must be 16 bytes
const IV_LENGTH = 16;

export const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey();

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  // store iv + encrypted together
  return iv.toString("hex") + ":" + encrypted;
};

export const decrypt = (encryptedText) => {
  const [ivHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const key = getKey();

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

