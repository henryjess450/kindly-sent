import { existsSync, readdirSync, unlinkSync } from "node:fs";
import path from "node:path";
import { getDb, type CardRow, type UserRow } from "./db";
import { cardArrivedEmail, deliveredEmail, failedEmail } from "./emails";
import { sendMail } from "./mail";
import { insertCard } from "./cards";
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
  const sender = card.user_id ? (db.prepare("SELECT * FROM users WHERE id = ?").get(card.user_id) as UserRow | undefined) : undefined;
  try {
    await sendMail({ to: card.recipient_email, ...cardArrivedEmail(card) });
    db.prepare("UPDATE cards SET status = 'sent', sent_at = ?, last_error = NULL WHERE id = ?").run(Date.now(), card.id);
    if (card.repeat === "yearly") scheduleNextYear(card);
    if (sender) await sendMail({ to: sender.email, ...deliveredEmail(card) }).catch(() => {});
  } catch (err) {
    const attempts = card.attempts + 1;
    const message = err instanceof Error ? err.message : String(err);
    if (attempts >= MAX_ATTEMPTS) {
      db.prepare("UPDATE cards SET status = 'failed', attempts = ?, last_error = ? WHERE id = ?").run(attempts, message, card.id);
      if (sender) await sendMail({ to: sender.email, ...failedEmail(card) }).catch(() => {});
    } else {
      const wait = BACKOFF_MIN[attempts - 1] * 6e4;
      db.prepare("UPDATE cards SET status = 'scheduled', attempts = ?, last_error = ?, next_attempt_at = ? WHERE id = ?").run(attempts, message, Date.now() + wait, card.id);
    }
    console.error(`[scheduler] card ${card.id} attempt ${attempts}:`, message);
  }
}

function scheduleNextYear(card: CardRow) {
  if (!card.user_id) return;
  const date = nextYearDate(card.local_date);
  insertCard(
    {
      design: card.design, font: card.font, message: card.message,
      recipientName: card.recipient_name, recipientEmail: card.recipient_email, senderName: card.sender_name,
      date, time: card.local_time, timezone: card.timezone, repeat: "yearly", sendNow: false,
    },
    zonedToUtc(date, card.local_time, card.timezone),
    { userId: card.user_id },
    card.parent_id ?? card.id,
  );
}
