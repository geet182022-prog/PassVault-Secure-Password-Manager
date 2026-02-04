import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

const Unlock = () => {
  const [masterPassword, setMasterPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { unlockVault } = useAuth();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleUnlock = async (e) => {
    e.preventDefault();
    try {
      await unlockVault(masterPassword);
      toast.success("Vault unlocked");
      navigate(from, { replace: true });
    } catch (err) {
      setError("Wrong master password");
      toast.error("Unlock failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form onSubmit={handleUnlock} className="bg-white/10 p-8 rounded-xl w-80">
        <h2 className="text-xl font-bold mb-4 text-center">🔒 Unlock Vault</h2>

        <input
          type="password"
          placeholder="Enter Master Password"
          value={masterPassword}
          onChange={(e) => setMasterPassword(e.target.value)}
          className="w-full p-2 rounded bg-black/30 outline-none mb-4"
          required
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          type="submit"
          className="w-full bg-violet-700 hover:bg-violet-600 py-2 rounded"
        >
          Unlock
        </button>
      </form>
    </div>
  );
};

export default Unlock;
