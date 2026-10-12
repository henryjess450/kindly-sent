import { NextResponse } from "next/server";
import { groupQuote } from "@/config/pricing";
import { site } from "@/config/site";
import { getCartId } from "@/lib/cart";
import { getDb } from "@/lib/db";
import { groupReceiptEmail } from "@/lib/emails";
import { addAdmin, cartGroups, getGroup, publicGroup } from "@/lib/groups";
import { hashToken } from "@/lib/ids";
import { sendMail } from "@/lib/mail";
import { charge, PaymentError } from "@/lib/payments";
import { createLoginLink, getUser, normalizeEmail } from "@/lib/session";

// Pay for every group card in the cart at once; each one opens for signing.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const cartId = await getCartId();
  const groups = cartGroups(cartId);
  if (groups.length === 0) return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  // Drafts can sit in the cart for days; a delivery time that has passed needs a new one first.
  const stale = groups.find((g) => g.deliver_at < Date.now());
  if (stale) return NextResponse.json({ error: `The delivery time for ${stale.recipient_name}'s card has passed. Edit it first.` }, { status: 400 });
  const user = await getUser();
  const email = user?.email ?? normalizeEmail(body.email);
  if (!email) return NextResponse.json({ error: "Add your email for the receipt." }, { status: 400 });
  const sourceId = typeof body.paymentToken === "string" ? body.paymentToken : "";
  if (!sourceId) return NextResponse.json({ error: "Add a payment method." }, { status: 400 });

  const q = groupQuote(groups.length);
  // The same cart contents never charge twice.
  const key = hashToken(`${cartId}:${groups.map((g) => g.id).join(",")}`).slice(0, 40);
  let payment;
  try {
    payment = await charge({
      sourceId,
      key,
      email,
      note: groups.length === 1 ? `Group card for ${groups[0].recipient_name}` : `${groups.length} group cards`,
      amounts: { cardCents: q.subtotal, taxCents: q.tax, totalCents: q.total },
    });
  } catch (err) {
    const msg = err instanceof PaymentError ? err.message : "The payment didn't go through. Nothing was charged.";
    if (!(err instanceof PaymentError)) console.error("[pay]", err);
    return NextResponse.json({ error: msg }, { status: 402 });
  }

  const db = getDb();
  const each = q.each + Math.round(q.tax / q.count);
  for (const g of groups) {
    db.prepare("UPDATE group_cards SET status = 'collecting', payment_id = ?, price_cents = ?, owner_email = ?, cart_id = NULL WHERE id = ? AND status = 'draft'").run(payment.id, each, email, g.id);
    addAdmin(g.id, email, "owner");
  }
  const paid = groups.map((g) => getGroup(g.id)!);
  const next = paid.length === 1 ? `/groups/${paid[0].id}` : "/cards";
  const manage = user ? `${site.url}${next}` : (createLoginLink(email, { next }) ?? `${site.url}/signin`);
  await sendMail({ to: email, ...groupReceiptEmail(paid, payment, manage) }).catch((e) => console.error("[receipt]", e));
  return NextResponse.json({
    signedIn: !!user,
    email,
    groups: paid.map((g) => ({ ...publicGroup(g), inviteUrl: `${site.url}/g/${g.invite_token}` })),
  });
}
