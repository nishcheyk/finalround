import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Use app password, NOT regular Gmail password if 2FA enabled
  },
  tls: {
    rejectUnauthorized: false, // This fixes self-signed cert issues if any
  },
});

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendMailOptions) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP config missing, email not sent");
    return;
  }

  await transporter.sendMail({
    from: `"75 WAYS technologies" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}
