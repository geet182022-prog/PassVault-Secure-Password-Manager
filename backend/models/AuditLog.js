import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true },
  ip: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("AuditLog", auditLogSchema);
