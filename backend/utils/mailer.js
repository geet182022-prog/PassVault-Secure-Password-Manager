import nodemailer from "nodemailer";

const getTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // App Password
    },
  });
};

// 🔐 LOGIN OTP
export const sendOTPEmail = async (to, otp) => {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"Vault Security" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Login OTP",
    html: `
      <h1><strong>PassVault 🔑</strong></h1>
      <h2>Vault Login Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>Valid for 5 minutes.</p>
    `,
  });
};

// ⚠ NEW DEVICE ALERT
export const sendNewDeviceAlert = async (to, deviceInfo) => {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"Vault Security" <${process.env.EMAIL_USER}>`,
    to,
    subject: "⚠ New Device Login Detected",
    html: `
      <h2>New Device Login Detected</h2>
      <p>We detected a login from a new device.</p>
      <p><b>Device:</b> ${deviceInfo}</p>
      <p>If this wasn't you, please change your master password immediately.</p>
    `,
  });
};

// 🔁 GENERIC TEXT MAIL
export const sendTextEmail = async ({ to, subject, text }) => {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"Vault Security" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
};

