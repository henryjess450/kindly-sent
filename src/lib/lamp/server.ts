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
  { key: "paid", label: "A payment comes in (plays after the one above)" },
  { key: "signed", label: "Someone signs a group card" },
  { key: "delivered", label: "A card is delivered" },
  { key: "opened", label: "A card is opened" },
  { key: "canceled", label: "A card is cancelled and refunded" },
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
  /** Which LED (in the lamp's wiring order) is the bottom, and whether "round" runs the other way. Set by Find the bottom. */
  ring: { bottom: number; reverse: boolean };
};

export const LAMP_DEFAULTS: LampSettings = {
  brightness: 40,
  idle: "off",
  play: {
    card: "sealed",
    group: "confetti",
    free: "sealed",
    renew: "bloom",
    paid: "payment",
    signed: "ink",
    delivered: "airmail",
    opened: "heartbeat",
    canceled: "returned",
  },
  milestone: { every: 25, anim: "fireworks" },
  quiet: { on: false, from: 22, to: 8 },
  ring: { bottom: 0, reverse: false },
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
  const r = (o.ring ?? {}) as Record<string, unknown>;
  return {
    brightness: int(o.brightness, 5, 100, d.brightness),
    idle: o.idle === "glow" ? "glow" : "off",
    play: Object.fromEntries(
      LAMP_EVENTS.map(({ key }) => [key, play[key] === "none" || isAnim(play[key]) ? play[key] : d.play[key]]),
    ) as LampSettings["play"],
    milestone: { every: int(ms.every, 0, 10_000, d.milestone.every), anim: isAnim(ms.anim) ? ms.anim : d.milestone.anim },
    quiet: { on: q.on === true, from: int(q.from, 0, 23, d.quiet.from), to: int(q.to, 0, 23, d.quiet.to) },
    ring: { bottom: int(r.bottom, 0, 11, d.ring.bottom), reverse: r.reverse === true },
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

/** Saves, then wakes the lamp so it picks up the new brightness and idle look straight away. */
export function saveLampSettings(input: unknown) {
  const s = parseLampSettings(input);
  writeSetting(SETTINGS_KEY, JSON.stringify(s));
  wakeLamp("settings");
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

const g = globalThis as unknown as { __lamp?: { presence: LampPresence | null; bus: EventTarget; findUntil?: number } };
const lamp = (g.__lamp ??= { presence: null, bus: new EventTarget() });

// ── Find the bottom: the lamp lights every LED a different colour ───────

const FIND_MS = 3 * 60_000;

/** True while the lamp should show its colour chart (it stops by itself after 3 minutes). */
export const findingBottom = () => (lamp.findUntil ?? 0) > Date.now();

export function findBottom(on: boolean) {
  lamp.findUntil = on ? Date.now() + FIND_MS : 0;
  wakeLamp("settings");
}

/** Saves which LED is the bottom and which way is round, ends Find the bottom, and plays Fresh ink to show it. */
export function setRing(bottom: number, reverse: boolean) {
  const s = parseLampSettings({ ...getLampSettings(), ring: { bottom, reverse } });
  writeSetting(SETTINGS_KEY, JSON.stringify(s));
  lamp.findUntil = 0;
  queueLamp(["ink"], "ring");
  return s;
}

export function lampSeen(p: Pick<LampPresence, "rssi" | "version">, waitingDelta = 0) {
  lamp.presence = { ...p, seenAt: Date.now(), waiting: Math.max(0, (lamp.presence?.waiting ?? 0) + waitingDelta) };
}

/** Online while a request is open, or if one ended in the last minute. */
export function lampPresence() {
  const p = lamp.presence;
  const ms = p ? Date.now() - p.seenAt : null;
  return {
    online: !!p && (p.waiting > 0 || ms! < 60_000),
    agoMin: ms == null ? null : Math.round(ms / 60_000),
    rssi: p?.rssi ?? null,
    version: p?.version ?? null,
    quietNow: inQuietHours(getLampSettings()),
  };
}
export type LampStatus = ReturnType<typeof lampPresence>;

type Wake = "queued" | "settings";

/** Wakes the lamp's open request: something to play, or new settings to answer with. */
const wakeLamp = (why: Wake) => lamp.bus.dispatchEvent(new Event(why));

/** Resolves after `ms` with null, or sooner with why the lamp was woken. */
export function waitForLamp(ms: number, signal: AbortSignal) {
  return new Promise<Wake | null>((resolve) => {
    const done = (e?: Event) => {
      clearTimeout(timer);
      lamp.bus.removeEventListener("queued", done);
      lamp.bus.removeEventListener("settings", done);
      signal.removeEventListener("abort", done);
      resolve(e?.type === "queued" || e?.type === "settings" ? e.type : null);
    };
    const timer = setTimeout(done, ms);
    lamp.bus.addEventListener("queued", done);
    lamp.bus.addEventListener("settings", done);
    signal.addEventListener("abort", done);
  });
}

// ── Queueing ────────────────────────────────────────────────────────────

/** `cents` is the sale it's for, which the Payment animation counts out. */
export function queueLamp(anims: LampAnim[], reason: string, cents: number | null = null) {
  const insert = getDb().prepare("INSERT INTO lamp_events (anim, reason, cents, created_at) VALUES (?, ?, ?, ?)");
  for (const a of anims) insert.run(a, reason, cents, Date.now());
  // Keep the table small: the lamp only ever needs the last few minutes.
  getDb().prepare("DELETE FROM lamp_events WHERE id <= (SELECT MAX(id) FROM lamp_events) - 500").run();
  wakeLamp("queued");
}

export type LampPlay = { id: number; anim: string; reason: string; cents: number | null; at: number };

export const recentPlays = (n = 12) =>
  (getDb().prepare("SELECT id, anim, reason, cents, created_at AS at FROM lamp_events ORDER BY id DESC LIMIT ?").all(n) as LampPlay[]).map((r) => ({ ...r }));

/** True during quiet hours, Victoria time. "From 10 p.m. to 8 a.m." runs over midnight. */
export function inQuietHours(s: LampSettings, now = new Date()) {
  if (!s.quiet.on || s.quiet.from === s.quiet.to) return false;
  const h = Number(new Intl.DateTimeFormat("en-CA", { hour: "numeric", hourCycle: "h23", timeZone: TIME_ZONE }).format(now));
  return s.quiet.from < s.quiet.to ? h >= s.quiet.from && h < s.quiet.to : h >= s.quiet.from || h < s.quiet.to;
}

/** The idle look the lamp should show right now: dark during quiet hours. */
export const idleNow = (s: LampSettings, now = new Date()) => (inQuietHours(s, now) ? "off" : s.idle);

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
 * it was (a cart can hold several group cards); `cents` is the money taken
 * (before tax) or refunded. A sale also plays the "paid" animation after
 * its own, and a milestone after that. Never throws: a lamp problem must
 * not break a checkout or a delivery.
 */
export function lampFor(event: LampEvent, { count = 1, cents = null }: { count?: number; cents?: number | null } = {}) {
  try {
    const s = getLampSettings();
    if (inQuietHours(s)) return;
    const anims: LampAnim[] = [];
    const add = (c: LampChoice) => c !== "none" && anims.push(c);
    add(s.play[event]);
    if ((event === "card" || event === "group" || event === "renew") && cents) add(s.play.paid);
    if ((event === "card" || event === "group" || event === "free") && s.milestone.every > 0) {
      const n = cardsBought();
      // Crossed a multiple of `every` (a cart of 3 can jump from 24 to 27).
      if (Math.floor(n / s.milestone.every) > Math.floor((n - count) / s.milestone.every)) anims.push(s.milestone.anim);
    }
    if (anims.length) queueLamp(anims, event, cents);
  } catch (err) {
    console.error("[lamp]", err);
  }
}
