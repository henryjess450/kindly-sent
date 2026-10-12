import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createCode, listCodes } from "@/lib/freecodes";
import { getUser, isAdmin } from "@/lib/session";

// Free links: create them, and switch them off. Site admin only.
async function admin() {
  const user = await getUser();
  return isAdmin(user) ? user : null;
}

export async function POST(req: Request) {
  const user = await admin();
  if (!user) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const kind = body.kind === "group" ? "group" : "card";
  const uses = Number(body.maxUses);
  if (!Number.isFinite(uses) || uses < 1 || uses > 1000) return NextResponse.json({ error: "Uses should be between 1 and 1000." }, { status: 400 });
  createCode(kind, uses, typeof body.label === "string" ? body.label.trim() : "", user.email);
  return NextResponse.json({ codes: listCodes() });
}

export async function PATCH(req: Request) {
  if (!(await admin())) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  getDb().prepare("UPDATE free_codes SET disabled = ? WHERE code = ?").run(body.disabled ? 1 : 0, String(body.code ?? ""));
  return NextResponse.json({ codes: listCodes() });
}

/** Delete a link for good. Cards already sent with it keep their "free" mark. */
export async function DELETE(req: Request) {
  if (!(await admin())) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  getDb().prepare("DELETE FROM free_codes WHERE code = ?").run(String(body.code ?? ""));
  return NextResponse.json({ codes: listCodes() });
}
