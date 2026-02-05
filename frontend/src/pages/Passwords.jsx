import React from "react";
import { useEffect, useState, useRef } from "react";
import axiosInstance from "../utils/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { decryptText } from "../utils/cryptoUtils";
import { useAuth } from "../context/AuthContext";
import ChangeMasterPassword from "../components/ChangeMasterPassword";
import { checkBreach } from "../utils/breachUtils";
import copyIcon from "../assets/icons/copy.png";
const Passwords = () => {
  const [passwords, setPasswords] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [visibleId, setVisibleId] = useState(null);
  const [showFav, setShowFav] = useState(false);
  const { vaultKey, accessToken } = useAuth();
  const [show, setShow] = useState(true);
  const [file, setFile] = useState(null);
  const { logout } = useAuth();
  const clearTimerRef = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (!vaultKey || !accessToken) return;
    getPasswords();
  }, [vaultKey, accessToken]);

  // Auto-hide also when tab becomes inactive:
  useEffect(() => {
    const hide = () => setVisibleId(null);
    document.addEventListener("visibilitychange", hide);
    return () => document.removeEventListener("visibilitychange", hide);
  }, []);

  useEffect(() => {
    const handleVisibility = async () => {
      if (document.hidden) {
        try {
          await navigator.clipboard.writeText("");
          if (clearTimerRef.current) {
            clearTimeout(clearTimerRef.current);
            clearTimerRef.current = null;
          }
          toast.info("Clipboard cleared (tab changed)");
        } catch {}
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
      }
      navigator.clipboard.writeText("").catch(() => {});
    };
  }, []);

  // ✅ Fetch all passwords
  const getPasswords = async () => {
    try {
      if (!vaultKey) return;

      const res = await axiosInstance.get("/passwords");
      // setPasswords(res.data);
      if (!Array.isArray(res.data)) {
        throw new Error("Invalid API response");
      }

      const decrypted = await Promise.all(
        res.data.map(async (p) => {
          try {
            return {
              ...p,
              password: await decryptText(p.password, vaultKey),
            };
          } catch (e) {
            console.error("Decrypt failed");
            return null;
          }
        }),
      );

      setPasswords(decrypted.filter(Boolean));
    } catch (err) {
      toast.error("Failed to load passwords");
    }
  };

  // ✅ Copy -------------------------->
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied! Will clear in 60 seconds");

      // clear previous timer if exists
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
      }

      clearTimerRef.current = setTimeout(async () => {
        await navigator.clipboard.writeText("");
        toast.info("Clipboard cleared");
        clearTimerRef.current = null;
      }, 60000);
    } catch (err) {
      toast.error("Copy failed");
    }
  };

  // ✅ Delete
  const deletePassword = async (id) => {
    const confirmDelete = window.confirm("Delete this password?");
    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/passwords/${id}`);
      toast.success("Deleted");
      getPasswords();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // ✅ Edit → go to Manager page with data
  const editPassword = (item) => {
    navigate("/dashboard", { state: { password: item } });
  };

  // 🔍 Filter logic
  const filtered = passwords.filter((p) => {
    if (showFav && !p.isFavorite) return false;
    const matchSearch =
      p.site.toLowerCase().includes(search.toLowerCase()) ||
      p.username.toLowerCase().includes(search.toLowerCase());

    const matchCategory = category === "All" || p.category === category;

    return matchSearch && matchCategory;
  });

  // Toggle favourite
  const toggleFavorite = async (id) => {
    try {
      await axiosInstance.patch(`/passwords/${id}/favorite`);
      getPasswords(); // refresh list
    } catch (err) {
      toast.error("Failed to update favorite");
    }
  };

  //toggle password visibility
  const handleToggleVisible = (id) => {
    if (visibleId === id) {
      setVisibleId(null);
      return;
    }

    setVisibleId(id);

    // auto-hide after 10 sec
    setTimeout(() => {
      setVisibleId(null);
    }, 10000);
  };

  // EXPORT FUNCTION
  const exportBackup = async () => {
    try {
      const res = await axiosInstance.get("/users/export", {
        responseType: "blob",
      });
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "passwords-backup.enc";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Passwords exported successfully!");
    } catch (err) {
      console.error("Export error", err?.message);
    }
  };

  // 🚀 Import Function
  const importBackup = async () => {
    if (!file) {
      alert("Please select a backup file first");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axiosInstance.post("/users/import", formData);

      if (res.status === 200) {
        await getPasswords(); // ✅ refresh table
        toast.success("Passwords imported successfully!");
      } else {
        toast.error("Import failed");
      }
    } catch (err) {
      toast.error("Import failed");
      console.error("Import failed", err?.message);
    }
  };

  // CHECK FOR BREACHED PASSWORDS------------>
  const checkPasswordBreach = async (password) => {
    try {
      const token = localStorage.getItem("token");
      const res = await checkBreach(password);

      if (res.breached) {
        toast.error(`⚠ Found in ${res.count} breaches`);
      } else {
        toast.success("✅ Not found in breaches");
      }
    } catch (err) {
      console.error("Breach check failed", err?.message);
      toast.error("Breach check failed");
    }
  };

  return (
    <>
      <ToastContainer theme="colored" />

      <div className="fixed inset-0 -z-10 bg-[radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>

      <div className="passwords text-white max-w-4xl w-full mx-auto p-4 md:w-3xl relative">
        <h2 className="font-bold text-2xl md:text-3xl py-4 text-center md:text-left">
          Your Passwords
        </h2>

        <div className="flex flex-wrap justify-end gap-3 mb-4">
          <button
            className=" px-3 py-2 text-sm text-white bg-green-500 rounded-lg shadow-lg hover:shadow-xl hover:shadow-blue-500/50 transition duration-300 ease-in-out transform hover:scale-105 mx-3"
            onClick={() => navigate("/change-master", { state: { passwords } })}
          >
            Change Master Password
          </button>

          {/* <button 
          className=" px-3 py-2 text-sm text-white bg-blue-500 rounded-lg shadow-lg hover:shadow-xl hover:shadow-blue-500/50 transition duration-300 ease-in-out transform hover:scale-105"
          onClick={() => checkPasswordBreach(p.password)}>
            Check Breach
          </button> */}
        </div>
        {passwords.length === 0 && <div>No passwords to show</div>}
        {passwords.length != 0 && (
          <div className="div text-white">
            {/* 🔍 Search + Filter */}

            <input
              type="text"
              placeholder="Search by site or username..."
              className="w-full p-2 mb-4 rounded text-white bg-white/15"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="p-2 rounded text-black bg-white/70 mb-4"
            >
              <option>All</option>
              <option>General</option>
              <option>Social</option>
              <option>Work</option>
              <option>Finance</option>
            </select>

            <button
              onClick={() => setShowFav(!showFav)}
              className="bg-white/70 mx-3 px-4 py-2 text-black px-3 py-1 rounded mb-3"
            >
              {showFav ? "Show All" : "Show Favorites ⭐"}
            </button>

            {/* //EXPORT Passwords */}
            <button
              className="bg-red-600 mx-3 px-4 py-2 text-white px-3 py-1 rounded mb-3 shadow-lg hover:shadow-xl hover:shadow-red-500/50
        transition duration-300 ease-in-out transform hover:scale-100"
              onClick={exportBackup}
            >
              Export Passwords 🚀
            </button>

            <div className="flex flex-col gap-3 justify-start my-4 bg-white/15 w-full md:w-fit p-3 rounded ">
              <h2 className="font-bold">Import Passwords</h2>
              <input
                type="file"
                className="text-sm file:bg-blue-600 file:border-none file:px-3 file:py-1 file:rounded file:text-white m-auto"
                accept=".enc"
                onChange={handleFileChange}
              />
              <button
                className="bg-red-600 px-4 py-1 text-white rounded mb-3 w-fit m-auto"
                onClick={importBackup}
              >
                Import
              </button>
            </div>

            {filtered.length === 0 && (
              <p className="text-red-600 font-bold my-2">
                No passwords found...
              </p>
            )}

            {filtered.length !== 0 && (
              <>
                <div className="hidden md:block">
                  <table className="table-auto w-full overflow-hidden rounded-md mb-10">
                    <thead className="bg-white text-black">
                      <tr>
                        <th className="py-2">Site</th>
                        <th className="py-2">Username</th>
                        <th className="py-2">Password</th>
                        <th className="py-2">Category</th>
                        <th className="py-2">Actions</th>
                        <th className="py-2">Check Breach</th>
                      </tr>
                    </thead>
                    <tbody className="bg-black/20">
                      {filtered.map((item, _id) => {
                        return (
                          <tr key={item._id}>
                            <td className="py-2 border border-white/10 text-center w-32">
                              <a href={item.site} target="_blank">
                                {item.site}
                              </a>
                            </td>

                            <td className="py-2 border border-white/10 text-center w-32">
                              <div className="flex items-center justify-around gap-2">
                                {item.username}
                                <img
                                  className="w-4 invert cursor-pointer"
                                  src={copyIcon}
                                  alt=""
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    copyText(item.username);
                                  }}
                                />
                              </div>
                            </td>
                            <td className="py-2 border border-white/10 text-center w-32">
                              <div className="flex items-center justify-around gap-2">
                                {/* {item.password} */}
                                {visibleId === item._id
                                  ? item.password
                                  : "••••••"}
                                <img
                                  className="w-4 invert cursor-pointer"
                                  src={copyIcon}
                                  alt=""
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    copyText(item.password);
                                  }}
                                />
                              </div>
                            </td>

                            <td className="py-2 border border-white/10 text-center w-32">
                              {item.category || "General"}
                            </td>

                            <td className="py-2 border border-white/10 text-center w-32">
                              <div className="flex items-center justify-center gap-5">
                                <span
                                  className="cursor-pointer"
                                  onClick={() => {
                                    editPassword(item);
                                  }}
                                >
                                  <lord-icon
                                    src="https://cdn.lordicon.com/exymduqj.json"
                                    trigger="hover"
                                    stroke="bold"
                                    colors="primary:#ffffff,secondary:#ffffff"
                                    style={{ width: "20px", height: "20px" }}
                                  ></lord-icon>
                                </span>
                                <span
                                  className="cursor-pointer"
                                  onClick={() => {
                                    deletePassword(item._id);
                                  }}
                                >
                                  <lord-icon
                                    src="https://cdn.lordicon.com/jzinekkv.json"
                                    trigger="hover"
                                    stroke="bold"
                                    colors="primary:#ffffff,secondary:#ffffff"
                                    style={{ width: "20px", height: "20px" }}
                                  ></lord-icon>
                                </span>
                                <span>
                                  <span
                                    className="cursor-pointer text-white text-lg"
                                    onClick={() =>
                                      handleToggleVisible(item._id)
                                    }
                                  >
                                    {visibleId === item._id ? (
                                      <FaEyeSlash />
                                    ) : (
                                      <FaEye />
                                    )}
                                  </span>
                                </span>
                                <span
                                  className="cursor-pointer text-xl"
                                  onClick={() => toggleFavorite(item._id)}
                                >
                                  {item.isFavorite ? "⭐" : "☆"}
                                </span>
                              </div>
                            </td>
                            <td className="py-2 border border-white/10 text-center w-32">
                              <div className="flex items-center justify-center gap-5">
                                <button
                                  className="cursor-pointer px-3 py-2 text-sm text-white"
                                  onClick={() =>
                                    checkPasswordBreach(item.password)
                                  }
                                >
                                  ⚠️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* MOBILE CARDS */}
                <div className="md:hidden flex flex-col gap-4 w-full">
                  {filtered.map((item) => (
                    <div
                      key={item._id}
                      className="bg-white/10 p-4 rounded-lg shadow-md flex flex-col gap-2 text-white"
                    >
                      <a
                        href={item.site}
                        target="_blank"
                        className="font-bold text-blue-300 break-all"
                      >
                        {item.site}
                      </a>

                      <div className="flex items-center gap-2">
                        <span className="break-all flex-1">
                          {item.username}
                        </span>
                        <img
                          className="w-4 invert cursor-pointer shrink-0"
                          src={copyIcon}
                          onClick={() => copyText(item.username)}
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <span>
                          {visibleId === item._id ? item.password : "••••••"}
                        </span>
                        <img
                          className="w-4 invert cursor-pointer"
                          src={copyIcon}
                          alt="Copy password"
                          onClick={() => copyText(item.password)}
                        />
                      </div>

                      <div>Category: {item.category || "General"}</div>
                      <div className="flex flex-wrap gap-2 justify-start items-center mt-2">
                        <span
                          className="cursor-pointer"
                          onClick={() => editPassword(item)}
                        >
                          <lord-icon
                            src="https://cdn.lordicon.com/exymduqj.json"
                            trigger="hover"
                            stroke="bold"
                            colors="primary:#ffffff,secondary:#ffffff"
                            style={{ width: "20px", height: "20px" }}
                          ></lord-icon>
                        </span>
                        <span
                          className="cursor-pointer"
                          onClick={() => deletePassword(item._id)}
                        >
                          <lord-icon
                            src="https://cdn.lordicon.com/jzinekkv.json"
                            trigger="hover"
                            stroke="bold"
                            colors="primary:#ffffff,secondary:#ffffff"
                            style={{ width: "20px", height: "20px" }}
                          ></lord-icon>
                        </span>

                        <span
                          className="cursor-pointer text-white text-lg"
                          onClick={() => handleToggleVisible(item._id)}
                        >
                          {visibleId === item._id ? <FaEyeSlash /> : <FaEye />}
                        </span>
                        <span
                          className="cursor-pointer text-xl"
                          onClick={() => toggleFavorite(item._id)}
                        >
                          {item.isFavorite ? "⭐" : "☆"}
                        </span>
                        <button
                          className="px-2 py-1 text-sm text-white  rounded bg"
                          onClick={() => checkPasswordBreach(item.password)}
                        >
                          ⚠️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>{" "}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Passwords;
