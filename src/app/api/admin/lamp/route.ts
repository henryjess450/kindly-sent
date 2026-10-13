import { NextResponse } from "next/server";
import { LAMP_ANIM_IDS, type LampAnim } from "@/lib/lamp/animations";
import { getLampSettings, lampPresence, newLampKey, queueLamp, recentPlays, saveLampSettings } from "@/lib/lamp/server";
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
    const settings = saveLampSettings({ ...getLampSettings(), ...(body.settings as object) });
    return NextResponse.json({ settings, status: lampPresence(), message: "Saved. The lamp has it now." });
  }
  if (body.action === "key") return NextResponse.json({ key: newLampKey(), madeAt: Date.now() });
  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
