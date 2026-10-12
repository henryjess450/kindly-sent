import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

// Gift card numbers and PINs are as good as cash, so they're encrypted in the
// database with AES-256-GCM. The key lives only in .env (GIFT_SECRET_KEY).
// Losing the key means losing access to unrevealed gift codes: back it up.

function key(): Buffer {
  const raw = process.env.GIFT_SECRET_KEY;
  if (raw) {
    const buf = Buffer.from(raw, raw.length === 64 ? "hex" : "base64");
    if (buf.length !== 32) throw new Error("GIFT_SECRET_KEY must be 32 bytes (64 hex characters)");
    return buf;
  }
  if (process.env.NODE_ENV === "production") throw new Error("GIFT_SECRET_KEY is not set");
  return createHash("sha256").update("kindly-sent-dev-only").digest();
}

export function seal(value: unknown): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([c.update(JSON.stringify(value), "utf8"), c.final()]);
  return ["v1", iv.toString("base64url"), c.getAuthTag().toString("base64url"), body.toString("base64url")].join(".");
}

export function open<T>(sealed: string): T {
  const [v, iv, tag, body] = sealed.split(".");
  if (v !== "v1") throw new Error("Unknown secret format");
  const d = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
  d.setAuthTag(Buffer.from(tag, "base64url"));
  return JSON.parse(Buffer.concat([d.update(Buffer.from(body, "base64url")), d.final()]).toString("utf8")) as T;
}
