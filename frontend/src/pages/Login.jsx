import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaLock, FaUser } from "react-icons/fa";
import "../css/login.css";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axiosInstance";
import { getDeviceId } from "../utils/device";

// LOGIN USING 2FA ------------------------->
import "../css/login.css";
const Login = () => {
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const deviceId = getDeviceId();

    try {
      const res = await axiosInstance.post("/auth/login", {
        email: form.email,
        password: form.password,
        deviceId: getDeviceId(),
      });

      if (res.data.step === "OTP_REQUIRED") {
        toast.success("OTP sent to your email");

        navigate("/verify-otp", {
          state: {
            otpToken: res.data.otpToken,
            email: form.email,
          },
        });
        return;
      }

      if (res.data.step === "LOGIN_SUCCESS") {
        login({
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
          user: res.data.user,
        });
        toast.success("Login successful. Unlock your vault.");

        navigate("/unlock", {
          replace: true,
          state: { from: { pathname: "/dashboard" } },
        });
        return;
      }
      toast.error("Unexpected login response");
    } catch (err) {
      console.error("Login failed:", {
        status: err?.response?.status,
        message: err?.message,
      });
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toast */}
      <div id="toast"></div>
      <div>
        <div className="login-container">
          <form className="login-card" onSubmit={handleLogin}>
            <h2>Login</h2>

            <label>
              <FaUser className="input-icon" />
              Email
            </label>

            <input
              type="text"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
            />

            <label>
              <FaLock className="input-icon" />
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Checking..." : "Login"}
            </button>

            <div className="flex flex-row justify-between">
              <p className="register-link">
                New user? <Link to="/signup">Register here</Link>
              </p>
              <p className="register-link">
                <Link to="/forgot-password">Forgot Password?</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
