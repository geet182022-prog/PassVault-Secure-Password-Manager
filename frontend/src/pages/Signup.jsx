import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../css/signup.css";
import { deriveKey, encryptText } from "../utils/cryptoUtils";
import axios from "axios";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import zxcvbn from "zxcvbn";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Signup = () => {
  const navigate = useNavigate();
  const [strength, setStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showMasterPassword, setShowMasterPassword] = useState(false);

  const [form, setform] = useState({
    name: "",
    email: "",
    password: "",
    masterPassword: "",
  });

  const showToast = (msg) => {
    const toast = document.getElementById("toast");
    toast.innerText = msg;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  };

  const handleChange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const passwordRegex = /^(?=.*[!@#$%^&*]).{8,}$/;

    if (!passwordRegex.test(form.password)) {
      showToast("Password must be 8 characters & contain 1 special character");
      return;
    }

    if (form.password.length < 8) {
      showToast("Weak login password");
      return;
    }

    if (form.masterPassword.length < 8) {
      showToast("Weak master password");
      return;
    }

    try {
      const saltBytes = crypto.getRandomValues(new Uint8Array(16));
      const vaultSalt = btoa(String.fromCharCode(...saltBytes)); // store as base64 string

      const key = await deriveKey(form.masterPassword, vaultSalt);

      const vaultCheck = await encryptText("vault-check", key);

      await axios.post("http://localhost:3002/api/auth/signup", {
        name: form.name,
        email: form.email,
        password: form.password, // LOGIN PASSWORD
        vaultSalt,
        vaultCheck,
      });
      showToast("Signup successful!");
      setTimeout(() => {
        navigate("/login"); // home page
      }, 1500);
    } catch (err) {
      console.error("Signup failed:", err?.message);
      showToast("Signup failed");
    }
  };

  // check password strength:
  const checkStrength = (password) => {
    let score = 0;

    if (password.length >= 8) score++; // length
    if (/[A-Z]/.test(password)) score++; // uppercase
    if (/[a-z]/.test(password)) score++; // lowercase
    if (/[0-9]/.test(password)) score++; // number
    if (/[^A-Za-z0-9]/.test(password)) score++; // special char

    setStrength(score);
  };

  return (
    <>
      {/* Toast */}
      <div id="toast"></div>
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
      <div className="register-container">
        <form className="register-card" onSubmit={handleSignup}>
          <h2>Register</h2>

          <div className="form-group  flex flex-col gap-1">
            <label>Username</label>
            <input type="text" name="name" required onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" required onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Login Password</label>
            <div className="input-col">
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  onChange={(e) => {
                    handleChange(e);
                  }}
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <div className="strength-wrapper">
                <PasswordStrengthMeter password={form.password} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Master Password (Vault)</label>
            <div className="input-col">
              <div className="password-field">
                <input
                  type={showMasterPassword ? "text" : "password"}
                  name="masterPassword"
                  value={form.masterPassword}
                  required
                  onChange={(e) => {
                    handleChange(e);
                  }}
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowMasterPassword(!showMasterPassword)}
                >
                  {showMasterPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <div className="strength-wrapper">
                <PasswordStrengthMeter password={form.masterPassword} />
              </div>
            </div>
          </div>

          <button
            disabled={strength < 3}
            className={`register-btn ${
              strength < 3 ? "opacity-85 cursor-not-allowed" : ""
            }`}
          >
            Register
          </button>

          <p className="login-link">
            <Link to="/login">Go back to Login Page</Link>
          </p>
        </form>
      </div>
      Toast
      <div id="toast"></div>
    </>
  );
};

export default Signup;
