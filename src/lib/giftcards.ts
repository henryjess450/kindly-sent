import { getGiftBrand, GIFT_BRANDS } from "@/config/gifts";
import { pricing } from "@/config/pricing";
import { site } from "@/config/site";
import { getDb, type CardRow, type GiftRow } from "./db";

// Gift cards are bought from Tremendous at the moment the card is delivered,
// so a cancelled card never wastes one. The recipient gets a redeem link.

const live = () => !!process.env.TREMENDOUS_API_KEY;
const base = () => (process.env.TREMENDOUS_ENV === "production" ? "https://api.tremendous.com/api/v2" : "https://testflight.tremendous.com/api/v2");

/** Brands that can actually be issued right now. */
export function availableBrands() {
  if (process.env.NODE_ENV !== "production" && !live()) return GIFT_BRANDS; // demo links
  return live() ? GIFT_BRANDS.filter((b) => b.productId) : [];
}

export const getGift = (cardId: string) => getDb().prepare("SELECT * FROM gifts WHERE card_id = ?").get(cardId) as GiftRow | undefined;

export async function issueGift(gift: GiftRow, card: CardRow): Promise<string> {
  const brand = getGiftBrand(gift.brand);
  if (!brand) throw new Error(`Unknown gift brand ${gift.brand}`);
  let url: string;
  let orderId: string | null = null;
  if (live() && brand.productId) {
    const res = await fetch(`${base()}/orders`, {
      method: "POST",
      headers: { authorization: `Bearer ${process.env.TREMENDOUS_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({
        external_id: gift.id, // Tremendous won't double-issue the same gift
        payment: { funding_source_id: process.env.TREMENDOUS_FUNDING_SOURCE ?? "BALANCE" },
        reward: {
          products: brand.productId.split(",").map((s) => s.trim()),
          value: { denomination: gift.amount_cents / 100, currency_code: pricing.currency },
          recipient: { name: card.recipient_name, email: card.recipient_email },
          delivery: { method: "LINK" },
        },
      }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      order?: { id: string; rewards?: { id: string; delivery?: { link?: string } }[] };
      errors?: { message?: string };
    };
    if (!res.ok || !json.order) throw new Error(`Tremendous ${res.status}: ${json.errors?.message ?? "order failed"}`);
    orderId = json.order.id;
    let link = json.order.rewards?.[0]?.delivery?.link;
    const rewardId = json.order.rewards?.[0]?.id;
    if (!link && rewardId) {
      const r = await fetch(`${base()}/rewards/${rewardId}/generate_link`, { method: "POST", headers: { authorization: `Bearer ${process.env.TREMENDOUS_API_KEY}` } });
      link = ((await r.json().catch(() => ({}))) as { reward?: { link?: string } }).reward?.link;
    }
    if (!link) throw new Error("Tremendous returned no redeem link");
    url = link;
  } else if (process.env.NODE_ENV !== "production") {
    url = `${site.url}/dev/gift/${gift.id}`;
  } else {
    throw new Error(`Gift brand ${brand.id} has no Tremendous product`);
  }
  getDb()
    .prepare("UPDATE gifts SET status = 'issued', provider = ?, provider_order_id = ?, redeem_url = ?, issued_at = ?, error = NULL WHERE id = ?")
    .run(live() ? "tremendous" : "demo", orderId, url, Date.now(), gift.id);
  return url;
}
