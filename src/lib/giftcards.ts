import { randomInt } from "node:crypto";
import { getGiftBrand, GIFT_BRANDS, type GiftBrand } from "@/config/gifts";
import { pricing } from "@/config/pricing";
import { getDb, type CardRow, type GiftRow } from "./db";
import { open, seal } from "./secretbox";

// Gift cards are bought at the moment the card is delivered, so a cancelled
// card never wastes one. The card number and PIN are encrypted, stored, and
// shown inside the card only when the recipient opens it. Never in an email.

export type Credential = { label: string; value: string; kind: "number" | "pin" | "code" | "url" | "other" };
export type GiftSecret = { credentials: Credential[]; instructions?: string };

type Provider = "tango" | "tremendous" | "demo";

function provider(): Provider {
  const chosen = (process.env.GIFT_PROVIDER ?? "tango").toLowerCase();
  if (chosen === "tremendous" && process.env.TREMENDOUS_API_KEY) return "tremendous";
  if (chosen === "tango" && process.env.TANGO_PLATFORM_NAME && process.env.TANGO_PLATFORM_KEY) return "tango";
  return "demo";
}

const brandId = (b: GiftBrand, p: Provider) => (p === "tango" ? b.tangoUtid : p === "tremendous" ? b.tremendousProductId : "demo");

/** Brands that can actually be bought right now. */
export function availableBrands() {
  const p = provider();
  if (p === "demo") return process.env.NODE_ENV === "production" ? [] : GIFT_BRANDS;
  return GIFT_BRANDS.filter((b) => brandId(b, p));
}

export const getGift = (cardId: string) => getDb().prepare("SELECT * FROM gifts WHERE card_id = ?").get(cardId) as GiftRow | undefined;

/** Decrypts the codes for the recipient's page. */
export function giftSecret(gift: GiftRow): GiftSecret | null {
  if (!gift.secret) return gift.redeem_url ? { credentials: [{ label: "Redeem online", value: gift.redeem_url, kind: "url" }] } : null;
  return open<GiftSecret>(gift.secret);
}

function kindOf(label: string, type?: string): Credential["kind"] {
  const t = `${type ?? ""} ${label}`.toLowerCase();
  if (t.includes("url") || t.includes("link")) return "url";
  if (t.includes("pin")) return "pin";
  if (t.includes("number") || t.includes("card")) return "number";
  if (t.includes("code")) return "code";
  return "other";
}

const stripHtml = (s: string) =>
  s.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\n{3,}/g, "\n\n").trim();

// ---------------------------------------------------------------- Tango Card

async function buyFromTango(gift: GiftRow, card: CardRow, utid: string): Promise<{ orderId: string; secret: GiftSecret }> {
  const base = process.env.TANGO_ENV === "production" ? "https://api.tangocard.com/raas/v2" : "https://integration-api.tangocard.com/raas/v2";
  const auth = Buffer.from(`${process.env.TANGO_PLATFORM_NAME}:${process.env.TANGO_PLATFORM_KEY}`).toString("base64");
  const res = await fetch(`${base}/orders`, {
    method: "POST",
    headers: { authorization: `Basic ${auth}`, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      accountIdentifier: process.env.TANGO_ACCOUNT_ID,
      customerIdentifier: process.env.TANGO_CUSTOMER_ID,
      utid,
      amount: gift.amount_cents / 100,
      sendEmail: false, // we show the codes inside the card ourselves
      externalRefID: gift.id, // Tango refuses a second order with the same ID
      recipient: { email: card.recipient_email, firstName: card.recipient_name.slice(0, 100) },
    }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    referenceOrderID?: string;
    reward?: {
      credentials?: Record<string, string>;
      credentialList?: { label?: string; value?: string; type?: string; credentialType?: string }[];
      redemptionInstructions?: string;
    };
    message?: string;
    errors?: { message?: string }[];
  };
  if (!res.ok || !json.referenceOrderID) throw new Error(`Tango ${res.status}: ${json.errors?.[0]?.message ?? json.message ?? "order failed"}`);
  const list = json.reward?.credentialList?.length
    ? json.reward.credentialList.map((c) => ({ label: c.label ?? "Code", value: String(c.value ?? ""), kind: kindOf(c.label ?? "", c.credentialType ?? c.type) }))
    : Object.entries(json.reward?.credentials ?? {}).map(([label, value]) => ({ label, value: String(value), kind: kindOf(label) }));
  const credentials = list.filter((c) => c.value);
  if (!credentials.length) throw new Error("Tango returned no card number or PIN");
  return {
    orderId: json.referenceOrderID,
    secret: { credentials, instructions: json.reward?.redemptionInstructions ? stripHtml(json.reward.redemptionInstructions).slice(0, 2000) : undefined },
  };
}

// ---------------------------------------------------------------- Tremendous (link only)

async function buyFromTremendous(gift: GiftRow, card: CardRow, products: string): Promise<{ orderId: string; secret: GiftSecret }> {
  const base = process.env.TREMENDOUS_ENV === "production" ? "https://api.tremendous.com/api/v2" : "https://testflight.tremendous.com/api/v2";
  const headers = { authorization: `Bearer ${process.env.TREMENDOUS_API_KEY}`, "content-type": "application/json" };
  const res = await fetch(`${base}/orders`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      external_id: gift.id,
      payment: { funding_source_id: process.env.TREMENDOUS_FUNDING_SOURCE ?? "BALANCE" },
      reward: {
        products: products.split(",").map((s) => s.trim()),
        value: { denomination: gift.amount_cents / 100, currency_code: pricing.currency },
        recipient: { name: card.recipient_name, email: card.recipient_email },
        delivery: { method: "LINK" },
      },
    }),
  });
  const json = (await res.json().catch(() => ({}))) as { order?: { id: string; rewards?: { id: string; delivery?: { link?: string } }[] }; errors?: { message?: string } };
  if (!res.ok || !json.order) throw new Error(`Tremendous ${res.status}: ${json.errors?.message ?? "order failed"}`);
  let link = json.order.rewards?.[0]?.delivery?.link;
  const rewardId = json.order.rewards?.[0]?.id;
  if (!link && rewardId) {
    const r = await fetch(`${base}/rewards/${rewardId}/generate_link`, { method: "POST", headers });
    link = ((await r.json().catch(() => ({}))) as { reward?: { link?: string } }).reward?.link;
  }
  if (!link) throw new Error("Tremendous returned no redeem link");
  return { orderId: json.order.id, secret: { credentials: [{ label: "Redeem online", value: link, kind: "url" }] } };
}

// ---------------------------------------------------------------- demo (development only)

function demoCodes(): GiftSecret {
  const digits = (n: number) => Array.from({ length: n }, () => randomInt(10)).join("");
  return {
    credentials: [
      { label: "Card number", value: `6006 ${digits(4)} ${digits(4)} ${digits(4)}`, kind: "number" },
      { label: "PIN", value: digits(4), kind: "pin" },
    ],
    instructions: "Demo gift card for development. In production these are real codes from Tango Card.",
  };
}

export async function issueGift(gift: GiftRow, card: CardRow): Promise<void> {
  const brand = getGiftBrand(gift.brand);
  if (!brand) throw new Error(`Unknown gift brand ${gift.brand}`);
  const p = provider();
  let result: { orderId: string | null; secret: GiftSecret };
  if (p === "tango" && brand.tangoUtid) result = await buyFromTango(gift, card, brand.tangoUtid);
  else if (p === "tremendous" && brand.tremendousProductId) result = await buyFromTremendous(gift, card, brand.tremendousProductId);
  else if (process.env.NODE_ENV !== "production") result = { orderId: null, secret: demoCodes() };
  else throw new Error(`Gift brand ${brand.id} isn't set up with ${p}`);
  getDb()
    .prepare("UPDATE gifts SET status = 'issued', provider = ?, provider_order_id = ?, secret = ?, redeem_url = NULL, issued_at = ?, error = NULL WHERE id = ?")
    .run(p, result.orderId, seal(result.secret), Date.now(), gift.id);
}
