// import nodemailer from "nodemailer";

// const getTransporter = () => {
//   return nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS, // App Password
//     },
//   });
// };

// // 🔐 LOGIN OTP
// export const sendOTPEmail = async (to, otp) => {
//   const transporter = getTransporter();

//   await transporter.sendMail({
//     from: `"Vault Security" <${process.env.EMAIL_USER}>`,
//     to,
//     subject: "Your Login OTP",
//     html: `
//       <h1><strong>PassVault 🔑</strong></h1>
//       <h2>Vault Login Verification</h2>
//       <p>Your OTP is:</p>
//       <h1>${otp}</h1>
//       <p>Valid for 5 minutes.</p>
//     `,
//   });
// };

// // ⚠ NEW DEVICE ALERT
// export const sendNewDeviceAlert = async (to, deviceInfo) => {
//   const transporter = getTransporter();

//   await transporter.sendMail({
//     from: `"Vault Security" <${process.env.EMAIL_USER}>`,
//     to,
//     subject: "⚠ New Device Login Detected",
//     html: `
//       <h2>New Device Login Detected</h2>
//       <p>We detected a login from a new device.</p>
//       <p><b>Device:</b> ${deviceInfo}</p>
//       <p>If this wasn't you, please change your master password immediately.</p>
//     `,
//   });
// };

// // 🔁 GENERIC TEXT MAIL
// export const sendTextEmail = async ({ to, subject, text }) => {
//   const transporter = getTransporter();

//   await transporter.sendMail({
//     from: `"Vault Security" <${process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     text,
//   });
// };

import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ Common sender
const FROM_EMAIL = "PassVault <onboarding@resend.dev>";

/* ----------------------------------------
   🔐 LOGIN OTP EMAIL
-----------------------------------------*/
export const sendOTPEmail = async (to, otp) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "🔐 Your PassVault Login OTP Code",
    html: `
      <h2>PassVault Login Verification</h2>
      <p>Your OTP code is:</p>
      <h1 style="letter-spacing: 4px;">${otp}</h1>
      <p>This code expires in <b>5 minutes</b>.</p>
    `,
  });

  console.log("✅ OTP Email sent via Resend");
};

/* ----------------------------------------
   ⚠ NEW DEVICE ALERT EMAIL
-----------------------------------------*/
export const sendNewDeviceAlert = async (to, deviceInfo) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "⚠ New Device Login Detected",
    html: `
      <h2>New Device Login Alert</h2>
      <p>We detected a login from a new device:</p>
      <p><b>${deviceInfo}</b></p>
      <p>If this wasn't you, please reset your password immediately.</p>
    `,
  });

  console.log("✅ New Device Alert sent via Resend");
};

/* ----------------------------------------
   🔁 GENERIC EMAIL (Forgot Password etc.)
-----------------------------------------*/
export const sendTextEmail = async ({ to, subject, text }) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    text,
  });

  console.log("✅ Generic Email sent via Resend");
};

export const sendContactEmail = async ({ name, email, message }) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "PassVault Contact <onboarding@resend.dev>",
    to: process.env.EMAIL_USER, // your receiving email
    subject: `📩 New Contact Message from ${name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Message:</b></p>
      <p>${message}</p>
    `,
  });

  console.log("✅ Contact email sent via Resend");
};
