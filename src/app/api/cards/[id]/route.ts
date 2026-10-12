import { NextResponse } from "next/server";
import { getCard, ownedCard, parseCard, publicCard, updateCard } from "@/lib/cards";
import { getDb } from "@/lib/db";
import { getUser } from "@/lib/session";
import { tick } from "@/lib/scheduler";

type Ctx = { params: Promise<{ id: string }> };
const notFound = () => NextResponse.json({ error: "Card not found." }, { status: 404 });

export async function GET(_req: Request, { params }: Ctx) {
  const card = ownedCard((await params).id, await getUser());
  return card ? NextResponse.json({ card: publicCard(card) }) : notFound();
}

export async function PATCH(req: Request, { params }: Ctx) {
  const card = ownedCard((await params).id, await getUser());
  if (!card) return notFound();
  if (!["pending", "scheduled", "failed"].includes(card.status))
    return NextResponse.json({ error: "This card has already gone out." }, { status: 409 });
  const parsed = parseCard((await req.json().catch(() => ({}))) as Record<string, unknown>);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  updateCard(card.id, parsed.card, parsed.sendAt);
  if (parsed.card.sendNow) void tick();
  return NextResponse.json({ status: "scheduled", card: publicCard(getCard(card.id)!) });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const card = ownedCard((await params).id, await getUser());
  if (!card) return notFound();
  getDb().prepare("UPDATE cards SET status = 'canceled' WHERE id = ? AND status IN ('pending','scheduled','failed')").run(card.id);
  return NextResponse.json({ ok: true });
}
