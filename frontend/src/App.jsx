import { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Manager from "./components/Manager";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { Routes, Route } from "react-router-dom";
import Passwords from "./pages/Passwords";
import ProtectedRoute from "./components/protectedRoute";
import HomeRedirect from "./components/homeRedirect";
import Profile from "./pages/Profile";
import Unlock from "./pages/Unlock";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ForgotPassword from "./pages/forgotPassword";
import ResetPassword from "./pages/resetPassword";
import VerifyOtp from "./pages/VerifyOtp";
import ChangeMasterPasswordPage from "./components/ChangeMasterPassword";
import AuditLogs from "./pages/AuditLogs";
import ContactUs from "./pages/ContactUs";

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />

      <Navbar />
      <div className="min-h-[80vh]">
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/unlock" element={<Unlock />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/change-master" element={<ChangeMasterPasswordPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Manager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/passwords"
            element={
              <ProtectedRoute>
                <Passwords />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contactUs"
            element={
              <ProtectedRoute>
                <ContactUs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit"
            element={
              <ProtectedRoute>
                <AuditLogs />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default App;
