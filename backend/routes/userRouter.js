import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { uploadImage } from "../middlewares/upload.js";
import User from "../models/User.js";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import Password from "../models/password.js";
import { isStrongPassword } from "../utils/passwordValidator.js";
import { encrypt } from "../utils/crypto.js";
import AuditLog from "../models/AuditLog.js";
import { sendTextEmail } from "../utils/mailer.js";
import uploadBackup from "../middlewares/backupUpload.js";
import { decrypt } from "../utils/crypto.js";
import { logEvent } from "../utils/auditLogger.js";

const router = express.Router();

/* GET PROFILE */
router.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  res.json(user);
});

/* UPLOAD / CHANGE PHOTO */
router.put(
  "/photo",
  authMiddleware,
  uploadImage.single("photo"),
  async (req, res) => {
    try {
      const user = await User.findById(req.userId);

      // ✅ delete old photo if exists
      if (user.photo) {
        //const oldPath = path.join(process.cwd(), user.photo);
        const oldPath = path.join(__dirname, user.photo);

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      user.photo = `/uploads/${req.file.filename}`;
      await user.save();
      res.json({ photo: user.photo });
    } catch (err) {
      res.status(500).json({ error: "Upload failed" });
    }
  },
);

/* DELETE ACCOUNT */
router.delete("/me", authMiddleware, async (req, res) => {
  // await User.findByIdAndDelete(req.userId);
  // res.json({ message: "Account deleted" });

  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password required" });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // 🗑 delete profile photo if exists
    if (user.photo) {
      const photoPath = path.join(process.cwd(), "uploads", user.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    // 🗑 delete all passwords of user
    await Password.deleteMany({ userId: user._id });

    // 🗑 delete user
    await User.findByIdAndDelete(user._id);
    await logEvent(req, "ACCOUNT_DELETED");
    res.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    console.error("DELETE ACCOUNT ERROR:", err?.message);
    res.status(500).json({ message: "Account deletion failed" });
  }
});

// DELETE PHOTO
router.delete("/photo", authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId);

  if (user.photo) {
    const filePath = path.join(".", user.photo);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  user.photo = null;
  await user.save();
  await logEvent(req, "PROFILE_PHOTO_DELETED");
  res.json({ message: "Photo removed" });
});

// UPDATE NAME & EMAIL
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "All fields required" });
    }

    // check email uniqueness
    const existing = await User.findOne({ email, _id: { $ne: req.userId } });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, email },
      { new: true },
    ).select("-password");
    await logEvent(req, "NAME & EMAIL UPDATED");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Profile update failed" });
  }
});

/* CHANGE PASSWORD */
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }
    const user = await User.findById(req.userId);
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        message:
          "New password must be strong (uppercase, lowercase, number, special char)",
      });
    }

    const same = await bcrypt.compare(newPassword, user.password);
    if (same) {
      return res.status(400).json({
        message: "New password must be different from old password",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    user.password = hashed;
    await user.save();
    await logEvent(req, "PASSWORD_CHANGED");

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Password update failed" });
  }
});

// EXPORT ENCRYPTED BACKUP
router.get("/export", authMiddleware, async (req, res) => {
  try {
    // 1. get logged in user id from JWT
    const userId = req.userId;

    // 2. fetch only that user's passwords
    const passwords = await Password.find({ user: userId }).select("-__v");

    // 3. convert to JSON string
    const jsonData = JSON.stringify(passwords);

    // 4. encrypt whole file
    const encryptedData = encrypt(jsonData);

    // 5. force download
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=passwords-backup.enc",
    );
    res.setHeader("Content-Type", "application/octet-stream");
    await logEvent(req, "PASSWORD_EXPORTED");
    return res.send(encryptedData);
  } catch (err) {
    console.error("Export failed:", err?.message);
    res.status(500).json({ message: "Export failed" });
  }
});

// import password file, decrypt it and store
router.post(
  "/import",
  authMiddleware,
  uploadBackup.single("file"),
  async (req, res) => {
    try {
      // 1. check file exists
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // 2. read encrypted text from file buffer
      const encryptedText = req.file.buffer.toString("utf8");

      // 3. decrypt file
      const decryptedJson = decrypt(encryptedText);

      // 4. convert JSON string to array
      const passwords = JSON.parse(decryptedJson);

      // 5. attach user id and remove _id
      const cleaned = passwords.map((p) => {
        const { _id, ...rest } = p;
        return {
          ...rest,
          user: req.user.id,
        };
      });

      // 6. insert only new passwords
      let inserted = 0;
      let updated = 0;
      for (let pass of cleaned) {
        const result = await Password.findOneAndUpdate(
          { site: pass.site, username: pass.username, user: req.user.id },
          pass,
          { upsert: true, new: true }, // insert if not exists
        );

        // check if it was a new insert or an update
        const existed = await Password.exists({
          site: pass.site,
          username: pass.username,
          user: req.user.id,
          _id: { $ne: result._id }, // if a different _id exists, it was update
        });

        if (existed) updated++;
        else inserted++;
      }

      await logEvent(req, "PASSWORD_IMPORTED");

      return res.json({
        message: `Import complete. ${inserted} new passwords added.`,
      });
    } catch (err) {
      console.error("Import error:", err?.message);
      res.status(500).json({ message: "Import failed" });
    }
  },
);

export default router;
