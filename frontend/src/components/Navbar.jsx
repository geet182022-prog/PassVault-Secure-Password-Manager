import React from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { AuthContext } from "../context/AuthContext";
import {  useState,useContext } from "react";
import githubIcon from "../assets/icons/github.svg";

const Navbar = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axiosInstance.post(
        "/auth/logout",
        {},
        { withCredentials: true },
      );
    } catch (err) {
      console.error("Logout API failed (continuing)", err?.message);
    }

    localStorage.removeItem("accessToken"); // if you store it
    setUser(null); // 🔥 clears protected routes
    navigate("/login", { replace: true });
  };

  return (
    <>

      <nav className="bg-black/40 backdrop-blur-md border-b border-white/10 z-50">
        <div className="w-full md:mycontainer flex items-center justify-between px-4 py-3">
          {/* LOGO */}
          <div className="logo font-bold text-white text-xl md:text-2xl">
            <span className="text-purple-400 text-3xl">&lt;</span>
            <span className="text-white">Pass</span>
            <span className="text-purple-400">Vault</span>
            <span className="text-purple-400 text-3xl">&gt;</span>
          </div>

          {/* DESKTOP MENU */}
          <ul className="hidden md:flex items-center gap-6 text-white">
            <Link className="hover:text-purple-400 transition" to="/">
              Home
            </Link>
            <Link className="hover:text-purple-400 transition" to="/passwords">
              My Passwords
            </Link>
            <Link className="hover:text-purple-400 transition" to="/profile">
              My Profile
            </Link>
            <Link className="hover:text-purple-400 transition" to="/contactUs">
              Contact Us
            </Link>
            <Link className="hover:text-purple-400 transition" to="/audit">
              Audit 🛡️
            </Link>
            <button
              onClick={handleLogout}
              className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-md transition"
            >
              Logout
            </button>
          </ul>

          {/* GITHUB ICON */}
          <div className="hidden md:block">
            <img
              className="w-7 cursor-pointer"
              src={githubIcon}
              alt="GitHub"
            />
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden text-white text-2xl"
            onClick={() => setOpen((prev) => !prev)}
          >
            ☰
          </button>
        </div>

        {/* MOBILE DROPDOWN */}
        {open && (
          <div className="md:hidden px-4 pb-4 flex flex-col gap-3 text-white bg-black/60 backdrop-blur-md">
            <Link onClick={() => setOpen(false)} to="/">
              Home
            </Link>
            <Link onClick={() => setOpen(false)} to="/passwords">
              My Passwords
            </Link>
            <Link onClick={() => setOpen(false)} to="/profile">
              My Profile
            </Link>
            <Link onClick={() => setOpen(false)} to="/contactUs">
              Contact Us
            </Link>
            <Link onClick={() => setOpen(false)} to="/audit">
              Audit 🛡️
            </Link>
            <button
              onClick={handleLogout}
              className="text-left text-red-400 mt-2"
            >
              Logout
            </button>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
