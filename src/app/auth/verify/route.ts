import { NextResponse } from "next/server";
import { site } from "@/config/site";
import { getDb } from "@/lib/db";
import { consumeLoginToken, findOrCreateUser, startSession } from "@/lib/session";
import { tick } from "@/lib/scheduler";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const row = consumeLoginToken(token);
  if (!row) return NextResponse.redirect(`${site.url}/signin?expired=1`);
  const user = findOrCreateUser(row.email);
  await startSession(user.id);
  if (row.card_id) {
    // The card they wrote before confirming now belongs to them and joins the queue.
    getDb()
      .prepare("UPDATE cards SET user_id = ?, pending_email = NULL, status = 'scheduled' WHERE id = ? AND status = 'pending' AND pending_email = ?")
      .run(user.id, row.card_id, row.email);
    void tick();
    return NextResponse.redirect(`${site.url}/cards?confirmed=${row.card_id}`);
  }
  return NextResponse.redirect(`${site.url}${row.next_path ?? "/cards"}`);
}
