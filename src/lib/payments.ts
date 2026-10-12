import { randomUUID } from "node:crypto";
import { pricing } from "@/config/pricing";
import { getDb, type PaymentRow } from "./db";
import { newId } from "./ids";

// Square card payments over plain HTTPS (no SDK). Without Square keys, the
// site uses a fake "demo" payment in development and refuses in production.

export type PayMode = "square" | "demo" | "off";

export function payMode(): PayMode {
  if (process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID && process.env.SQUARE_APPLICATION_ID) return "square";
  return process.env.NODE_ENV === "production" ? "off" : "demo";
}

/** What the browser needs to show the Square card form. */
export function clientPayConfig() {
  const mode = payMode();
  return {
    mode,
    applicationId: mode === "square" ? process.env.SQUARE_APPLICATION_ID! : "",
    locationId: mode === "square" ? process.env.SQUARE_LOCATION_ID! : "",
    sandbox: squareEnv() !== "production",
  };
}
export type ClientPayConfig = ReturnType<typeof clientPayConfig>;

// SQUARE_ENVIRONMENT is Coastline's name for it, so its lines can be copied over as-is.
const squareEnv = () => (process.env.SQUARE_ENV ?? process.env.SQUARE_ENVIRONMENT ?? "sandbox").trim().toLowerCase();
const base = () => (squareEnv() === "production" ? "https://connect.squareup.com" : "https://connect.squareupsandbox.com");

async function square<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${base()}${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      "content-type": "application/json",
      "square-version": "2025-01-23",
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as { errors?: { code: string; detail: string }[] } & T;
  if (!res.ok) {
    const e = json.errors?.[0];
    throw new PaymentError(friendly(e?.code), e?.code ?? String(res.status));
  }
  return json;
}

export class PaymentError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}

function friendly(code?: string) {
  switch (code) {
    case "CARD_DECLINED":
    case "GENERIC_DECLINE":
      return "Your card was declined. Try another card.";
    case "INSUFFICIENT_FUNDS":
      return "The card doesn't have enough funds.";
    case "CVV_FAILURE":
    case "INVALID_CARD_DATA":
      return "Check the card's security code.";
    case "ADDRESS_VERIFICATION_FAILURE":
    case "INVALID_POSTAL_CODE":
      return "Check the postal code.";
    case "INVALID_EXPIRATION":
    case "CARD_EXPIRED":
      return "Check the card's expiry date.";
    default:
      return "The payment didn't go through. Nothing was charged.";
  }
}

export type Charge = { cardCents: number; taxCents: number; totalCents: number };

/** Charges once per idempotency key, records it, and returns the payment. */
export async function charge(opts: { sourceId: string; key: string; email: string; note: string; amounts: Charge }): Promise<PaymentRow> {
  const mode = payMode();
  let providerId: string;
  let receipt: string | null = null;
  if (mode === "off") throw new PaymentError("Payments aren't set up yet.", "NOT_CONFIGURED");
  if (mode === "demo") {
    if (opts.sourceId === "demo-decline") throw new PaymentError("Your card was declined. Try another card.", "CARD_DECLINED");
    providerId = `demo_${randomUUID()}`;
  } else {
    const res = await square<{ payment: { id: string; receipt_url?: string } }>("/v2/payments", {
      source_id: opts.sourceId,
      idempotency_key: opts.key,
      amount_money: { amount: opts.amounts.totalCents, currency: pricing.currency },
      location_id: process.env.SQUARE_LOCATION_ID,
      buyer_email_address: opts.email,
      note: opts.note.slice(0, 500),
      autocomplete: true,
    });
    providerId = res.payment.id;
    receipt = res.payment.receipt_url ?? null;
  }
  const id = newId();
  const a = opts.amounts;
  getDb()
    .prepare(
      `INSERT INTO payments (id, provider, provider_payment_id, email, amount_cents, card_cents, tax_cents, gift_cents, fee_cents, receipt_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(id, mode, providerId, opts.email, a.totalCents, a.cardCents, a.taxCents, 0, 0, receipt, Date.now());
  return getPayment(id)!;
}

export const getPayment = (id: string | null) => (id ? (getDb().prepare("SELECT * FROM payments WHERE id = ?").get(id) as PaymentRow | undefined) : undefined);

/** Refunds part or all of a payment. Safe to call twice with the same reason. */
export async function refund(payment: PaymentRow, cents: number, reason: string) {
  const left = payment.amount_cents - payment.refunded_cents;
  const amount = Math.min(cents, left);
  if (amount <= 0) return 0;
  if (payment.provider === "square") {
    await square("/v2/refunds", {
      idempotency_key: `${payment.id}-${reason}`.slice(0, 45),
      payment_id: payment.provider_payment_id,
      amount_money: { amount, currency: pricing.currency },
      reason,
    });
  }
  getDb().prepare("UPDATE payments SET refunded_cents = refunded_cents + ? WHERE id = ?").run(amount, payment.id);
  return amount;
}
