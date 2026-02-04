import crypto from "crypto";

export const generateFingerprint = (req) => {
    const ua = req.headers["user-agent"] || "";
    const ip = req.ip || "";
    const lang = req.headers["accept-language"] || "";

    const raw = `${ua}|${ip}|${lang}`;
    return crypto.createHash("sha256").update(raw).digest("hex");
    
}