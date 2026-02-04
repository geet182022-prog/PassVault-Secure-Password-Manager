import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      await axiosInstance.post("/auth/forgot-password", { email });

      setMsg("OTP sent to your email");
      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 1000);
    } catch (err) {
      setMsg("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setTimeout(() => {
      navigate("/login");
    }, 500);
  };

  return (
    <>
      <div className="fixed inset-0 bg-[radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)] flex items-center justify-center text-white p-4">
        <div className="flex flex-col gap-6 bg-violet-300/20 p-6 sm:p-12 rounded-2xl border border-violet-800 w-full max-w-md">
          <h1 className="font-bold text-xl sm:text-2xl text-center bg-red-600 py-2 rounded-2xl">
            Forgot Password
          </h1>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full"
          >
            <input
              type="email"
              className="bg-white/30 py-2 px-3 rounded w-full sm:flex-1"
              placeholder="Enter registered email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              className="font-bold text-center bg-green-600 py-2 px-4 rounded w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>

          <button
            type="button"
            className="font-bold text-center bg-blue-600 py-2 px-4 rounded w-fit self-center mt-2"
            onClick={handleCancel}
          >
            Cancel
          </button>

          {msg && (
            <p className="text-center text-sm sm:text-base mt-2 break-words">
              {msg}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
