import { NextResponse } from "next/server";
import { getGiftBrand } from "@/config/gifts";
import { getCardByToken } from "@/lib/cards";
import { getDb, type UserRow } from "@/lib/db";
import { openedEmail } from "@/lib/emails";
import { getGift, giftSecret } from "@/lib/giftcards";
import { sendMail } from "@/lib/mail";
import { getUser } from "@/lib/session";

const noStore = { "cache-control": "no-store, private" };

/**
 * The recipient tapped the seal. Tells the sender once, and hands back the
 * gift card number and PIN. Codes are only ever sent here, in answer to a
 * tap, never in the page HTML or an email, so link previewers can't see them.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const card = getCardByToken((await params).token);
  if (!card || card.status !== "sent") return NextResponse.json({ gift: null }, { headers: noStore });
  const viewer = await getUser();
  if (viewer && viewer.id === card.user_id) return NextResponse.json({ gift: null }, { headers: noStore }); // the sender peeking

  const db = getDb();
  const first = db.prepare("UPDATE cards SET opened_at = ? WHERE id = ? AND opened_at IS NULL").run(Date.now(), card.id);
  if (first.changes === 1 && card.user_id) {
    const sender = db.prepare("SELECT * FROM users WHERE id = ?").get(card.user_id) as UserRow | undefined;
    if (sender?.notify_open) await sendMail({ to: sender.email, ...openedEmail(card) }).catch(() => {});
  }

  const gift = getGift(card.id);
  if (!gift || gift.status !== "issued") return NextResponse.json({ gift: null }, { headers: noStore });
  let secret = null;
  try {
    secret = giftSecret(gift);
  } catch (err) {
    console.error("[gift] can't decrypt", gift.id, err);
  }
  db.prepare("UPDATE gifts SET revealed_at = COALESCE(revealed_at, ?) WHERE id = ?").run(Date.now(), gift.id);
  return NextResponse.json(
    { gift: { brand: gift.brand, brandName: getGiftBrand(gift.brand)?.name, amountCents: gift.amount_cents, ...secret } },
    { headers: noStore },
  );
}
