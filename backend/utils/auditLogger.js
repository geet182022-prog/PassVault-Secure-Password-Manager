import AuditLog from "../models/AuditLog.js";

export const logEvent = async (req, action) => {
  try {
    await AuditLog.create({
      userId: req.userId,
      action,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
  } catch (err) {
    console.error("AUDIT LOG FAIL:", err?.message);
  }
};
