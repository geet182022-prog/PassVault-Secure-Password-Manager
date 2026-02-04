import crypto from "crypto";
import fetch from "node-fetch"; // if Node < 18

router.post("/breach-check", authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ msg: "No password" });

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
    const found = text
      .split("\n")
      .find((line) => line.startsWith(suffix));

    const count = found ? parseInt(found.split(":")[1]) : 0;

    res.json({ breached: count > 0, count });
  } catch (err) {
    console.error("BREACH CHECK ERROR:", err?.message);
    res.status(500).json({ msg: "Breach check failed" });
  }
});
