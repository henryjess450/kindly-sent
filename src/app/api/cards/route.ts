import { NextResponse } from "next/server";
import { quote } from "@/config/pricing";
import { site } from "@/config/site";
import { cardsCreatedToday, getCard, insertCard, parseCard, publicCard } from "@/lib/cards";
import { getDb } from "@/lib/db";
import { freeCardEmail, receiptEmail } from "@/lib/emails";
import { claimCode, usableCode } from "@/lib/freecodes";
import { sendMail } from "@/lib/mail";
import { charge, PaymentError } from "@/lib/payments";
import { createLoginLink, getUser, normalizeEmail } from "@/lib/session";
import { tick } from "@/lib/scheduler";

// Write, pay, schedule. Nothing is saved as "scheduled" until the payment succeeds.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const parsed = parseCard(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const user = await getUser();
  const email = user?.email ?? normalizeEmail(body.email);
  if (!email) return NextResponse.json({ error: "Add your email for the receipt." }, { status: 400 });
  if (cardsCreatedToday(user?.id ?? null, email) >= site.limits.cardsPerDay)
    return NextResponse.json({ error: "That's a lot of cards for one day. Try again tomorrow." }, { status: 429 });

  // A free link from the site admin: no payment, straight into the queue.
  if (body.freeCode !== undefined) {
    const code = usableCode(body.freeCode, "card");
    if (!code || !claimCode(code.code, "card")) return NextResponse.json({ error: "This free link has been used up." }, { status: 410 });
    const card = insertCard(parsed.card, parsed.sendAt, { userId: user?.id ?? null, email }, { status: "scheduled", priceCents: 0 });
    getDb().prepare("UPDATE cards SET free_code = ? WHERE id = ?").run(code.code, card.id);
    const manage = user ? `${site.url}/cards` : (createLoginLink(email, { next: "/cards" }) ?? `${site.url}/signin`);
    await sendMail({ to: email, ...freeCardEmail(card, manage) }).catch((e) => console.error("[free]", e));
    if (parsed.card.sendNow) void tick();
    return NextResponse.json({ status: "scheduled", card: publicCard(getCard(card.id)!) });
  }

  const sourceId = typeof body.paymentToken === "string" ? body.paymentToken : "";
  if (!sourceId) return NextResponse.json({ error: "Add a payment method." }, { status: 400 });

  const q = quote();
  const card = insertCard(parsed.card, parsed.sendAt, { userId: user?.id ?? null, email }, { status: "unpaid", priceCents: q.card + q.cardTax });

  let payment;
  try {
    payment = await charge({
      sourceId,
      key: card.id,
      email,
      note: `Card to ${parsed.card.recipientName}`,
      amounts: { cardCents: q.card, taxCents: q.cardTax, totalCents: q.total },
    });
  } catch (err) {
    getDb().prepare("DELETE FROM cards WHERE id = ?").run(card.id);
    const msg = err instanceof PaymentError ? err.message : "The payment didn't go through. Nothing was charged.";
    if (!(err instanceof PaymentError)) console.error("[pay]", err);
    return NextResponse.json({ error: msg }, { status: 402 });
  }

  getDb().prepare("UPDATE cards SET status = 'scheduled', payment_id = ? WHERE id = ?").run(payment.id, card.id);
  const saved = getCard(card.id)!;
  // Signed in: link straight to the list. Not signed in: the link signs them in too.
  const manage = user ? `${site.url}/cards` : (createLoginLink(email, { next: "/cards" }) ?? `${site.url}/signin`);
  await sendMail({ to: email, ...receiptEmail(saved, payment, manage) }).catch((e) => console.error("[receipt]", e));
  if (parsed.card.sendNow) void tick();
  return NextResponse.json({ status: "scheduled", card: publicCard(saved) });
}
