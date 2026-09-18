import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  }
  return transporter;
}

export async function sendNotification({ to, subject, text }) {
  const mailer = getTransporter();
  if (!mailer || !to) {
    console.log(`[notification demo] ${to || "no-email"} | ${subject}`);
    return;
  }

  try {
    await mailer.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text
    });
  } catch (error) {
    console.error("Notification failed:", error.message);
  }
}
