import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getLampSettings, lampKeyOk, lampSeen, waitForLamp } from "@/lib/lamp/server";
import { clientIp, limited } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

/** How long a request waits for something to play before answering empty. */
const HOLD_MS = 25_000;
/** A lamp that was offline longer than this doesn't catch up on what it missed. */
const STALE_MS = 10 * 60_000;

/**
 * The card lamp asks here what to play (firmware/lamp/main.py). The request
 * stays open until an animation is queued or HOLD_MS passes, so the lamp
 * lights up within a second of a card without hammering the site.
 *
 * ?after=<id> is the last event the lamp has seen; without it (just switched
 * on) we only say where the queue is, so it doesn't replay old cards. Every
 * answer carries the admin page's brightness and idle look.
 */
export async function GET(req: Request) {
  if (limited(`lamp:${clientIp(req)}`, 30, 60_000)) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  if (!lampKeyOk(req.headers.get("authorization"))) return NextResponse.json({ error: "Unknown lamp key." }, { status: 401 });

  const db = getDb();
  const url = new URL(req.url);
  const rssi = Number(url.searchParams.get("rssi"));
  const who = { rssi: Number.isFinite(rssi) && rssi < 0 ? rssi : null, version: url.searchParams.get("v")?.slice(0, 20) ?? null };
  const newest = () => (db.prepare("SELECT MAX(id) AS n FROM lamp_events").get() as { n: number | null }).n ?? 0;
  const afterRaw = url.searchParams.get("after");
  const after = afterRaw && /^\d{1,12}$/.test(afterRaw) ? Math.min(Number(afterRaw), newest()) : null;

  let events: { id: number; anim: string; n?: number }[] = [];
  if (after !== null) {
    lampSeen(who, 1);
    try {
      const until = Date.now() + HOLD_MS;
      const find = db.prepare("SELECT id, anim, cents FROM lamp_events WHERE id > ? AND created_at >= ? ORDER BY id LIMIT 6");
      while (!req.signal.aborted) {
        // The lamp gets the sale in dollars (n), for the Payment animation.
        events = (find.all(after, Date.now() - STALE_MS) as { id: number; anim: string; cents: number | null }[]).map(({ id, anim, cents }) =>
          cents == null ? { id, anim } : { id, anim, n: cents / 100 },
        );
        if (events.length || Date.now() >= until) break;
        // Woken straight away by queueLamp; the timeout is just a safety net.
        await waitForLamp(Math.min(5_000, until - Date.now()), req.signal);
      }
    } finally {
      lampSeen(who, -1);
    }
  } else {
    lampSeen(who);
  }

  const s = getLampSettings();
  const last = events.at(-1)?.id ?? Math.max(after ?? 0, newest());
  return NextResponse.json({ events, last, brightness: s.brightness, idle: s.idle }, { headers: { "Cache-Control": "no-store" } });
}
