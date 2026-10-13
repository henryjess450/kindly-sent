import { NextResponse } from "next/server";
import { LAMP_ANIM_IDS, type LampAnim } from "@/lib/lamp/animations";
import { findBottom, getLampSettings, lampPresence, newLampKey, queueLamp, recentPlays, saveLampSettings, setRing } from "@/lib/lamp/server";
import { getUser, isAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

// The card lamp's admin controls. Site admin only.
const denied = () => NextResponse.json({ error: "Not allowed." }, { status: 403 });

/** Whether the lamp is online and what it played, for the admin page to refresh. */
export async function GET() {
  if (!isAdmin(await getUser())) return denied();
  return NextResponse.json({ status: lampPresence(), plays: recentPlays() });
}

export async function POST(req: Request) {
  if (!isAdmin(await getUser())) return denied();
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  if (body.action === "play") {
    const anim = String(body.anim ?? "") as LampAnim;
    if (!LAMP_ANIM_IDS.includes(anim)) return NextResponse.json({ error: "Pick an animation." }, { status: 400 });
    const dollars = Number(body.dollars);
    queueLamp([anim], "admin", Number.isFinite(dollars) && dollars > 0 ? Math.round(Math.min(dollars, 48) * 100) : null);
    const online = lampPresence().online;
    return NextResponse.json({
      message: online ? "Sent to the lamp." : "Queued. The lamp is offline, so it plays if it's back within 10 minutes.",
      plays: recentPlays(),
    });
  }
  if (body.action === "settings") {
    // The ring's bottom is set by Find the bottom only, so an open page can't undo it.
    const current = getLampSettings();
    const settings = saveLampSettings({ ...current, ...(body.settings as object), ring: current.ring });
    return NextResponse.json({ settings, status: lampPresence(), message: "Saved. The lamp has it now." });
  }
  if (body.action === "find") {
    if (body.on && !lampPresence().online) return NextResponse.json({ error: "The lamp is offline. Plug it in and wait for its red lap first." }, { status: 409 });
    findBottom(!!body.on);
    return NextResponse.json({ ok: true });
  }
  if (body.action === "ring") {
    const bottom = Number(body.bottom);
    if (!Number.isInteger(bottom) || bottom < 0 || bottom > 11) return NextResponse.json({ error: "Pick a light." }, { status: 400 });
    const settings = setRing(bottom, body.reverse === true);
    return NextResponse.json({ settings, plays: recentPlays() });
  }
  if (body.action === "key") return NextResponse.json({ key: newLampKey(), madeAt: Date.now() });
  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
