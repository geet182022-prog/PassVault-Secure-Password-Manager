import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import AuditLog from "../models/AuditLog.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  ; 
  const logs = await AuditLog.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .limit(100);

  res.json(logs);
});

export default router;
