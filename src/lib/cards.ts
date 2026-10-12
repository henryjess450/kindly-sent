import { site } from "@/config/site";
import { getDb, type CardRow, type UserRow } from "./db";
import { getDesign, isFontId } from "./designs";
import { newId, newToken } from "./ids";
import { normalizeEmail } from "./session";
import { isValidZone, zonedToUtc } from "./time";

export type CardInput = {
  design: string;
  font: string;
  message: string;
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  date: string;
  time: string;
  timezone: string;
  repeat: "none" | "yearly";
  sendNow: boolean;
};

const text = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\r\n/g, "\n").trim().slice(0, max) : "");

/** Checks a card from the composer. Returns the clean card or a message for the person. */
export function parseCard(body: Record<string, unknown>): { ok: true; card: CardInput; sendAt: number } | { ok: false; error: string } {
  const design = String(body.design ?? "");
  if (!getDesign(design)) return { ok: false, error: "Pick a card design." };
  const font = String(body.font ?? "hand");
  if (!isFontId(font)) return { ok: false, error: "Pick a writing style." };
  const message = text(body.message, site.limits.messageChars);
  if (!message) return { ok: false, error: "Write a message inside the card." };
  const recipientName = text(body.recipientName, 60);
  if (!recipientName) return { ok: false, error: "Who is the card for?" };
  const recipientEmail = normalizeEmail(body.recipientEmail);
  if (!recipientEmail) return { ok: false, error: "Check their email address." };
  const senderName = text(body.senderName, 60);
  if (!senderName) return { ok: false, error: "Add your name so they know who it's from." };
  const timezone = String(body.timezone ?? "");
  if (!isValidZone(timezone)) return { ok: false, error: "Pick a time zone." };
  const repeat = body.repeat === "yearly" ? "yearly" : "none";
  const sendNow = body.sendNow === true;

  let date = String(body.date ?? "");
  let time = String(body.time ?? "");
  let sendAt: number;
  if (sendNow) {
    sendAt = Date.now();
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(sendAt));
    const g = (t: string) => parts.find((p) => p.type === t)!.value;
    date = `${g("year")}-${g("month")}-${g("day")}`;
    time = `${g("hour")}:${g("minute")}`;
  } else {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return { ok: false, error: "Pick a delivery date and time." };
    sendAt = zonedToUtc(date, time, timezone);
    if (Number.isNaN(sendAt)) return { ok: false, error: "That date doesn't exist." };
    if (sendAt < Date.now() - 60_000) return { ok: false, error: "That time has already passed." };
    if (sendAt > Date.now() + site.limits.maxScheduleYears * 365 * 864e5) return { ok: false, error: `Cards can be scheduled up to ${site.limits.maxScheduleYears} years ahead.` };
  }
  return { ok: true, sendAt, card: { design, font, message, recipientName, recipientEmail, senderName, date, time, timezone, repeat, sendNow } };
}

export function cardsCreatedToday(userId: string | null, email: string | null) {
  const since = Date.now() - 864e5;
  const row = getDb()
    .prepare("SELECT COUNT(*) AS n FROM cards WHERE created_at > ? AND (user_id = ? OR pending_email = ?)")
    .get(since, userId, email) as { n: number };
  return row.n;
}

export function insertCard(c: CardInput, sendAt: number, owner: { userId: string } | { pendingEmail: string }, parentId: string | null = null): CardRow {
  const db = getDb();
  const id = newId();
  db.prepare(
    `INSERT INTO cards (id, token, user_id, pending_email, design, font, message, recipient_name, recipient_email, sender_name,
      send_at, timezone, local_date, local_time, repeat, status, parent_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id, newToken(),
    "userId" in owner ? owner.userId : null,
    "pendingEmail" in owner ? owner.pendingEmail : null,
    c.design, c.font, c.message, c.recipientName, c.recipientEmail, c.senderName,
    sendAt, c.timezone, c.date, c.time, c.repeat,
    "userId" in owner ? "scheduled" : "pending",
    parentId, Date.now(),
  );
  return getCard(id)!;
}

export function updateCard(id: string, c: CardInput, sendAt: number) {
  getDb()
    .prepare(
      `UPDATE cards SET design=?, font=?, message=?, recipient_name=?, recipient_email=?, sender_name=?, send_at=?, timezone=?,
        local_date=?, local_time=?, repeat=?, attempts=0, next_attempt_at=NULL, last_error=NULL,
        status = CASE WHEN status = 'failed' THEN 'scheduled' ELSE status END
       WHERE id = ? AND status IN ('pending','scheduled','failed')`,
    )
    .run(c.design, c.font, c.message, c.recipientName, c.recipientEmail, c.senderName, sendAt, c.timezone, c.date, c.time, c.repeat, id);
}

export const getCard = (id: string) => getDb().prepare("SELECT * FROM cards WHERE id = ?").get(id) as CardRow | undefined;
export const getCardByToken = (token: string) => getDb().prepare("SELECT * FROM cards WHERE token = ?").get(token) as CardRow | undefined;

export function ownedCard(id: string, user: UserRow | null) {
  const card = getCard(id);
  return card && user && card.user_id === user.id ? card : undefined;
}

export function listCards(userId: string) {
  return getDb()
    .prepare("SELECT * FROM cards WHERE user_id = ? AND status != 'canceled' ORDER BY CASE WHEN status IN ('scheduled','pending','sending','failed') THEN 0 ELSE 1 END, send_at ASC")
    .all(userId) as CardRow[];
}

/** What the composer and dashboard need, without internal fields. */
export function publicCard(c: CardRow) {
  return {
    id: c.id,
    token: c.token,
    design: c.design,
    font: c.font,
    message: c.message,
    recipientName: c.recipient_name,
    recipientEmail: c.recipient_email,
    senderName: c.sender_name,
    sendAt: c.send_at,
    date: c.local_date,
    time: c.local_time,
    timezone: c.timezone,
    repeat: c.repeat,
    status: c.status,
    sentAt: c.sent_at,
    openedAt: c.opened_at,
  };
}
export type PublicCard = ReturnType<typeof publicCard>;
