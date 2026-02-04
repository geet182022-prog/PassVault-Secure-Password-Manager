
const enc = new TextEncoder();
const dec = new TextDecoder();

/* =============================
   DERIVE AES KEY FROM PASSWORD
   ============================= */
export async function deriveKey(masterPassword, vaultSaltBase64) {

  // password → key material
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(masterPassword),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  // ✅ base64 salt → Uint8Array
  const saltBytes = Uint8Array.from(atob(vaultSaltBase64), c =>
    c.charCodeAt(0)
  );

  // derive AES key
  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  return key;
}

/* =============================
   ENCRYPT TEXT
   ============================= */
export async function encryptText(text, key) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(text)
  );

  return {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encrypted)),
  };
}

/* =============================
   DECRYPT TEXT
   ============================= */
export async function decryptText(encryptedObj, key) {
  const { iv, data } = encryptedObj;

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(iv) },
    key,
    new Uint8Array(data)
  );

  return dec.decode(decrypted);
}

export async function exportKeyHex(key) {
  const raw = await crypto.subtle.exportKey("raw", key);
  return Array.from(new Uint8Array(raw))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function importKeyHex(hex) {
  const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
  return crypto.subtle.importKey(
    "raw",
    bytes,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}








