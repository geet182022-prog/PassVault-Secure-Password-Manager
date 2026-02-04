import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { deriveKey, decryptText } from "../utils/cryptoUtils";
import { getDeviceId } from "../utils/device";
import axios from "axios";

const VerifyOtp = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { login, setVaultKey } = useAuth();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const deviceId = getDeviceId(); // your existing logic
  const [trustDevice, setTrustDevice] = useState(true);

  if (!state?.otpToken) {
    navigate("/login");
    return null;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:3002/api/auth/verify-otp",
        {
          otp,
          otpToken: state.otpToken,
          deviceId,
          rememberDevice: trustDevice,
        },
      );

      window.__accessToken = res.data.accessToken;
      localStorage.setItem("refreshToken", res.data.refreshToken);
      login({
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
        user: res.data.user,
      });

      toast.success("Login successful.  Unlock your vault.");

      // ✅ GO TO UNLOCK SCREEN
      navigate("/unlock", {
        replace: true,
        state: { from: { pathname: "/dashboard" } },
      });
    } catch (err) {
      console.error("OTP verification failed:", err?.message);
      toast.error("OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleVerify} className="otp-form">
      <h2>Enter OTP</h2>

      <input
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="6-digit OTP"
        required
      />

      <button disabled={loading}>
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      <label className="flex items-center gap-2 mt-4">
        <input
          type="checkbox"
          checked={trustDevice}
          onChange={(e) => setTrustDevice(e.target.checked)}
        />
        Trust this device for 30 days
      </label>
    </form>
  );
};

export default VerifyOtp;
