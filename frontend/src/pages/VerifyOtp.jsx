import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { deriveKey, decryptText } from "../utils/cryptoUtils";
import { getDeviceId } from "../utils/device";

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
      const res = await axiosInstance.post("/auth/verify-otp", {
        otp,
        otpToken: state.otpToken,
        deviceId,
        rememberDevice: trustDevice,
      });

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
    <>
      <ToastContainer theme="colored" />
      <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
        <form
          onSubmit={handleVerify}
          className="bg-white/10 p-8 rounded-xl w-full max-w-sm shadow-lg"
        >
          <h2 className="text-xl font-bold mb-6 text-center"> 🔐 Enter OTP</h2>

          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="6-digit OTP"
            className="w-full p-2 rounded bg-black/30 outline-none mb-4 text-center tracking-widest text-lg"
            required
          />

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-violet-700 hover:bg-violet-600 py-2 rounded transition"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <label className="flex items-center gap-2 mt-5 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={trustDevice}
              onChange={(e) => setTrustDevice(e.target.checked)}
              className="accent-violet-600"
            />
            Trust this device for 30 days
          </label>
        </form>
      </div>
    </>
  );
};

export default VerifyOtp;
