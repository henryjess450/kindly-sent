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
  const cfg = smtpConfig();
  transport ??= nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
  });
  await transport.sendMail({ from: cfg.from, to: mail.to, subject: mail.subject, html: mail.html, text: mail.text });
}

/**
 * Gmail (GMAIL_USER + GMAIL_APP_PASSWORD, the same lines Coastline uses) wins
 * when set; otherwise any SMTP server via SMTP_*. The From address defaults to
 * the account that sends, since Gmail and Titan both reject other addresses.
 */
function smtpConfig() {
  const clean = (v?: string) => (v ?? "").trim();
  const gmailUser = clean(process.env.GMAIL_USER);
  const gmailPass = clean(process.env.GMAIL_APP_PASSWORD).replace(/\s/g, "");
  const gmail = !!gmailUser && !!gmailPass;
  const user = gmail ? gmailUser : clean(process.env.SMTP_USER);
  const pass = gmail ? gmailPass : clean(process.env.SMTP_PASS);
  const host = gmail ? "smtp.gmail.com" : clean(process.env.SMTP_HOST);
  if (!host || !user || !pass) throw new Error("Email is not set up: add GMAIL_USER and GMAIL_APP_PASSWORD to .env");
  const port = gmail ? 465 : Number(process.env.SMTP_PORT ?? 465);
  const from = clean(process.env.MAIL_FROM) && clean(process.env.MAIL_FROM).includes(user) ? clean(process.env.MAIL_FROM) : `"Kindly Sent" <${user}>`;
  return { host, port, user, pass, from };
}
