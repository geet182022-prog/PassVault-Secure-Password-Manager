import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useLocation, useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePwdChange = (e) => {
    setPwd({ ...pwd, [e.target.name]: e.target.value });
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      await axiosInstance.post("/auth/reset-password", {
        email,
        otp,
        newPassword: password,
      });

      setMsg("Password reset successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMsg("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return <p>Please start from Forgot Password page.</p>;
  }

  return (
    <div className="fixed inset-0 bg-[radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)] min-h-screen flex items-center justify-center text-white px-4">
      <div className="w-full max-w-md flex flex-col gap-6 bg-violet-300/20 p-6 sm:p-10 rounded-2xl border border-violet-800">
        <h2 className="font-bold text-2xl mb-4 text-center bg-red-600 py-2 rounded-2xl">
          Reset Password
        </h2>

        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <input
            type="text"
            className="w-full bg-white/30 py-2.5 px-3 rounded text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="Enter OTP"
            value={otp}
            required
            onChange={(e) => setOtp(e.target.value)}
          />

          <input
            type="password"
            placeholder="New Password"
            name="password"
            className="w-full bg-white/30 py-2.5 px-3 rounded text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-violet-500"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordStrengthMeter password={password} />

          <button
            className="w-full font-bold text-center bg-green-600 hover:bg-green-700 transition py-2.5 rounded px-3 cursor-pointer disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {msg && <p className="text-center text-sm">{msg}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
