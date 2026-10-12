import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUser } from "@/lib/session";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { notifyOpen?: boolean; name?: string };
  if (typeof body.notifyOpen === "boolean") getDb().prepare("UPDATE users SET notify_open = ? WHERE id = ?").run(body.notifyOpen ? 1 : 0, user.id);
  if (typeof body.name === "string") getDb().prepare("UPDATE users SET name = ? WHERE id = ?").run(body.name.trim().slice(0, 60) || null, user.id);
  return NextResponse.json({ ok: true });
}
