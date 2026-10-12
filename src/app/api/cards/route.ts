import { NextResponse } from "next/server";
import { site } from "@/config/site";
import { cardsCreatedToday, insertCard, parseCard, publicCard } from "@/lib/cards";
import { loginEmail } from "@/lib/emails";
import { sendMail } from "@/lib/mail";
import { createLoginLink, getUser, normalizeEmail } from "@/lib/session";
import { tick } from "@/lib/scheduler";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const parsed = parseCard(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const user = await getUser();

  if (user) {
    if (cardsCreatedToday(user.id, user.email) >= site.limits.cardsPerDay)
      return NextResponse.json({ error: "That's a lot of cards for one day. Try again tomorrow." }, { status: 429 });
    const card = insertCard(parsed.card, parsed.sendAt, { userId: user.id });
    if (parsed.card.sendNow) void tick();
    return NextResponse.json({ status: "scheduled", card: publicCard(card) });
  }

  // Not signed in: hold the card until they confirm their email.
  const email = normalizeEmail(body.email);
  if (!email) return NextResponse.json({ error: "Add your email so we can confirm it's you." }, { status: 400 });
  if (cardsCreatedToday(null, email) >= site.limits.cardsPerDay)
    return NextResponse.json({ error: "That's a lot of cards for one day. Try again tomorrow." }, { status: 429 });
  const card = insertCard(parsed.card, parsed.sendAt, { pendingEmail: email });
  const link = createLoginLink(email, { cardId: card.id });
  if (!link) return NextResponse.json({ error: "We've sent a few links already. Check your inbox, or try again in an hour." }, { status: 429 });
  await sendMail({ to: email, ...loginEmail(link, card) });
  return NextResponse.json({ status: "pending", card: publicCard(card) });
}
