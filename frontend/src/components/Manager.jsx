import React, { useEffect } from "react";
import { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import { encryptText, decryptText } from "../utils/cryptoUtils";
import { useAuth } from "../context/AuthContext";
import PasswordGenerator from "../components/PasswordGenerator";
import { checkBreach } from "../utils/breachUtils";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";

const Manager = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [form, setform] = useState({
    site: "",
    username: "",
    password: "",
    category: "General",
  });
  const [passwordArray, setpasswordArray] = useState([]);
  const [strength, setStrength] = useState(0);
  const { user, vaultKey, setVaultKey, loading, token } = useAuth();

  const toggle = () => setShow((prev) => !prev);

  // Auto lock when tab hidden
  useEffect(() => {
    const lock = () => setVaultKey(null);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) lock();
    });

    return () => {
      document.removeEventListener("visibilitychange", lock);
    };
  }, []);

  useEffect(() => {
    if (location.state?.password) {
      setform(location.state.password);
    }
  }, [location.state]);

  const checkStrength = (password) => {
    let score = 0;

    if (password.length >= 8) score++; // length
    if (/[A-Z]/.test(password)) score++; // uppercase
    if (/[a-z]/.test(password)) score++; // lowercase
    if (/[0-9]/.test(password)) score++; // number
    if (/[^A-Za-z0-9]/.test(password)) score++; // special char

    setStrength(score);
  };

  // WITH (axiosInstance)----------------------------------->
  const savePassword = async () => {
    if (!vaultKey) {
      toast.error("Vault locked. Enter master password again.");
      return;
    }
    if (
      form.site.length < 3 ||
      form.username.length < 3 ||
      form.password.length < 3
    ) {
      toast.error("Invalid input");
      return;
    }
    try {
      // 🔐 STEP 1 — BREACH CHECK (PLAINTEXT, TEMPORARY)
      const breachResult = await checkBreach(form.password);

      if (breachResult.breached) {
        const proceed = window.confirm(
          `⚠ This password was found in ${breachResult.count} breaches.\n\nDo you still want to save it?`,
        );
        if (!proceed) return;
      }

      // 🔐 ENCRYPT PASSWORD BEFORE SENDING
      const encryptedPassword = await encryptText(form.password, vaultKey);

      const payload = {
        site: form.site,
        username: form.username,
        password: encryptedPassword, // ✅ encrypted object
        category: form.category,
      };

      //SAVE--------->
      if (form._id) {
        await axiosInstance.put(`/passwords/${form._id}`, payload);
        toast.success("Password updated!");
      } else {
        await axiosInstance.post("/passwords", payload);
        toast.success("Password saved!");
      }

      setform({ site: "", username: "", password: "", category: "General" });
    } catch (err) {
      console.error("SAVE ERROR:", err?.message);
      toast.error("Save failed");
    }
  };

  const editPassword = (id) => {
    const pass = passwordArray.find((item) => item._id === id);
    setform(pass);
  };

  const handleChange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value });
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied!", {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } catch (err) {
      console.error("Copy failed", err?.message);
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>

      <div className="md:mycontainer">
        <h1 className="text-white text-2xl font-bold text-center m-auto mt-10">
          <span className="text-4xl">&lt;</span>
          <span className="">Pass</span>
          Vault
          <span className="t text-4xl">&gt;</span>
        </h1>
        <p className=" text-violet-500 text-center font-semibold">
          Your private Password Manager
        </p>
        <div className="text-black flex flex-row flex-wrap md:flex-col md:flex-nowrap p-4 gap-8 items-center">
          <input
            className="rounded-full border border-white text-black m-auto w-full md:w-3xl p-4 py-1  bg-white outline-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            type="text"
            name="site"
            value={form.site}
            id=""
            placeholder="Enter website URL"
            onChange={handleChange}
          />
          <div className="flex flex-wrap md:flex-nowrap gap-8 items-start md:w-3xl ">
            <input
              className="rounded-full border border-white text-black  w-full p-4 py-1 bg-white  h-[34px] outline-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              type="text"
              name="username"
              value={form.username}
              placeholder="Enter Username"
              onChange={handleChange}
            />

            <div className=" relative w-full">
              {/* PASSWORD INPUT */}
              <div className="relative w-full">
                <input
                  className="rounded-full border border-white text-black w-full p-4 py-1 bg-white outline-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  type={show ? "text" : "password"}
                  name="password"
                  value={form.password}
                  placeholder="Enter Password"
                  onChange={(e) => {
                    handleChange(e); // existing form update
                    checkStrength(e.target.value); // 🔥 new: strength check
                  }}
                />

                <span className="absolute right-[3px] top-[4px] cursor-pointer">
                  <img
                    className="p-1"
                    width={26}
                    src={show ? "eye.png" : "eyecross.png"}
                    onClick={toggle}
                  />
                </span>
              </div>
              <PasswordStrengthMeter password={form.password} />
            </div>
            <div>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="rounded-full px-4 py-2 bg-white text-black outline-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                <option>General</option>
                <option>Social</option>
                <option>Work</option>
                <option>Finance</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <input
              className="bg-white rounded-xl px-3 py-1 text-sm"
              type="text"
              name="gen-password"
              placeholder="Enter Length..."
              value={form.password}
              onChange={(e) => {
                setform({ ...form, password: e.target.value });
                checkStrength(e.target.value);
              }}
            />

            <PasswordGenerator
              onGenerate={(pwd) => {
                setform({ ...form, password: pwd });
                checkStrength(pwd);
              }}
            />
          </div>

          <button
            className="flex justify-center items-center bg-violet-900 hover:bg-violet-600 text-white rounded-full px-8 
          py-2 w-fit gap-4"
            onClick={savePassword}
          >
            <lord-icon
              src="https://cdn.lordicon.com/vjgknpfx.json"
              trigger="hover"
              stroke="bold"
              colors="primary:#ffffff,secondary:#ffffff"
            ></lord-icon>
            {form._id ? "Update Password" : "Save Password"}
          </button>
        </div>
      </div>
    </>
  );
};

export default Manager;
