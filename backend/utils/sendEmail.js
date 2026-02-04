// for sending SEND OTP FOR PASSWORD CHANGE ---------------> 

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
