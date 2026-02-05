import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./db.js";
import Password from "./models/password.js";
import authRoutes from "./routes/auth.routes.js";
import authMiddleware from "./middlewares/auth.middleware.js";
import { encrypt, decrypt } from "./utils/crypto.js";
import userRoutes from "./routes/userRouter.js";
import helmet from "helmet";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import crypto from "crypto";
import path from "path";
import auditRoutes from "./routes/audit.routes.js";
import nodemailer from "nodemailer";

const __dirname = path.resolve();
connectDB();

const app = express();
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// middleware
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173", // local frontend
  "https://pass-vault-secure-password-manager-su7n-g2n6xse28.vercel.app" // deployed frontend
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // allow cookies
  }),
);
app.use(express.json());
app.set("trust proxy", 1);
app.use("/api", apiLimiter);

// Routes
app.use("/api/auth/", authRoutes);
app.use("/api/users", userRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/audit", auditRoutes);

app.get("/", (req, res) => {
  res.json({ msg: "CORS Enabled" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// GET ALL WITH ZERO KNOWLEDGE
app.get("/api/passwords", authMiddleware, async (req, res) => {
  try {
    const passwords = await Password.find({ userId: req.userId });
    res.json(passwords); // ✅ send encrypted data as-is
  } catch (err) {
    console.error("GET PASSWORDS ERROR:", {
      status: err?.response?.status,
      message: err?.message,
    });
    res.status(500).json({ error: "Internal server error" });
  }
});


// Save Passwords
app.post("/api/passwords", authMiddleware, async (req, res) => {
  try {
    const { site, username, password, category } = req.body;

    if (!site || !username || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const saved = await Password.create({
      site,
      username,
      password, // already encrypted from frontend
      category,
      userId: req.userId, // from authMiddleware
    });
    //await logEvent(req, "PASSWORD_CREATED");
    res.json({ success: true, result: saved });
  } catch (err) {
    console.error("SAVE PASSWORD ERROR:", err?.message);
    res.status(500).json({ error: "Failed to save password" });
  }
});

// Delete
app.delete("/api/passwords/:id", authMiddleware, async (req, res) => {
  try {
    const result = await Password.deleteOne({
      _id: req.params.id,
      userId: req.userId, // very important
    });
    res.json({ success: true, result });
  } catch (err) {
    res.status(400).json({ error: err?.message });
  }
});

// UPDATE
app.put("/api/passwords/:id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const { site, username, password } = req.body;

    const updated = await Password.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { site, username, password: password },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ error: "Password not found" });
    }
    res.json({ success: true, result: updated });
  } catch (err) {
    res.status(400).json({ error: err?.message });
  }
});

// ⭐ TOGGLE FAVORITE
app.patch("/api/passwords/:id/favorite", authMiddleware, async (req, res) => {
  try {
    const password = await Password.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!password) {
      return res.status(404).json({ message: "Password not found" });
    }

    password.isFavorite = !password.isFavorite; // ⭐ TOGGLE
    await password.save();

    res.json({ success: true, isFavorite: password.isFavorite });
  } catch (err) {
    res.status(500).json({ message: "Failed to update favorite" });
  }
});

// ROTATE VAULT
app.put("/api/passwords/rotate-vault", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { encryptedPasswords, newVaultCheck } = req.body;

    if (!Array.isArray(encryptedPasswords) || !newVaultCheck) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ msg: "Invalid payload" });
    }

    if (encryptedPasswords.length === 0) {
      throw new Error("No passwords to rotate");
    }

    // ✅ 1. update all passwords
    for (const p of encryptedPasswords) {
      await Password.updateOne(
        { _id: p._id, userId: req.userId },
        { password: p.password },
        { session },
      );
    }

    // ✅ 2. update vault check
    await User.updateOne(
      { _id: req.userId },
      { vaultCheck: newVaultCheck },
      { session },
    );

    // ✅ 3. commit atomically
    await session.commitTransaction();
    session.endSession();

    res.json({ msg: "Vault rotated successfully" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("ROTATE VAULT ERROR:", err?.message);
    res.status(500).json({ msg: "Vault rotation failed" });
  }
});

app.post("/api/breach-check", authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ msg: "No password" });

    if (typeof password !== "string") {
      return res.status(400).json({ error: "Password must be string" });
    }

    // 1. SHA1 hash
    const sha1 = crypto
      .createHash("sha1")
      .update(password)
      .digest("hex")
      .toUpperCase();

    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);

    // 2. Call HIBP
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
    );

    const text = await response.text();

    // 3. Check match
    const found = text.split("\n").find((line) => line.startsWith(suffix));

    const count = found ? parseInt(found.split(":")[1]) : 0;

    res.json({ breached: count > 0, count });
  } catch (err) {
    console.error("BREACH CHECK ERROR:", err?.message);
    res.status(500).json({ msg: "Breach check failed" });
  }
});

// POST /api/contact
app.post("/api/contactUs", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail", // or your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER,
      subject: `New Contact Message from ${name}`,
      text: message,
      html: `<h1><strong>PassVault:🔑</strong></h1>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong> ${message}</p>`,
    });

    res.status(200).json({ msg: "Message sent successfully" });
  } catch (err) {
    console.error(err?.message);
    res.status(500).json({ msg: "Failed to send message" });
  }
});

const PORT = process.env.PORT || 3002; 
app.listen(PORT, () =>
  console.log(
    `Example app listening on port http://localhost:${PORT}!`,
  ),
);
