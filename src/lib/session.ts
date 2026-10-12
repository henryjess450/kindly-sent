import { cookies } from "next/headers";
import { getDb, type UserRow } from "./db";
import { hashToken, newId, newToken } from "./ids";
import { site } from "@/config/site";

const COOKIE = "ks_session";
const SESSION_DAYS = 60;
const LINK_MINUTES = 30;

export async function getUser(): Promise<UserRow | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  const row = getDb()
    .prepare(
      `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > ?`,
    )
    .get(hashToken(raw), Date.now()) as UserRow | undefined;
  return row ?? null;
}

export function findOrCreateUser(email: string): UserRow {
  const db = getDb();
  const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as UserRow | undefined;
  if (existing) return existing;
  const id = newId();
  db.prepare("INSERT INTO users (id, email, created_at) VALUES (?, ?, ?)").run(id, email, Date.now());
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow;
}

export async function startSession(userId: string) {
  const token = newToken();
  const now = Date.now();
  getDb()
    .prepare("INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .run(hashToken(token), userId, now, now + SESSION_DAYS * 864e5);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: site.url.startsWith("https://"),
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function endSession() {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (raw) getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(raw));
  jar.delete(COOKIE);
}

/** Creates a one-time sign-in link. Returns null when the email asked too often. */
export function createLoginLink(email: string, opts: { cardId?: string; next?: string } = {}): string | null {
  const db = getDb();
  const recent = db
    .prepare("SELECT COUNT(*) AS n FROM login_tokens WHERE email = ? AND expires_at > ?")
    .get(email, Date.now() + (LINK_MINUTES - 60) * 6e4) as { n: number };
  if (recent.n >= 6) return null;
  const token = newToken();
  db.prepare(
    "INSERT INTO login_tokens (token_hash, email, card_id, next_path, expires_at) VALUES (?, ?, ?, ?, ?)",
  ).run(hashToken(token), email, opts.cardId ?? null, opts.next ?? null, Date.now() + LINK_MINUTES * 6e4);
  return `${site.url}/auth/verify?token=${token}`;
}

export function consumeLoginToken(token: string) {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM login_tokens WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?")
    .get(hashToken(token), Date.now()) as
    | { token_hash: string; email: string; card_id: string | null; next_path: string | null }
    | undefined;
  if (!row) return null;
  const res = db.prepare("UPDATE login_tokens SET used_at = ? WHERE token_hash = ? AND used_at IS NULL").run(Date.now(), row.token_hash);
  if (res.changes !== 1) return null;
  return row;
}

export const normalizeEmail = (v: unknown) =>
  typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) && v.length <= 254 ? v.trim().toLowerCase() : null;

export const isAdmin = (u: UserRow | null) =>
  !!u && (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).includes(u.email);
