import { deriveKey, decryptText, encryptText } from "../utils/cryptoUtils";
import axiosInstance from "../utils/axiosInstance";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import "../css/login.css";
import { Link } from "react-router-dom";

const ChangeMasterPassword = ({ passwordList }) => {
  const { user, vaultKey, setVaultKey } = useAuth();

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRotateVault = async () => {
    if (!vaultKey) {
      alert("Unlock vault first");
      return;
    }

    if (newPass !== confirm) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // ✅ 1. derive old key (double check)
      const oldKey = await deriveKey(oldPass, user.vaultSalt);

      // verify vault
      const check = await decryptText(user.vaultCheck, oldKey);
      if (check !== "vault-check") {
        throw new Error("Wrong old master password");
      }

      // ✅ 2. decrypt all entries
      const decrypted = [];

      for (const p of passwordList) {
        decrypted.push({
          _id: p._id,
          value: p.password, // already decrypted in your state
        });
      }

      // ✅ 3. derive new key
      const newKey = await deriveKey(newPass, user.vaultSalt);

      // ✅ 4. re-encrypt
      const encrypted = [];

      for (const p of decrypted) {
        encrypted.push({
          _id: p._id,
          password: await encryptText(p.value, newKey),
        });
      }

      // new vault check
      const newVaultCheck = await encryptText("vault-check", newKey);

      // ✅ 5. send to backend
      await axiosInstance.put("/passwords/rotate-vault", {
        encryptedPasswords: encrypted,
        // newVaultSalt: newSalt,
        newVaultCheck,
      });

      // ✅ 6. replace key
      setVaultKey(newKey);

      alert("Master password updated successfully");
    } catch (err) {
      console.error("Rotation failed:", err?.message);
      alert("Rotation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div id="toast"></div>
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
      <div className="login-container">
        <form className="login-card gap-5">
          <h2>Change Master Password</h2>
          {!vaultKey && (
            <p className="text-red-600 text-sm mb-4 text-center">
              🔒 Unlock your vault before changing password
            </p>
          )}
          <input
            type="password"
            placeholder="Old master password"
            value={oldPass}
            onChange={(e) => setOldPass(e.target.value)}
            required
          />
          <input
            type="password"
            name="password"
            value={newPass}
            placeholder="New master password"
            onChange={(e) => setNewPass(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <PasswordStrengthMeter password={newPass} />

          <button type="button" onClick={handleRotateVault} disabled={loading}>
            Change Master Password
          </button>
          <div className="flex flex-row justify-between">
            <p className="register-link">
              <Link to="/passwords">👈 Go back</Link>
            </p>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChangeMasterPassword;
