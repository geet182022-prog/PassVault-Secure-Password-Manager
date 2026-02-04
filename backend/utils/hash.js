import crypto from "crypto";

export const hashDeviceId = (deviceId) => {
  return crypto
    .createHash("sha256")
    .update(deviceId)
    .digest("hex");
};
