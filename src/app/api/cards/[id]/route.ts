import { NextResponse } from "next/server";
import { quote } from "@/config/pricing";
import { getCard, ownedCard, parseCard, publicCard, updateCard } from "@/lib/cards";
import { getDb } from "@/lib/db";
import { charge, getPayment, PaymentError, refund } from "@/lib/payments";
import { getUser } from "@/lib/session";
import { tick } from "@/lib/scheduler";

type Ctx = { params: Promise<{ id: string }> };
const notFound = () => NextResponse.json({ error: "Card not found." }, { status: 404 });

export async function GET(_req: Request, { params }: Ctx) {
  const card = ownedCard((await params).id, await getUser());
  return card ? NextResponse.json({ card: publicCard(card) }) : notFound();
}

/** Edit the words, design or time. A yearly card waiting for payment is paid here too. */
export async function PATCH(req: Request, { params }: Ctx) {
  const user = await getUser();
  const card = ownedCard((await params).id, user);
  if (!card) return notFound();
  if (!["pending", "unpaid", "scheduled", "failed"].includes(card.status))
    return NextResponse.json({ error: "This card has already gone out." }, { status: 409 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const parsed = parseCard(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  if (card.status === "unpaid") {
    const sourceId = typeof body.paymentToken === "string" ? body.paymentToken : "";
    if (!sourceId) return NextResponse.json({ error: "Add a payment method." }, { status: 400 });
    const q = quote();
    try {
      const p = await charge({
        sourceId,
        key: `${card.id}-renew`,
        email: user!.email,
        note: `Yearly card to ${parsed.card.recipientName}`,
        amounts: { cardCents: q.card, taxCents: q.cardTax, totalCents: q.total },
      });
      getDb().prepare("UPDATE cards SET status = 'scheduled', payment_id = ?, price_cents = ? WHERE id = ?").run(p.id, q.total, card.id);
    } catch (err) {
      return NextResponse.json({ error: err instanceof PaymentError ? err.message : "The payment didn't go through." }, { status: 402 });
    }
  }
  updateCard(card.id, parsed.card, parsed.sendAt);
  if (parsed.card.sendNow) void tick();
  return NextResponse.json({ status: "scheduled", card: publicCard(getCard(card.id)!) });
}

/** Cancel before it goes out: full refund. */
export async function DELETE(_req: Request, { params }: Ctx) {
  const card = ownedCard((await params).id, await getUser());
  if (!card) return notFound();
  const res = getDb().prepare("UPDATE cards SET status = 'canceled' WHERE id = ? AND status IN ('pending','unpaid','scheduled','failed')").run(card.id);
  if (res.changes !== 1) return NextResponse.json({ error: "This card has already gone out." }, { status: 409 });
  let refunded = 0;
  const payment = getPayment(card.payment_id);
  if (payment) {
    try {
      refunded = await refund(payment, payment.amount_cents, "cancelled");
    } catch (err) {
      console.error("[refund]", err);
      return NextResponse.json({ ok: true, refunded: 0, error: "Cancelled, but the refund needs a hand. We'll sort it out by email." });
    }
  }
  return NextResponse.json({ ok: true, refunded });
}
