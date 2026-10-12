import { getDb, type GroupRow, type SignatureRow, type UserRow } from "./db";
import { ENVELOPES, getDesign, getFont, INKS, isFontId, isOption, LINERS } from "./designs";
import { hashToken, newId, newToken } from "./ids";
import { cleanLink, getPaper, isGiphyUrl, isPhotoSrc, noteLimits, PAPERS, type Media } from "./notes";
import { isAdmin, normalizeEmail } from "./session";
import { isValidZone, utcToLocal, zonedToUtc } from "./time";

const text = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\r\n/g, "\n").trim().slice(0, max) : "");

export type GroupInput = {
  design: string;
  envelope: string;
  liner: string;
  headline: string;
  recipientName: string;
  recipientEmail: string;
  timezone: string;
  dueAt: number;
  deliverAt: number;
};

/** Checks the setup form. `existing` relaxes the "not in the past" rule for dates that weren't changed. */
export function parseGroup(body: Record<string, unknown>, existing?: GroupRow): { ok: true; group: GroupInput } | { ok: false; error: string } {
  const design = String(body.design ?? "");
  if (!getDesign(design)) return { ok: false, error: "Pick a card design." };
  const recipientName = text(body.recipientName, 60);
  if (!recipientName) return { ok: false, error: "Who is the card for?" };
  const recipientEmail = normalizeEmail(body.recipientEmail);
  if (!recipientEmail) return { ok: false, error: "Check their email address." };
  const timezone = String(body.timezone ?? "");
  if (!isValidZone(timezone)) return { ok: false, error: "Pick a time zone." };
  const headline = text(body.headline, 80);
  const envelope = isOption(ENVELOPES, body.envelope) ? body.envelope : "match";
  const liner = isOption(LINERS, body.liner) ? body.liner : "confetti";

  const at = (d: unknown, t: unknown) => {
    const date = String(d ?? "");
    const time = String(t ?? "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return NaN;
    return zonedToUtc(date, time, timezone);
  };
  const dueAt = at(body.dueDate, body.dueTime);
  const deliverAt = at(body.deliverDate, body.deliverTime);
  if (Number.isNaN(dueAt)) return { ok: false, error: "Pick when signatures are due." };
  if (Number.isNaN(deliverAt)) return { ok: false, error: "Pick when the card is delivered." };
  const now = Date.now() - 60_000;
  if (deliverAt < now && deliverAt !== existing?.deliver_at) return { ok: false, error: "The delivery time has already passed." };
  if (dueAt < now && !existing) return { ok: false, error: "The signing deadline has already passed." };
  if (dueAt > deliverAt) return { ok: false, error: "Signatures need to be due before the card is delivered." };
  if (deliverAt > Date.now() + 366 * 864e5) return { ok: false, error: "Group cards can be delivered up to a year ahead." };
  return { ok: true, group: { design, envelope, liner, headline, recipientName, recipientEmail, timezone, dueAt, deliverAt } };
}

export function insertGroup(g: GroupInput, opts: { cartId: string; ownerEmail: string | null }): GroupRow {
  const id = newId();
  getDb()
    .prepare(
      `INSERT INTO group_cards (id, invite_token, view_token, cart_id, owner_email, design, envelope, liner, headline, recipient_name, recipient_email,
        timezone, due_at, deliver_at, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?)`,
    )
    .run(id, newToken(), newToken(), opts.cartId, opts.ownerEmail, g.design, g.envelope, g.liner, g.headline, g.recipientName, g.recipientEmail, g.timezone, g.dueAt, g.deliverAt, Date.now());
  return getGroup(id)!;
}

export function updateGroup(id: string, g: GroupInput) {
  getDb()
    .prepare(
      `UPDATE group_cards SET design=?, envelope=?, liner=?, headline=?, recipient_name=?, recipient_email=?, timezone=?, due_at=?, deliver_at=?,
        attempts=0, next_attempt_at=NULL, last_error=NULL, reminder_sent_at = CASE WHEN due_at = ? THEN reminder_sent_at ELSE NULL END,
        status = CASE WHEN status = 'failed' THEN 'collecting' ELSE status END
       WHERE id = ? AND status IN ('draft','collecting','failed')`,
    )
    .run(g.design, g.envelope, g.liner, g.headline, g.recipientName, g.recipientEmail, g.timezone, g.dueAt, g.deliverAt, g.dueAt, id);
}

export const getGroup = (id: string) => getDb().prepare("SELECT * FROM group_cards WHERE id = ?").get(id) as GroupRow | undefined;
export const getGroupByInvite = (t: string) => getDb().prepare("SELECT * FROM group_cards WHERE invite_token = ?").get(t) as GroupRow | undefined;
export const getGroupByView = (t: string) => getDb().prepare("SELECT * FROM group_cards WHERE view_token = ?").get(t) as GroupRow | undefined;

export const cartGroups = (cartId: string | null) =>
  cartId ? (getDb().prepare("SELECT * FROM group_cards WHERE cart_id = ? AND status = 'draft' ORDER BY created_at").all(cartId) as GroupRow[]) : [];

export const cartCount = (cartId: string | null) =>
  cartId ? (getDb().prepare("SELECT COUNT(*) AS n FROM group_cards WHERE cart_id = ? AND status = 'draft'").get(cartId) as { n: number }).n : 0;

export type AdminRow = { email: string; role: "owner" | "admin"; added_at: number };
// Spread into plain objects: SQLite rows have no prototype, and React won't pass those to the browser.
export const groupAdmins = (id: string) =>
  (getDb().prepare("SELECT email, role, added_at FROM group_admins WHERE group_id = ? ORDER BY role DESC, added_at").all(id) as AdminRow[]).map((r) => ({ ...r }));

export function addAdmin(groupId: string, email: string, role: "owner" | "admin") {
  getDb().prepare("INSERT OR IGNORE INTO group_admins (group_id, email, role, added_at) VALUES (?, ?, ?, ?)").run(groupId, email, role, Date.now());
}

/** Owners and admins manage a paid card; a draft belongs to whoever has it in their cart. */
export function canManage(g: GroupRow, user: UserRow | null, cartId: string | null): boolean {
  if (g.status === "draft") return (!!cartId && g.cart_id === cartId) || (!!user && g.owner_email === user.email);
  if (!user) return false;
  if (isAdmin(user)) return true; // the site admin can look after any card
  return !!getDb().prepare("SELECT 1 FROM group_admins WHERE group_id = ? AND email = ?").get(g.id, user.email);
}

export const isOwner = (g: GroupRow, user: UserRow | null) => !!user && g.owner_email === user.email;

export function listGroupsFor(email: string) {
  return getDb()
    .prepare(
      `SELECT g.* FROM group_cards g JOIN group_admins a ON a.group_id = g.id
       WHERE a.email = ? AND g.status NOT IN ('draft','canceled') ORDER BY CASE WHEN g.status = 'sent' THEN 1 ELSE 0 END, g.deliver_at`,
    )
    .all(email) as GroupRow[];
}

export const signingOpen = (g: GroupRow) => g.status === "collecting" && Date.now() < g.due_at;

export function signatureCount(groupId: string) {
  return (getDb().prepare("SELECT COUNT(*) AS n FROM signatures WHERE group_id = ? AND hidden = 0").get(groupId) as { n: number }).n;
}

/** What the browser needs about a group card, without tokens it shouldn't see. */
export function publicGroup(g: GroupRow) {
  const due = utcToLocal(g.due_at, g.timezone);
  const deliver = utcToLocal(g.deliver_at, g.timezone);
  return {
    id: g.id,
    design: g.design,
    envelope: g.envelope,
    liner: g.liner,
    headline: g.headline,
    recipientName: g.recipient_name,
    recipientEmail: g.recipient_email,
    timezone: g.timezone,
    dueAt: g.due_at,
    deliverAt: g.deliver_at,
    dueDate: due.date,
    dueTime: due.time,
    deliverDate: deliver.date,
    deliverTime: deliver.time,
    status: g.status,
    priceCents: g.price_cents,
    sentAt: g.sent_at,
    openedAt: g.opened_at,
    signatures: signatureCount(g.id),
  };
}
export type PublicGroup = ReturnType<typeof publicGroup>;

/* ---------- invites ---------- */

export type InviteRow = { id: string; email: string; invited_at: number; signed: number };
export const listInvites = (groupId: string) =>
  (getDb()
    .prepare(
      `SELECT i.id, i.email, i.invited_at, EXISTS(SELECT 1 FROM signatures s WHERE s.invite_id = i.id) AS signed
       FROM group_invites i WHERE i.group_id = ? ORDER BY i.invited_at DESC`,
    )
    .all(groupId) as InviteRow[]).map((r) => ({ ...r }));

/** Adds invites for new emails and returns just the new ones. */
export function addInvites(groupId: string, emails: string[]): { id: string; email: string }[] {
  const db = getDb();
  const have = (db.prepare("SELECT COUNT(*) AS n FROM group_invites WHERE group_id = ?").get(groupId) as { n: number }).n;
  const room = Math.max(0, noteLimits.invitesPerCard - have);
  const added: { id: string; email: string }[] = [];
  for (const email of emails.slice(0, room)) {
    const id = newId();
    const res = db.prepare("INSERT OR IGNORE INTO group_invites (id, group_id, email, invited_at) VALUES (?, ?, ?, ?)").run(id, groupId, email, Date.now());
    if (res.changes === 1) added.push({ id, email });
  }
  return added;
}

/* ---------- signatures ---------- */

export type SignatureInput = {
  name: string;
  message: string;
  font: string;
  ink: string;
  paper: string;
  gifs: Media[];
  keepPhotos: Media[];
  linkUrl: string | null;
  linkLabel: string | null;
};

const num = (v: unknown, fallback: number) => (typeof v === "number" && Number.isFinite(v) && v > 0 && v < 10000 ? Math.round(v) : fallback);

/** Checks a note from the signing page. Photos arrive as files and are checked separately. */
export function parseSignature(body: Record<string, unknown>, newPhotos: number): { ok: true; sig: SignatureInput } | { ok: false; error: string } {
  const name = text(body.name, noteLimits.nameChars);
  if (!name) return { ok: false, error: "Add your name so they know who it's from." };
  const message = text(body.message, noteLimits.messageChars);
  const font = typeof body.font === "string" && isFontId(body.font) ? body.font : "hand";
  const ink = isOption(INKS, body.ink) ? body.ink : "black";
  const paper = isOption(PAPERS, body.paper) ? body.paper : "cream";

  const gifs: Media[] = [];
  for (const m of Array.isArray(body.gifs) ? body.gifs : []) {
    const x = m as Record<string, unknown>;
    if (!isGiphyUrl(x.src)) continue;
    gifs.push({ kind: x.kind === "sticker" ? "sticker" : "gif", src: x.src, w: num(x.w, 200), h: num(x.h, 200), id: String(x.id ?? "").slice(0, 40), title: text(x.title, 80) });
  }
  const keepPhotos: Media[] = [];
  for (const m of Array.isArray(body.keepPhotos) ? body.keepPhotos : []) {
    const x = m as Record<string, unknown>;
    if (isPhotoSrc(x.src)) keepPhotos.push({ kind: "photo", src: x.src, w: num(x.w, 800), h: num(x.h, 800) });
  }
  if (gifs.length + keepPhotos.length + newPhotos > noteLimits.media) return { ok: false, error: `Up to ${noteLimits.media} photos and GIFs per note.` };
  if (!message && gifs.length + keepPhotos.length + newPhotos === 0) return { ok: false, error: "Write a message or add a photo or GIF." };

  let linkUrl: string | null = null;
  if (typeof body.linkUrl === "string" && body.linkUrl.trim()) {
    linkUrl = cleanLink(body.linkUrl);
    if (!linkUrl) return { ok: false, error: "Check the link. It should look like example.com." };
  }
  const linkLabel = linkUrl ? text(body.linkLabel, 60) || null : null;
  return { ok: true, sig: { name, message, font, ink, paper, gifs, keepPhotos, linkUrl, linkLabel } };
}

export const getSignature = (id: string) => getDb().prepare("SELECT * FROM signatures WHERE id = ?").get(id) as SignatureRow | undefined;

export function insertSignature(groupId: string, s: SignatureInput, photos: Media[], inviteId: string | null) {
  const id = newId();
  const editToken = newToken();
  const now = Date.now();
  getDb()
    .prepare(
      `INSERT INTO signatures (id, group_id, edit_hash, invite_id, name, message, font, ink, paper, media, link_url, link_label, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(id, groupId, hashToken(editToken), inviteId, s.name, s.message, s.font, s.ink, s.paper, JSON.stringify([...photos, ...s.gifs]), s.linkUrl, s.linkLabel, now, now);
  return { sig: getSignature(id)!, editToken };
}

export function updateSignature(id: string, s: SignatureInput, media: Media[]) {
  getDb()
    .prepare("UPDATE signatures SET name=?, message=?, font=?, ink=?, paper=?, media=?, link_url=?, link_label=?, updated_at=? WHERE id = ?")
    .run(s.name, s.message, s.font, s.ink, s.paper, JSON.stringify(media), s.linkUrl, s.linkLabel, Date.now(), id);
}

export const sigMedia = (s: SignatureRow): Media[] => {
  try {
    return JSON.parse(s.media) as Media[];
  } catch {
    return [];
  }
};

export const canEditSignature = (s: SignatureRow, editToken: string | null) => !!editToken && hashToken(editToken) === s.edit_hash;

export function listSignatures(groupId: string, opts: { includeHidden?: boolean } = {}) {
  return getDb()
    .prepare(`SELECT * FROM signatures WHERE group_id = ? ${opts.includeHidden ? "" : "AND hidden = 0"} ORDER BY created_at`)
    .all(groupId) as SignatureRow[];
}

export function publicSignature(s: SignatureRow) {
  return {
    id: s.id,
    name: s.name,
    message: s.message,
    font: getFont(s.font).id,
    ink: s.ink,
    paper: getPaper(s.paper).id,
    media: sigMedia(s),
    linkUrl: s.link_url,
    linkLabel: s.link_label,
    hidden: !!s.hidden,
    createdAt: s.created_at,
  };
}
export type PublicSignature = ReturnType<typeof publicSignature>;
