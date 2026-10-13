import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { groupOpenedEmail } from "@/lib/emails";
import { canManage, getGroupByView, groupAdmins } from "@/lib/groups";
import { lampFor } from "@/lib/lamp/server";
import { sendMail } from "@/lib/mail";
import { getUser } from "@/lib/session";

// The recipient opened their group card. Tell the admins once.
export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const g = getGroupByView((await params).token);
  if (!g || g.status !== "sent" || g.opened_at) return NextResponse.json({ ok: true });
  if (canManage(g, await getUser(), null)) return NextResponse.json({ ok: true }); // an admin peeking
  const res = getDb().prepare("UPDATE group_cards SET opened_at = ? WHERE id = ? AND opened_at IS NULL").run(Date.now(), g.id);
  if (res.changes === 1) lampFor("opened");
  if (res.changes === 1) for (const a of groupAdmins(g.id)) await sendMail({ to: a.email, ...groupOpenedEmail(g) }).catch(() => {});
  return NextResponse.json({ ok: true });
}
