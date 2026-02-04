import zxcvbn from "zxcvbn";

export const getPasswordStrength = (password) => {
  if (!password) return null;

  const result = zxcvbn(password);

  return {
    score: result.score, // 0–4
    crackTime: result.crack_times_display.offline_fast_hashing_1e10_per_second,
    feedback: result.feedback.warning || "Good password",
    suggestions: result.feedback.suggestions,
  };
};
