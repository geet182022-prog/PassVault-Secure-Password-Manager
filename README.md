# 🔐 Secure Password Manager — MERN Stack

A **production-grade Password Manager** built using the MERN stack with a strong focus on  
**security, encryption, usability, and real-world architecture**.

This application allows users to safely store, manage, and audit their credentials inside a protected vault — similar in concept to tools like Bitwarden or 1Password.

---
# 🚀 Live Demo

🌐 Frontend: https://your-frontend-url

🔗 Backend API: https://your-backend-url

Demo credentials available on request (for security reasons).

# 🎯 Why This Project Stands Out

Most password manager projects stop at saving encrypted data. This project goes much further and mirrors real security products:

✔ Zero‑knowledge‑inspired architecture
✔ Client‑side encryption before data reaches the server
✔ Secure session & refresh token handling
✔ Vault auto‑locking and trusted devices
✔ Audit logging & rate limiting
✔ Built with security reviews, scalability, and recruiters in mind.


### ✨ Core Features
# 🔐 Authentication & Account Security

✔ Secure signup & login flow
✔ Email‑based OTP verification
✔ Two‑Factor Authentication (2FA)
✔ Refresh token rotation
✔ Trusted device tracking
✔ Session restore & auto logout


# 🧠 Zero‑Knowledge Vault Architecture
✔ Client‑side encryption (server never sees plaintext secrets)
✔ Encrypted password storage
✔ Master password never stored
✔ Vault auto‑locks after inactivity
✔ Manual vault lock/unlock


# 🗄️ Password Vault
✔ Add, edit, delete credentials
✔ Masked password display
✔ Show / hide passwords
✔ One‑click secure clipboard copy (auto‑clear)
✔ Password search & filtering
✔ Responsive table + mobile card views


# 📜 Audit Logs & Monitoring
✔ Login, logout, vault access tracking
✔ Password add/edit/delete events
✔ IP address & device metadata
✔ Backend‑secured, tamper‑resistant logs

# 🛡️ Advanced Security Features
✔ Password strength meter (zxcvbn)
✔ Breach detection checks
✔ Rate limiting on sensitive endpoints
✔ Secure error handling (no info leakage)
✔ CSRF‑safe API architecture

# 📦 Additional Capabilities
✔ Import / Export passwords
✔ Profile photo upload
✔ Contact‑Us email integration
✔ oast‑based UX feedback
✔ Axios interceptors for auth refresh
✔ Fully responsive Tailwind UI


# 🖼️ Screenshots
🔑 Authentication
link: screenshots\authentication.png

🗄️ Vault Dashboard
link: screenshots\vault_page.png

📜 Audit Logs
link: screenshots\audit_page.png

📌 Screenshots are stored in the /screenshots directory.


🛠️ Tech Stack
### Frontend
✔ React.js (Vite)
✔ Tailwind CSS
✔ Axios
✔ React Router
✔ Zxcvbn

### Backend
✔ Node.js
✔ Express.js
✔ MongoDB
✔ Mongoose
✔ JWT (Access & Refresh Tokens)

### Security
✔ Client‑side encryption
✔ Zero‑knowledge principles
✔ Secure session handling
✔ Protected API routes
✔ Rate limiting & audit logging

📂 Project Structure
# frontend/ — React + Tailwind UI
# backend/ — Node.js API & security logic
# screenshots/ — UI previews


🔒 Security Notes
✔ Passwords are encrypted before reaching the backend
✔ Backend never stores plaintext credentials
✔ Master password is never saved
✔ Error responses are intentionally generic
✔ Logs never expose sensitive data


🚀 Deployment
✔ Frontend: Vercel
✔ Backend: Render
✔ Database: MongoDB Atlas


### 👨‍💻 Author

Geetanjali
MERN Stack Developer | Security‑Focused Full‑Stack Engineer

GitHub: https://github.com/geet182022-prog
LinkedIn: https://www.linkedin.com/in/geetanjali-96a099284/


## 📌 Disclaimer

This project is built for educational and portfolio purposes. It demonstrates real‑world security concepts but should be independently audited before any commercial use.