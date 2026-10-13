import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { getDb } from "@/lib/db";
import { LAMP_ANIM_IDS, type LampAnim } from "./animations";

/*
 * The card lamp: an ESP32-C3 with a 12-LED ring (firmware/lamp). It keeps a
 * request open to /api/lamp; queueLamp() adds an animation and wakes it.
 */

/** What can light the lamp, in the order the admin page lists them. */
export const LAMP_EVENTS = [
  { key: "card", label: "A card is bought" },
  { key: "group", label: "A group card is bought" },
  { key: "free", label: "A free link is used" },
  { key: "renew", label: "A yearly card is renewed" },
  { key: "signed", label: "Someone signs a group card" },
  { key: "delivered", label: "A card is delivered" },
  { key: "opened", label: "A card is opened" },
] as const;
export type LampEvent = (typeof LAMP_EVENTS)[number]["key"];

/** An animation, or "none" so that event leaves the lamp dark. */
export type LampChoice = LampAnim | "none";

export type LampSettings = {
  brightness: number;
  idle: "off" | "glow";
  play: Record<LampEvent, LampChoice>;
  /** Every Nth card bought (cards, group cards and free cards) also plays `milestone.anim`. 0 = never. */
  milestone: { every: number; anim: LampAnim };
  /** No animations from the site between these hours, Victoria time. Play on the admin page still works. */
  quiet: { on: boolean; from: number; to: number };
};

export const LAMP_DEFAULTS: LampSettings = {
  brightness: 40,
  idle: "off",
  play: { card: "sealed", group: "confetti", free: "sealed", renew: "bloom", signed: "ink", delivered: "airmail", opened: "heartbeat" },
  milestone: { every: 25, anim: "fireworks" },
  quiet: { on: false, from: 22, to: 8 },
};

const TIME_ZONE = "America/Vancouver";

const isAnim = (v: unknown): v is LampAnim => typeof v === "string" && (LAMP_ANIM_IDS as string[]).includes(v);
const int = (v: unknown, lo: number, hi: number, fallback: number) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= lo && n <= hi ? n : fallback;
};

/** Anything missing or wrong falls back to the default, so old saved settings keep working. */
export function parseLampSettings(input: unknown): LampSettings {
  const o = (input ?? {}) as Partial<Record<keyof LampSettings, unknown>>;
  const d = LAMP_DEFAULTS;
  const play = (o.play ?? {}) as Record<string, unknown>;
  const ms = (o.milestone ?? {}) as Record<string, unknown>;
  const q = (o.quiet ?? {}) as Record<string, unknown>;
  return {
    brightness: int(o.brightness, 5, 100, d.brightness),
    idle: o.idle === "glow" ? "glow" : "off",
    play: Object.fromEntries(
      LAMP_EVENTS.map(({ key }) => [key, play[key] === "none" || isAnim(play[key]) ? play[key] : d.play[key]]),
    ) as LampSettings["play"],
    milestone: { every: int(ms.every, 0, 10_000, d.milestone.every), anim: isAnim(ms.anim) ? ms.anim : d.milestone.anim },
    quiet: { on: q.on === true, from: int(q.from, 0, 23, d.quiet.from), to: int(q.to, 0, 23, d.quiet.to) },
  };
}

// ── Settings rows ────────────────────────────────────────────────────────

const SETTINGS_KEY = "lamp";
const KEY_KEY = "lamp-key";

const readSetting = (key: string) => (getDb().prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined)?.value;
const writeSetting = (key: string, value: string) =>
  getDb().prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(key, value);

export function getLampSettings(): LampSettings {
  const raw = readSetting(SETTINGS_KEY);
  try {
    return parseLampSettings(raw ? JSON.parse(raw) : {});
  } catch {
    return LAMP_DEFAULTS;
  }
}

export function saveLampSettings(input: unknown) {
  const s = parseLampSettings(input);
  writeSetting(SETTINGS_KEY, JSON.stringify(s));
  return s;
}

// ── The lamp key (the lamp sends it; we only keep its hash) ─────────────

const sha = (s: string) => createHash("sha256").update(s).digest("hex");

/** Makes a new lamp key, replacing the old one. Returns it: it's shown once. */
export function newLampKey() {
  const key = `lamp_${randomBytes(24).toString("base64url")}`;
  writeSetting(KEY_KEY, JSON.stringify({ hash: sha(key), madeAt: Date.now() }));
  return key;
}

export function lampKeyMadeAt(): number | null {
  const raw = readSetting(KEY_KEY);
  return raw ? (JSON.parse(raw) as { madeAt: number }).madeAt : null;
}

export function lampKeyOk(header: string | null) {
  const given = header?.match(/^Bearer (lamp_[\w-]{20,64})$/)?.[1];
  const raw = given && readSetting(KEY_KEY);
  if (!given || !raw) return false;
  const want = Buffer.from((JSON.parse(raw) as { hash: string }).hash, "hex");
  const got = Buffer.from(sha(given), "hex");
  return want.length === got.length && timingSafeEqual(want, got);
}

// ── Presence and wake-ups (in memory: the site is one process) ──────────

export type LampPresence = { seenAt: number; waiting: number; rssi: number | null; version: string | null };

const g = globalThis as unknown as { __lamp?: { presence: LampPresence | null; bus: EventTarget } };
const lamp = (g.__lamp ??= { presence: null, bus: new EventTarget() });

export function lampSeen(p: Pick<LampPresence, "rssi" | "version">, waitingDelta = 0) {
  lamp.presence = { ...p, seenAt: Date.now(), waiting: Math.max(0, (lamp.presence?.waiting ?? 0) + waitingDelta) };
}

/** Online while a request is open, or if one ended in the last minute. */
export function lampPresence() {
  const p = lamp.presence;
  const ms = p ? Date.now() - p.seenAt : null;
  return { online: !!p && (p.waiting > 0 || ms! < 60_000), agoMin: ms == null ? null : Math.round(ms / 60_000), rssi: p?.rssi ?? null, version: p?.version ?? null };
}
export type LampStatus = ReturnType<typeof lampPresence>;

/** Resolves after `ms`, or sooner if something is queued for the lamp. */
export function waitForLamp(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const done = () => {
      clearTimeout(timer);
      lamp.bus.removeEventListener("queued", done);
      signal.removeEventListener("abort", done);
      resolve();
    };
    const timer = setTimeout(done, ms);
    lamp.bus.addEventListener("queued", done);
    signal.addEventListener("abort", done);
  });
}

// ── Queueing ────────────────────────────────────────────────────────────

export function queueLamp(anims: LampAnim[], reason: string) {
  const insert = getDb().prepare("INSERT INTO lamp_events (anim, reason, created_at) VALUES (?, ?, ?)");
  for (const a of anims) insert.run(a, reason, Date.now());
  // Keep the table small: the lamp only ever needs the last few minutes.
  getDb().prepare("DELETE FROM lamp_events WHERE id <= (SELECT MAX(id) FROM lamp_events) - 500").run();
  lamp.bus.dispatchEvent(new Event("queued"));
}

export type LampPlay = { id: number; anim: string; reason: string; at: number };

export const recentPlays = (n = 12) =>
  (getDb().prepare("SELECT id, anim, reason, created_at AS at FROM lamp_events ORDER BY id DESC LIMIT ?").all(n) as LampPlay[]).map((r) => ({ ...r }));

function inQuietHours(s: LampSettings, now = new Date()) {
  if (!s.quiet.on || s.quiet.from === s.quiet.to) return false;
  const h = Number(new Intl.DateTimeFormat("en-CA", { hour: "numeric", hourCycle: "h23", timeZone: TIME_ZONE }).format(now));
  return s.quiet.from < s.quiet.to ? h >= s.quiet.from && h < s.quiet.to : h >= s.quiet.from || h < s.quiet.to;
}

/** Cards bought so far, for milestones. Group cards count once each; yearly repeats don't count again. */
function cardsBought() {
  const row = getDb()
    .prepare(
      `SELECT (SELECT COUNT(*) FROM cards WHERE parent_id IS NULL AND (payment_id IS NOT NULL OR free_code IS NOT NULL))
            + (SELECT COUNT(*) FROM group_cards WHERE status != 'draft') AS n`,
    )
    .get() as { n: number };
  return row.n;
}

/**
 * Something happened on the site: light the lamp. `count` is how many cards
 * it was (a cart can hold several group cards). Never throws: a lamp
 * problem must not break a checkout or a delivery.
 */
export function lampFor(event: LampEvent, count = 1) {
  try {
    const s = getLampSettings();
    if (inQuietHours(s)) return;
    const anims: LampAnim[] = [];
    if (s.play[event] !== "none") anims.push(s.play[event] as LampAnim);
    if ((event === "card" || event === "group" || event === "free") && s.milestone.every > 0) {
      const n = cardsBought();
      // Crossed a multiple of `every` (a cart of 3 can jump from 24 to 27).
      if (Math.floor(n / s.milestone.every) > Math.floor((n - count) / s.milestone.every)) anims.push(s.milestone.anim);
    }
    if (anims.length) queueLamp(anims, event);
  } catch (err) {
    console.error("[lamp]", err);
  }
}
