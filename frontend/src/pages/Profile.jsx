import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";

const Profile = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  // const BASE_URL = "http://localhost:3002";
  const [showPwdBox, setShowPwdBox] = useState(false);
  const [showDeleteBox, setShowDeleteBox] = useState(false);
  const [deletePwd, setDeletePwd] = useState("");
  const [strength, setStrength] = useState(0);

  const [pwd, setPwd] = useState({
    oldPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    return () => preview && URL.revokeObjectURL(preview);
  }, [preview]);

  const handlePwdChange = (e) => {
    setPwd({ ...pwd, [e.target.name]: e.target.value });
  };

  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  useEffect(() => {
    if (user) {
      setForm({ name: user.name, email: user.email });
    }
  }, [user]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/users/me");
        setUser(res.data);
      } catch (err) {
        console.error("Profile fetch failed");
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpload = async (e) => {
    // to preview the image before Upload
    const file = e.target.files[0];
    if (!file) return;

    // ✅ Frontend validation
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG and PNG allowed");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Max file size is 2MB");
      return;
    }

    // ✅ Preview
    setPreview(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const res = await axiosInstance.put("/users/photo", formData);
      setUser((prev) => ({ ...prev, photo: res.data.photo }));

      toast.success("Photo updated");
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  // change password
  const changePassword = async () => {
    try {
      if (!pwd.oldPassword || !pwd.newPassword) {
        return toast.error("All fields required");
      }
      if (strength < 3) {
        toast.error("Password too weak");
        return;
      }

      await axiosInstance.put("/users/change-password", pwd);
      toast.success("Password updated successfully");

      setPwd({ oldPassword: "", newPassword: "" });
      setShowPwdBox(false); // hide again
    } catch (err) {
      console.error("Password update failed:", err?.message);
      toast.error("Password update failed");
    }
  };

  // Password strength calculation
  const checkStrength = (password) => {
    let score = 0;

    if (password.length >= 8) score++; // length
    if (/[A-Z]/.test(password)) score++; // uppercase
    if (/[a-z]/.test(password)) score++; // lowercase
    if (/[0-9]/.test(password)) score++; // number
    if (/[^A-Za-z0-9]/.test(password)) score++; // special char

    setStrength(score);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete("/users/me", {
        data: { password: deletePwd },
      });

      // ✅ clear auth immediately
      logout();
      navigate("/signup");
      toast.success("Account deleted");
    } catch (err) {
      console.error("Delete failed:", err?.message); // safe internal log
      toast.error("Delete failed");
    }
  };

  const saveProfile = async () => {
    try {
      const res = await axiosInstance.put("/users/me", form);
      setUser(res.data);
      toast.success("Profile updated");
      setEdit(false);
    } catch (err) {
      console.error("Update failed:", err?.message);
      toast.error("Update failed");
    }
  };

  const cancelChangePwd = () => {
    setPwd({ oldPassword: "", newPassword: "" });
    setShowPwdBox(false);
  };

  if (!user) return <p className="text-white text-center mt-10">Loading...</p>;

  return (
    <>
      <ToastContainer />

      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>

      <div className="min-h-screen flex justify-center items-start pt-10 pb-10 px-4">
        <div className="w-full md:w-[80%] lg:w-[70%] bg-black/40 backdrop-blur-md text-white rounded-2xl shadow-xl p-6 md:p-10">
          <h2 className="text-3xl font-bold mb-8 text-center">Your Profile</h2>

          {/* Main Layout */}
          <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center md:items-start">
            {/* LEFT — PHOTO */}
            <div className="flex flex-col items-center gap-4 w-full md:w-1/2">
              <img
                src={
                  preview ||
                  (user.photo
                    ? `${import.meta.env.VITE_API_URL}${user.photo}`
                    : "/default-user.png")
                }
                className="w-36 h-36 md:w-48 md:h-48 rounded-full object-cover border-4 border-white/20 shadow-lg"
              />

              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleUpload}
                className="text-sm file:bg-blue-600 file:border-none file:px-3 file:py-1 file:rounded file:text-white"
              />

              <button
                onClick={async () => {
                  await axiosInstance.delete("/users/photo");
                  setUser((prev) => ({ ...prev, photo: null }));
                  setPreview(null);
                  toast.success("Photo removed");
                }}
                className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded text-sm"
              >
                Remove Photo
              </button>
            </div>

            {/* RIGHT — DETAILS */}
            <div className="flex flex-col gap-6 w-full md:w-1/2">
              {/* VIEW MODE */}
              {!edit && (
                <div className="space-y-2">
                  <p className="text-lg">
                    <span className="text-gray-300">Name:</span> {user.name}
                  </p>

                  <p className="text-lg">
                    <span className="text-gray-300">Email:</span> {user.email}
                  </p>

                  <button
                    onClick={() => setEdit(true)}
                    className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded mt-3 w-fit"
                  >
                    Edit Profile
                  </button>
                </div>
              )}

              {/* EDIT MODE */}
              {edit && (
                <div className="space-y-3">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full p-3 rounded bg-white/10 focus:outline-none focus:ring focus:ring-blue-500"
                    placeholder="Name"
                  />

                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full p-3 rounded bg-white/10 focus:outline-none focus:ring focus:ring-blue-500"
                    placeholder="Email"
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={saveProfile}
                      className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded"
                    >
                      Save
                    </button>

                    <button
                      onClick={() => setEdit(false)}
                      className="bg-gray-600 hover:bg-gray-700 px-5 py-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <hr className="opacity-30" />

              {/* CHANGE PASSWORD */}
              {!showPwdBox && (
                <button
                  onClick={() => setShowPwdBox(true)}
                  className="bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded w-fit"
                >
                  Change Password
                </button>
              )}

              {showPwdBox && (
                <div className="space-y-3">
                  <input
                    type="password"
                    name="oldPassword"
                    placeholder="Current password"
                    value={pwd.oldPassword}
                    onChange={handlePwdChange}
                    className="w-full p-3 rounded bg-white/10"
                  />

                  <input
                    type="password"
                    name="newPassword"
                    placeholder="New password"
                    value={pwd.newPassword}
                    onChange={(e) => {
                      handlePwdChange(e);
                    }}
                    className="w-full p-3 rounded bg-white/10"
                  />
                  <PasswordStrengthMeter password={pwd.newPassword} />

                  <div className="flex gap-3">
                    <button
                      onClick={changePassword}
                      className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded"
                    >
                      Update
                    </button>

                    <button
                      onClick={cancelChangePwd}
                      className="bg-gray-600 hover:bg-gray-700 px-5 py-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <hr className="opacity-30" />

              {!showDeleteBox && (
                <button
                  onClick={() => setShowDeleteBox(true)}
                  className="bg-red-600 px-4 py-2 rounded w-fit mt-4"
                >
                  Delete Account
                </button>
              )}

              {showDeleteBox && (
                <div className="w-full mt-4 space-y-2 bg-red-900/30 p-4 rounded-lg">
                  <p className="text-sm text-red-300 text-center">
                    Enter password to confirm deletion
                  </p>

                  <input
                    type="password"
                    placeholder="Your password"
                    value={deletePwd}
                    onChange={(e) => setDeletePwd(e.target.value)}
                    className="w-full p-2 rounded bg-white/20 text-white"
                  />

                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={confirmDelete}
                      className="bg-red-600 px-4 py-2 rounded"
                    >
                      Confirm Delete
                    </button>

                    <button
                      onClick={() => {
                        setShowDeleteBox(false);
                        setDeletePwd("");
                      }}
                      className="bg-gray-600 px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
