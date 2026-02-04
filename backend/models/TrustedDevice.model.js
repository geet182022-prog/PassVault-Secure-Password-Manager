import mongoose from "mongoose";

const trustedDeviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    deviceId: {
      type: String, // hashed fingerprint
      required: true,
      index: true,
    },

    userAgent: String,
    ip: String,

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },    // TTL auto delete
    },
  },
  { timestamps: true }
);

// Prevent duplicate trusted devices
trustedDeviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

const TrustedDevice = mongoose.model("TrustedDevice", trustedDeviceSchema);

export default TrustedDevice;
