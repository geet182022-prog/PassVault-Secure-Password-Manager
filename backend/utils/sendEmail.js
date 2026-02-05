//for sending SEND OTP FOR PASSWORD CHANGE ---------------> 

import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail App Password
    },
  });

  await transporter.sendMail({
    from: `"Vault Security" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
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

