export const isStrongPassword = (password) => {
  // at least 8 chars
  if (password.length < 8) return false;

  // at least one uppercase
  if (!/[A-Z]/.test(password)) return false;

  // at least one lowercase
  if (!/[a-z]/.test(password)) return false;

  // at least one number
  if (!/[0-9]/.test(password)) return false;

  // at least one special char
  if (!/[!@#$%^&*]/.test(password)) return false;

  return true;
};
