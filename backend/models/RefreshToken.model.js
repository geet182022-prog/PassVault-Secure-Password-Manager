import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },

    deviceId: String, // optional link to device
    ip: String,

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL auto delete
    },

    revoked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;
