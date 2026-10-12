import nodemailer, { type Transporter } from "nodemailer";
import { getDb } from "./db";

type Mail = { to: string; subject: string; html: string; text: string };

const live = () => process.env.NODE_ENV === "production" || process.env.EMAIL_SEND_IN_DEV === "true";

let transport: Transporter | undefined;

export async function sendMail(mail: Mail) {
  if (!live()) {
    // Development: keep it local. Read it at /dev/outbox.
    getDb()
      .prepare("INSERT INTO outbox (to_addr, subject, html, created_at) VALUES (?, ?, ?, ?)")
      .run(mail.to, mail.subject, mail.html, Date.now());
    console.log(`[mail preview] to ${mail.to}: ${mail.subject}`);
    return;
  }
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) throw new Error("SMTP is not configured");
  transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: Number(process.env.SMTP_PORT ?? 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transport.sendMail({
    from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
    to: mail.to,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  });
}
