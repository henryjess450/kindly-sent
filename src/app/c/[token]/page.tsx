import type { Metadata } from "next";
import Link from "next/link";
import { OpenCard } from "@/components/OpenCard";
import { BrandMark } from "@/components/Nav";
import { getCardByToken } from "@/lib/cards";
import { getDesign, DESIGNS, envelopeColor } from "@/lib/designs";
import { getGift } from "@/lib/giftcards";
import { getUser } from "@/lib/session";

export const metadata: Metadata = { title: "You have a card", robots: { index: false, follow: false } };

export default async function CardPage({ params }: { params: Promise<{ token: string }> }) {
  const card = getCardByToken((await params).token);
  const user = await getUser();
  const isOwner = !!card && !!user && card.user_id === user.id;

  if (!card || card.status === "canceled" || (card.status !== "sent" && !isOwner)) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 22, textAlign: "center" }}>
        <div>
          <h1 className="display display-m">This card isn&apos;t here.</h1>
          <p className="lede" style={{ margin: "12px 0 28px" }}>It may not be time yet, or the link was copied wrong.</p>
          <Link href="/" className="btn btn-primary">Go to the home page</Link>
        </div>
      </main>
    );
  }

  const design = getDesign(card.design) ?? DESIGNS[0];
  const g = getGift(card.id);
  // Only the brand and amount go in the page. The number and PIN come from
  // /api/open when the recipient taps the seal.
  const gift = g && (g.status === "issued" || (isOwner && g.status === "held")) ? { brand: g.brand, amountCents: g.amount_cents } : null;
  return (
    <main>
      <div style={{ position: "fixed", top: 16, left: 22, zIndex: 50 }}>
        <BrandMark />
      </div>
      <OpenCard
        design={design}
        token={card.token}
        preview={isOwner}
        envelope={envelopeColor(design, card.envelope)}
        liner={card.liner}
        gift={gift}
        content={{ message: card.message, font: card.font, ink: card.ink, recipientName: card.recipient_name, senderName: card.sender_name }}
      />
    </main>
  );
}
