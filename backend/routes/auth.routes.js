import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { isStrongPassword } from "../utils/passwordValidator.js";
import crypto from "crypto";
import { authLimiter } from "../middlewares/authLimiter.js";
import {
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { generateOTP, hashOTP } from "../utils/generateOtp.js";
import { sendOTPEmail } from "../utils/mailer.js";
import TrustedDevice from "../models/TrustedDevice.model.js";
import { hashDeviceId } from "../utils/hash.js";
import { signAccessToken, signRefreshToken } from "../utils/tokenUtils.js";
import { hashToken } from "../utils/tokenUtils.js";
import RefreshToken from "../models/RefreshToken.model.js";
import { logEvent } from "../utils/auditLogger.js";
import Device from "../models/Device.js";
import { generateFingerprint } from "../utils/deviceFingerprint.js";
import { sendNewDeviceAlert } from "../utils/mailer.js";

const router = express.Router();

router.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  res.json(user);
});

// SIGNUP ----------------------->
router.post("/signup", authLimiter, async (req, res) => {
  try {
    const { name, email, password, vaultSalt, vaultCheck } = req.body;

    if (!vaultSalt || !vaultCheck) {
      return res.status(400).json({ message: "Vault data missing" });
    }
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password too weak" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number and special character",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      vaultSalt,
      vaultCheck,
    });

    console.log("USER CREATED");

    res.status(201).json({ success: true, msg: "Signup successful!" });
  } catch (err) {
    console.error("SIGNUP ERROR:", err?.message);
    res.status(500).json({ message: "Signup failed" });
  }
});

// LOGIN-------------------------------->

router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ USER NOT FOUND");
      return res.status(400).json({ msg: "User does not Exist!" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log("❌ PASSWORD MISMATCH");
      return res.status(400).json({ msg: "Invalid Password" });
    }

    const { deviceId } = req.body;

    if (!deviceId) {
      return res.status(400).json({ msg: "Device ID missing" });
    }
    const hashedDeviceId = hashDeviceId(deviceId);
    const trusted = await TrustedDevice.findOne({
      userId: user._id,
      deviceId: hashedDeviceId,
      expiresAt: { $gt: new Date() },
    });

    // IF TRUSTED DEVICE -> DIRECT LOGIN -------------->
    if (trusted) {
      const accessToken = signAccessToken(user._id);
      const refreshToken = signRefreshToken(user._id);
      const refreshHash = hashToken(refreshToken);

      await RefreshToken.create({
        userId: user._id,
        tokenHash: refreshHash,
        deviceId: hashedDeviceId,
        ip: req.ip,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // true in production (https)
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      req.userId = user._id;
      await logEvent(req, "LOGIN");

      // SEND ALERT EMAIL ON LOGIN
      const fingerprint = generateFingerprint(req);

      let device = await Device.findOne({
        userId: user._id,
        fingerprint,
      });

      if (!device) {
        await Device.create({
          userId: user._id,
          fingerprint,
          userAgent: req.headers["user-agent"],
        });

        await logEvent(req, "NEW_DEVICE_LOGIN");
      } else {
        device.lastSeen = new Date();
        await device.save();
      }

      return res.json({
        step: "LOGIN_SUCCESS",
        accessToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          vaultSalt: user.vaultSalt,
          vaultCheck: user.vaultCheck,
        },
        trusted: true,
      });
    }

    // step up authentication USING EMAIL OTP----------------------->

    // 🔐 STEP 1: Generate OTP
    const otp = generateOTP();
    const otpHash = hashOTP(otp);

    // 🔐 STEP 2: Store hashed OTP + expiry
    user.twoFA = {
      otpHash,
      otpExpiry: new Date(Date.now() + 5 * 60 * 1000), // 5 min
    };

    await user.save();

    // 📧 STEP 3: Send Email
    console.log("📩 OTP FLOW TRIGGERED");
    await sendOTPEmail(user.email, otp);

    // 🔐 STEP 4: Issue TEMP token (otpToken)
    const otpToken = jwt.sign(
      { id: user._id, stage: "otp" },
      process.env.JWT_SECRET,
      { expiresIn: "5m" },
    );

    return res.json({
      step: "OTP_REQUIRED",
      otpToken,
      email: user.email,
      msg: "OTP sent to email",
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err?.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// FORGOT PASSWORD
router.post("/forgot-password", authLimiter, forgotPassword);

// RESET PASSWORD
router.post("/reset-password", authLimiter, resetPassword);

// OTP VERIFICATION ROUTE FOR LOGIN
router.post("/verify-otp", async (req, res) => {
  try {
    const { otp, otpToken, deviceId, rememberDevice } = req.body;

    if (!otp || !otpToken || !deviceId) {
      return res.status(400).json({ msg: "Missing data" });
    }

    // 🔐 Verify temp token
    const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);
    if (decoded.stage !== "otp") {
      return res.status(401).json({ msg: "Invalid token stage" });
    }

    const user = await User.findById(decoded.id);

    if (!user || !user.twoFA?.otpHash) {
      return res.status(401).json({ msg: "OTP not found" });
    }

    // ⏱ Check expiry
    if (user.twoFA.otpExpiry < new Date()) {
      user.twoFA = {};
      await user.save();
      return res.status(401).json({ msg: "OTP expired" });
    }

    // 🔐 Compare OTP
    const otpHash = hashOTP(otp.trim());
    if (otpHash !== user.twoFA.otpHash) {
      console.log("INVALID OTP ATTEMPT:", user.email);
      return res.status(401).json({ msg: "Invalid OTP" });
    }

    // ✅ Clear OTP after success
    user.twoFA = {};
    await user.save();

    const hashedDeviceId = hashDeviceId(deviceId);

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);
    const refreshHash = hashToken(refreshToken);

    await RefreshToken.create({
      userId: user._id,
      tokenHash: refreshHash,
      deviceId: hashedDeviceId,
      ip: req.ip,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    if (rememberDevice) {
      await TrustedDevice.findOneAndUpdate(
        { userId: user._id, deviceId: hashedDeviceId },
        {
          userId: user._id,
          deviceId: hashedDeviceId,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        { upsert: true, new: true },
      );
    }

    const fingerprint = generateFingerprint(req);

    let device = await Device.findOne({
      userId: user._id,
      fingerprint,
    });

    if (!device) {
      await Device.create({
        userId: user._id,
        fingerprint,
        userAgent: req.headers["user-agent"],
      });

      await logEvent(req, "NEW_DEVICE_LOGIN");

      // 📧 EMAIL ALERT
      try {
        await sendNewDeviceAlert(user.email, req.headers["user-agent"]);
      } catch (e) {
        console.error("⚠ DEVICE ALERT EMAIL FAILED:", e?.message);
      }
    }
    await logEvent(req, "LOGIN");

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      step: "LOGIN_SUCCESS",
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        vaultSalt: user.vaultSalt,
        vaultCheck: user.vaultCheck,
      },
    });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err?.message);
    res.status(401).json({ msg: "OTP verification failed" });
  }
});

router.post("/trust-device", authMiddleware, async (req, res) => {
  try {
    const { deviceId } = req.body;

    if (!deviceId) {
      return res.status(400).json({ msg: "Device ID required" });
    }

    const hashed = hashDeviceId(deviceId);

    await TrustedDevice.findOneAndUpdate(
      { userId: req.userId, deviceId: hashed },
      { userId: req.userId, deviceId: hashed },
      { upsert: true, new: true },
    );

    res.json({ msg: "Device trusted for 30 days" });
  } catch (err) {
    console.error("TRUST DEVICE ERROR:", err?.message);
    res.status(500).json({ msg: "Could not trust device" });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    // const { deviceId } = req.body;
    const deviceId = req.body.deviceId || req.headers["x-device-id"];

    if (!refreshToken || !deviceId) {
      return res.status(401).json({ msg: "Invalid refresh request" });
    }

    const tokenHash = hashToken(refreshToken);
    const deviceHash = hashDeviceId(deviceId);

    const stored = await RefreshToken.findOne({
      tokenHash,
      deviceId: deviceHash,
      revoked: false,
    });

    if (!stored) return res.status(401).json({ msg: "Invalid refresh token" });

    if (stored.expiresAt < new Date()) {
      return res.status(401).json({ msg: "Expired refresh token" });
    }

    // 🔁 ROTATION
    stored.revoked = true;
    await stored.save();

    const newRefresh = signRefreshToken(stored.userId);
    const newHash = hashToken(newRefresh);

    await RefreshToken.create({
      userId: stored.userId,
      tokenHash: newHash,
      deviceId: deviceHash,
      ip: req.ip,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const newAccess = signAccessToken(stored.userId);

    // 🔥 update cookie
    res.cookie("refreshToken", newRefresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken: newAccess });
  } catch (err) {
    console.error("REFRESH ERROR:", err?.message);
    res.status(500).json({ msg: "Refresh failed" });
  }
});

router.post("/logout", authMiddleware, async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const hash = hashToken(refreshToken);

      await RefreshToken.updateOne({ tokenHash: hash }, { revoked: true });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    await logEvent(req, "LOGOUT");

    res.json({ msg: "Logged out" });
  } catch (err) {
    console.error("LOGOUT ERROR:", err?.message);
    res.status(500).json({ msg: "Logout failed" });
  }
});

export default router;
