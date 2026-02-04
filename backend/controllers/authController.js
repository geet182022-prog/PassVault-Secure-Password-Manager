import crypto from "crypto";
import User from "../models/User.js";
import { generateOTP } from "../utils/generateOtp.js";
import { sendTextEmail } from "../utils/mailer.js";

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const otp = generateOTP();

    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    user.resetOtp = hashedOtp;
    user.resetOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 min

    await user.save();

    await sendTextEmail({
      to: email,
      subject: "Password Reset OTP",
      text: `Your password reset OTP is: ${otp}. Valid for 10 minutes.`,
    });

    res.json({ msg: "OTP sent to email" });
  } catch (err) {
    console.error("Forgot password error:", err?.message);
    res.status(500).json({ msg: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    const user = await User.findOne({
      email,
      resetOtp: hashedOtp,
      resetOtpExpiry: { $gt: Date.now() }, // not expired
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    user.password = newPassword; // pre-save hook will hash
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;

    await user.save();

    res.json({ msg: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err?.message);
    res.status(500).json({ msg: "Server error" });
  }
};
