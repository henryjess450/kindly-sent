import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

// Node's built-in SQLite: no native packages to compile in Docker.
// Migrations are plain SQL, applied in order on first use.
const MIGRATIONS: string[] = [
  `
  CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    notify_open INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE login_tokens (
    token_hash TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    card_id TEXT,
    next_path TEXT,
    expires_at INTEGER NOT NULL,
    used_at INTEGER
  );
  CREATE TABLE sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  );
  CREATE TABLE cards (
    id TEXT PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    pending_email TEXT,
    design TEXT NOT NULL,
    font TEXT NOT NULL,
    message TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    send_at INTEGER NOT NULL,
    timezone TEXT NOT NULL,
    local_date TEXT NOT NULL,
    local_time TEXT NOT NULL,
    repeat TEXT NOT NULL DEFAULT 'none',
    status TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    next_attempt_at INTEGER,
    last_error TEXT,
    sent_at INTEGER,
    opened_at INTEGER,
    parent_id TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX cards_due ON cards(status, send_at);
  CREATE INDEX cards_user ON cards(user_id, send_at);
  CREATE TABLE outbox (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    to_addr TEXT NOT NULL,
    subject TEXT NOT NULL,
    html TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  `,
];

let db: DatabaseSync | undefined;

export function getDb(): DatabaseSync {
  if (db) return db;
  const dir = path.resolve(/*turbopackIgnore: true*/ process.env.DATA_DIR ?? "./data");
  mkdirSync(dir, { recursive: true });
  const conn = new DatabaseSync(path.join(dir, "kindly.db"));
  conn.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
  conn.exec("CREATE TABLE IF NOT EXISTS _migrations (n INTEGER PRIMARY KEY)");
  const row = conn.prepare("SELECT MAX(n) AS n FROM _migrations").get() as { n: number | null };
  for (let i = (row.n ?? 0); i < MIGRATIONS.length; i++) {
    conn.exec("BEGIN");
    try {
      conn.exec(MIGRATIONS[i]);
      conn.prepare("INSERT INTO _migrations (n) VALUES (?)").run(i + 1);
      conn.exec("COMMIT");
    } catch (err) {
      conn.exec("ROLLBACK");
      throw err;
    }
  }
  db = conn;
  return db;
}

export type CardRow = {
  id: string;
  token: string;
  user_id: string | null;
  pending_email: string | null;
  design: string;
  font: string;
  message: string;
  recipient_name: string;
  recipient_email: string;
  sender_name: string;
  send_at: number;
  timezone: string;
  local_date: string;
  local_time: string;
  repeat: "none" | "yearly";
  status: "pending" | "scheduled" | "sending" | "sent" | "failed" | "canceled";
  attempts: number;
  next_attempt_at: number | null;
  last_error: string | null;
  sent_at: number | null;
  opened_at: number | null;
  parent_id: string | null;
  created_at: number;
};

export type UserRow = {
  id: string;
  email: string;
  name: string | null;
  notify_open: number;
  created_at: number;
};
