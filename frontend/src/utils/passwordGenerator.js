export function generatePassword({
  length = 16,
  upper = true,
  lower = true,
  numbers = true,
  symbols = true,
} = {}) {
  const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowerChars = "abcdefghijklmnopqrstuvwxyz";
  const numberChars = "0123456789";
  const symbolChars = "!@#$%^&*()-_=+[]{}<>?/";

  let charset = "";

  if (upper) charset += upperChars;
  if (lower) charset += lowerChars;
  if (numbers) charset += numberChars;
  if (symbols) charset += symbolChars;

  if (!charset) throw new Error("No character set selected");

  const randomValues = new Uint32Array(length);
  window.crypto.getRandomValues(randomValues);

  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length];
  }

  return password;
}
