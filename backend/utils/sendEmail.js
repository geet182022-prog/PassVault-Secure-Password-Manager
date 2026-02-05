//for sending SEND OTP FOR PASSWORD CHANGE ---------------> 

// import nodemailer from "nodemailer";

// export const sendEmail = async ({ to, subject, text }) => {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS, // Gmail App Password
//     },
//   });

//   await transporter.sendMail({
//     from: `"Vault Security" <${process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     text,
//   });
// };


import axios from "axios";

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

/**
 * ✅ Send Email using Brevo API (Render-safe)
 */
export const sendEmail = async ({ to, subject, text }) => {
  try {
    await axios.post(
      BREVO_URL,
      {
        sender: {
          name: "Vault Security",
          email: process.env.BREVO_SENDER_EMAIL, // Verified sender
        },

        to: [{ email: to }],

        subject,

        htmlContent: `
          <h2>${subject}</h2>
          <p>${text}</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Email sent successfully via Brevo API");
  } catch (error) {
    console.error("❌ EMAIL ERROR:", error.response?.data || error.message);
    throw error;
  }
};



// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

// export const sendEmail = async ({ to, subject, text }) => {
//   await resend.emails.send({
//     from: "PassVault <onboarding@resend.dev>",
//     to,
//     subject,
//     text,
//   });

//   console.log("✅ Password Reset Email sent via Resend");
// };

