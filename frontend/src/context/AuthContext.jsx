import { createContext, useEffect, useState, useContext } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useRef } from "react";
import { deriveKey, decryptText } from "../utils/cryptoUtils";
import { getDeviceId } from "../utils/device";
import { setAccessTokenService } from "../utils/tokenService";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vaultKey, setVaultKey] = useState(null);
  const AUTO_LOCK_TIME = 5 * 60 * 1000; // 5 minutes
  const lockTimerRef = useRef(null);
  const [accessToken, setAccessToken] = useState(null);

  // const restoreSession = async () => {
  //   try {
  //     const deviceId = getDeviceId();

  //     const refreshRes = await axiosInstance.post("/auth/refresh", {
  //       deviceId,
  //     });
  //     const { accessToken } = refreshRes.data;

  //     setAccessTokenService(accessToken); // ✅ axios header
  //     setAccessToken(accessToken); // ✅ react state

  //     const meRes = await axiosInstance.get("/auth/me");
  //     setUser(meRes.data);

  //     console.log("✅ Auth restored, vault locked");
  //   } catch (err) {
  //     console.error("RESTORE SESSION FAILED:", err?.message || "Unknown error");
  //     logout();
  //   } finally {
  //     setLoading(false);
  //   }
  // };



  const restoreSession = async () => {
  try {
    const deviceId = getDeviceId();

    const refreshRes = await axiosInstance.post("/auth/refresh", {
      deviceId,
    });

    const { accessToken } = refreshRes.data;

    setAccessTokenService(accessToken);
    setAccessToken(accessToken);

    const meRes = await axiosInstance.get("/auth/me");
    setUser(meRes.data);

    console.log("✅ Auth restored");
  } catch (err) {
    if (err?.response?.status === 401) {
      console.log("ℹ️ No active session yet (user not logged in)");
    } else {
      console.error("RESTORE SESSION FAILED:", err?.message);
    }
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (!vaultKey) return;

    const events = ["mousemove", "keydown", "click", "scroll"];

    const resetVaultTimer = () => {
      if (lockTimerRef.current) {
        clearTimeout(lockTimerRef.current);
      }

      lockTimerRef.current = setTimeout(() => {
        console.log("🔒 Vault auto-locked due to inactivity");
        setVaultKey(null);
      }, AUTO_LOCK_TIME);
    };

    events.forEach((e) => window.addEventListener(e, resetVaultTimer));
    resetVaultTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetVaultTimer));
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    };
  }, [vaultKey]);

  useEffect(() => {
    const handleUnload = () => {
      setVaultKey(null); // lock vault only
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  useEffect(() => {
    const handleForceLogout = () => {
      logout();
    };

    window.addEventListener("force-logout", handleForceLogout);
    return () => window.removeEventListener("force-logout", handleForceLogout);
  }, []);

  const unlockVault = async (masterPassword) => {
    if (!user?.vaultSalt || !user?.vaultCheck) {
      throw new Error("Vault not initialized");
    }

    const key = await deriveKey(masterPassword, user.vaultSalt);

    try {
      const check = await decryptText(user.vaultCheck, key);
      if (check !== "vault-check") throw new Error();
    } catch {
      throw new Error("Wrong master password");
    }
    console.log("Vault unlocked");
    setVaultKey(key);
  };

  const lockVault = () => {
    setVaultKey(null);
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
  };

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (!token) return;

  //   axiosInstance
  //     .get("/users/me")
  //     .then((res) => setUser(res.data))
  //     .catch(() => logout());
  // }, []);

  const login = ({ accessToken, user }) => {
    setAccessTokenService(accessToken); // for axios
    setAccessToken(accessToken); // for React UI
    setUser(user);
  };

  const logout = () => {
    setAccessTokenService(null);
    setUser(null);
    setAccessToken(null);
    setVaultKey(null);
    navigate("/login");
  };

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        //token,
        vaultKey,
        setVaultKey,
        isAuthenticated: !!accessToken,
        accessToken,
        setAccessToken,
        login,
        logout,
        loading,
        unlockVault,
        lockVault,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
