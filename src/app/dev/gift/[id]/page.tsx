import { notFound } from "next/navigation";
import { GiftTile } from "@/components/GiftTile";
import { getGiftBrand } from "@/config/gifts";
import { getDb, type GiftRow } from "@/lib/db";

// Development only: stands in for the real Tremendous redeem page.
export default async function DemoGift({ params }: { params: Promise<{ id: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const gift = getDb().prepare("SELECT * FROM gifts WHERE id = ?").get((await params).id) as GiftRow | undefined;
  const brand = gift && getGiftBrand(gift.brand);
  if (!gift || !brand) notFound();
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: 22 }}>
      <div style={{ display: "grid", gap: 20, justifyItems: "center" }}>
        <GiftTile brand={brand} amountCents={gift.amount_cents} width={300} />
        <h1 className="display display-m">Demo redeem page</h1>
        <p className="muted" style={{ maxWidth: 420 }}>In production this link goes to Tremendous, where the recipient claims their {brand.name} card.</p>
      </div>
    </main>
  );
}
