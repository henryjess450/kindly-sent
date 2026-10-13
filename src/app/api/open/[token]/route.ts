import { NextResponse } from "next/server";
import { getCardByToken } from "@/lib/cards";
import { getDb, type UserRow } from "@/lib/db";
import { openedEmail } from "@/lib/emails";
import { lampFor } from "@/lib/lamp/server";
import { sendMail } from "@/lib/mail";
import { getUser } from "@/lib/session";

// The recipient opened the envelope. Tell the sender once.
export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const card = getCardByToken((await params).token);
  if (!card || card.status !== "sent" || card.opened_at) return NextResponse.json({ ok: true });
  const viewer = await getUser();
  if (viewer && viewer.id === card.user_id) return NextResponse.json({ ok: true }); // the sender peeking
  const db = getDb();
  const res = db.prepare("UPDATE cards SET opened_at = ? WHERE id = ? AND opened_at IS NULL").run(Date.now(), card.id);
  if (res.changes === 1) lampFor("opened");
  if (res.changes === 1 && card.user_id) {
    const sender = db.prepare("SELECT * FROM users WHERE id = ?").get(card.user_id) as UserRow | undefined;
    if (sender?.notify_open) await sendMail({ to: sender.email, ...openedEmail(card) }).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
