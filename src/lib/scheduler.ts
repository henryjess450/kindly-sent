import { existsSync, readdirSync, unlinkSync } from "node:fs";
import path from "node:path";
import { getDb, type CardRow, type UserRow } from "./db";
import { cardArrivedEmail, deliveredEmail, failedEmail, giftProblemEmail, renewEmail } from "./emails";
import { sendMail } from "./mail";
import { insertCard } from "./cards";
import { getGift, issueGift } from "./giftcards";
import { getPayment, refund } from "./payments";
import { quote } from "@/config/pricing";
import { nextYearDate, zonedToUtc } from "./time";

const TICK_MS = 15_000;
const MAX_ATTEMPTS = 6;
// 1, 5, 15, 60, 180 minutes between tries.
const BACKOFF_MIN = [1, 5, 15, 60, 180];

let started = false;
let running = false;

export function startScheduler() {
  if (started) return;
  started = true;
  // Cards stuck in "sending" after a crash go back in the queue.
  getDb().prepare("UPDATE cards SET status = 'scheduled' WHERE status = 'sending'").run();
  setInterval(() => void tick(), TICK_MS).unref();
  void tick();
  console.log("[scheduler] delivering cards every", TICK_MS / 1000, "seconds");
}

export async function tick() {
  if (running) return;
  running = true;
  try {
    const db = getDb();
    const now = Date.now();
    const due = db
      .prepare(
        `SELECT * FROM cards WHERE status = 'scheduled' AND send_at <= ? AND (next_attempt_at IS NULL OR next_attempt_at <= ?)
         ORDER BY send_at LIMIT 25`,
      )
      .all(now, now) as CardRow[];
    for (const card of due) {
      // Claim it so a second process never double-sends.
      const claim = db.prepare("UPDATE cards SET status = 'sending' WHERE id = ? AND status = 'scheduled'").run(card.id);
      if (claim.changes !== 1) continue;
      await deliver(card);
    }
    await renewals();
    backupDaily();
  } catch (err) {
    console.error("[scheduler]", err);
  } finally {
    running = false;
  }
}

/** One copy of the database per day in BACKUP_DIR, keeping the last 14. */
function backupDaily() {
  const dir = process.env.BACKUP_DIR;
  if (!dir || !existsSync(dir)) return;
  const day = new Date().toISOString().slice(0, 10);
  const file = path.join(dir, `kindly-${day}.db`);
  if (existsSync(file)) return;
  getDb().exec(`VACUUM INTO '${file.replace(/'/g, "''")}'`);
  const old = readdirSync(dir).filter((f) => /^kindly-\d{4}-\d{2}-\d{2}\.db$/.test(f)).sort().slice(0, -14);
  for (const f of old) unlinkSync(path.join(dir, f));
  console.log("[backup] saved", file);
}

async function deliver(card: CardRow) {
  const db = getDb();
  const senderEmail =
    card.sender_email ?? (card.user_id ? (db.prepare("SELECT email FROM users WHERE id = ?").get(card.user_id) as Pick<UserRow, "email"> | undefined)?.email : undefined);
  const attempts = card.attempts + 1;
  try {
    // Buy the gift card first. If that keeps failing, send the card without it and refund the gift.
    let gift = getGift(card.id);
    if (gift?.status === "held") {
      try {
        await issueGift(gift, card);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        db.prepare("UPDATE gifts SET error = ? WHERE id = ?").run(message, gift.id);
        if (attempts < MAX_ATTEMPTS - 1) throw err;
        db.prepare("UPDATE gifts SET status = 'failed' WHERE id = ?").run(gift.id);
        const pay = getPayment(card.payment_id);
        const refundCents = pay ? pay.gift_cents + pay.fee_cents : 0;
        if (pay) await refund(pay, refundCents, "gift-failed").catch((e) => console.error("[refund]", e));
        if (senderEmail) await sendMail({ to: senderEmail, ...giftProblemEmail(card, gift) }).catch(() => {});
      }
      gift = getGift(card.id);
    }
    await sendMail({ to: card.recipient_email, ...cardArrivedEmail(card, gift) });
    db.prepare("UPDATE cards SET status = 'sent', sent_at = ?, last_error = NULL WHERE id = ?").run(Date.now(), card.id);
    if (card.repeat === "yearly") scheduleNextYear(card, senderEmail);
    if (senderEmail) await sendMail({ to: senderEmail, ...deliveredEmail(card) }).catch(() => {});
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (attempts >= MAX_ATTEMPTS) {
      db.prepare("UPDATE cards SET status = 'failed', attempts = ?, last_error = ? WHERE id = ?").run(attempts, message, card.id);
      if (senderEmail) await sendMail({ to: senderEmail, ...failedEmail(card) }).catch(() => {});
    } else {
      const wait = BACKOFF_MIN[attempts - 1] * 6e4;
      db.prepare("UPDATE cards SET status = 'scheduled', attempts = ?, last_error = ?, next_attempt_at = ? WHERE id = ?").run(attempts, message, Date.now() + wait, card.id);
    }
    console.error(`[scheduler] card ${card.id} attempt ${attempts}:`, message);
  }
}

/** Next year's copy waits for a $1 confirm; the sender is reminded a week before. */
function scheduleNextYear(card: CardRow, senderEmail: string | undefined) {
  if (!senderEmail) return;
  const date = nextYearDate(card.local_date);
  const q = quote(0);
  insertCard(
    {
      design: card.design, font: card.font, ink: card.ink, envelope: card.envelope, liner: card.liner, message: card.message,
      recipientName: card.recipient_name, recipientEmail: card.recipient_email, senderName: card.sender_name,
      date, time: card.local_time, timezone: card.timezone, repeat: "yearly", sendNow: false,
    },
    zonedToUtc(date, card.local_time, card.timezone),
    { userId: card.user_id, email: senderEmail },
    { status: "unpaid", priceCents: q.card + q.cardTax, parentId: card.parent_id ?? card.id },
  );
}

async function renewals() {
  const db = getDb();
  const now = Date.now();
  const due = db
    .prepare("SELECT * FROM cards WHERE status = 'unpaid' AND reminder_sent_at IS NULL AND send_at > ? AND send_at < ? AND sender_email IS NOT NULL")
    .all(now, now + 7 * 864e5) as CardRow[];
  for (const c of due) {
    db.prepare("UPDATE cards SET reminder_sent_at = ? WHERE id = ?").run(now, c.id);
    await sendMail({ to: c.sender_email!, ...renewEmail(c) }).catch(() => {});
  }
  // A yearly card nobody confirmed simply doesn't go out.
  db.prepare("UPDATE cards SET status = 'canceled' WHERE status = 'unpaid' AND send_at < ? AND created_at < ?").run(now, now - 3600e3);
}
