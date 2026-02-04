import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    photo: {
      type: String, // image URL or filename
      default: "",
    },
    vaultSalt: { type: String, required: true },
    vaultCheck: {
      iv: { type: [Number], required: true },
      data: { type: [Number], required: true },
    },
    resetOtp: {
      type: String,
    },
    resetOtpExpiry: {
      type: Date,
    },
    twoFA: {
      otpHash: String,
      otpExpiry: Date,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

export default mongoose.model("User", userSchema);
