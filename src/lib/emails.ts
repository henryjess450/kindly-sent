import { site } from "@/config/site";
import { getGiftBrand } from "@/config/gifts";
import { money } from "@/config/pricing";
import type { CardRow, GiftRow, PaymentRow } from "./db";
import { getDesign, DESIGNS, envelopeColor } from "./designs";
import { formatWhen } from "./time";

// Plain HTML emails with inline styles, so Gmail, Outlook and Apple Mail agree.

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** "Love, Henry" -> "Henry" for subject lines and sentences. */
export const plainName = (signOff: string) =>
  signOff.trim().replace(/^(with love|love|lots of love|from|xo+|xoxo|cheers|best|yours|hugs|warmly)[,!.\s]+/i, "").trim() || signOff.trim();

const FONT = `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Helvetica, Arial, sans-serif`;

function shell(inner: string, preheader: string) {
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:#F5F5F7;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F7;"><tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;font-family:${FONT};color:#1D1D1F;">
${inner}
<tr><td style="padding:28px 8px 0;font-size:12px;line-height:18px;color:#86868B;text-align:center;">
${esc(site.name)} &middot; ${esc(site.location)}<br>You got this email because someone used ${esc(site.name)} to reach you.
</td></tr></table></td></tr></table></body></html>`;
}

function button(href: string, label: string, color = "#1D1D1F") {
  return `<a href="${href}" style="display:inline-block;background:${color};color:#fff;text-decoration:none;font-weight:600;font-size:16px;padding:14px 28px;border-radius:980px;">${esc(label)}</a>`;
}

export function cardArrivedEmail(card: CardRow, gift?: GiftRow) {
  const d = getDesign(card.design) ?? DESIGNS[0];
  const env = envelopeColor(d, card.envelope);
  const giftLine = gift?.status === "issued" ? ` There's a ${money(gift.amount_cents)} ${esc(getGiftBrand(gift.brand)?.name ?? "")} gift card tucked inside.` : "";
  const url = `${site.url}/c/${card.token}`;
  const from = plainName(card.sender_name);
  const initial = esc((from[0] ?? "K").toUpperCase());
  const html = shell(
    `<tr><td style="background:${env};border-radius:22px;padding:44px 32px 40px;text-align:center;">
      <div style="font-size:13px;letter-spacing:2.5px;text-transform:uppercase;color:#6E6E73;font-weight:600;">A card for</div>
      <div style="font-size:34px;line-height:40px;font-weight:700;letter-spacing:-0.8px;margin:8px 0 26px;">${esc(card.recipient_name)}</div>
      <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr><td style="width:64px;height:64px;border-radius:32px;background:${d.accent};color:#fff;font-size:28px;font-weight:700;text-align:center;line-height:64px;">${initial}</td></tr></table>
      <div style="font-size:16px;line-height:24px;color:#3A3A3C;margin:24px 0 28px;">From ${esc(from)}, sealed and delivered right on time.${giftLine}</div>
      ${button(url, "Open your card", d.accent)}
    </td></tr>`,
    `${from} sent you a card.`,
  );
  return {
    subject: gift?.status === "issued" ? `${from} sent you a card (and a gift)` : `${from} sent you a card`,
    html,
    text: `${from} sent you a card on ${site.name}.\n\nOpen it here: ${url}\n`,
  };
}

export function loginEmail(url: string, forCard?: CardRow) {
  const lead = forCard
    ? `Tap below to confirm your email. Your card to ${esc(forCard.recipient_name)} goes out ${esc(formatWhen(forCard.send_at, forCard.timezone))}.`
    : `Tap below to sign in. The link works once and expires in 30 minutes.`;
  const html = shell(
    `<tr><td style="background:#fff;border-radius:22px;padding:40px 32px;text-align:center;">
      <div style="font-size:28px;line-height:34px;font-weight:700;letter-spacing:-0.6px;margin-bottom:12px;">${forCard ? "Confirm your card" : `Sign in to ${esc(site.name)}`}</div>
      <div style="font-size:16px;line-height:24px;color:#3A3A3C;margin-bottom:28px;">${lead}</div>
      ${button(url, forCard ? "Confirm and schedule" : "Sign in")}
      <div style="font-size:13px;line-height:20px;color:#86868B;margin-top:24px;">Didn't ask for this? You can ignore it. Nothing is sent until you tap the link.</div>
    </td></tr>`,
    forCard ? "One tap and your card is scheduled." : "Your sign-in link.",
  );
  return {
    subject: forCard ? `Confirm your card to ${forCard.recipient_name}` : `Your ${site.name} sign-in link`,
    html,
    text: `${forCard ? "Confirm your card" : "Sign in"}: ${url}\n\nThe link expires in 30 minutes.`,
  };
}

function notice(title: string, body: string, preheader: string) {
  return shell(
    `<tr><td style="background:#fff;border-radius:22px;padding:36px 32px;text-align:center;">
      <div style="font-size:24px;line-height:30px;font-weight:700;letter-spacing:-0.5px;margin-bottom:10px;">${title}</div>
      <div style="font-size:16px;line-height:24px;color:#3A3A3C;margin-bottom:26px;">${body}</div>
      ${button(`${site.url}/cards`, "See your cards")}
    </td></tr>`,
    preheader,
  );
}

export function deliveredEmail(card: CardRow) {
  const name = esc(card.recipient_name);
  return {
    subject: `Your card to ${card.recipient_name} was delivered`,
    html: notice(`Delivered to ${name}`, `Your card landed in ${name}'s inbox right on time. We'll tell you when they open it.`, "Delivered on time."),
    text: `Your card to ${card.recipient_name} was delivered.`,
  };
}

export function openedEmail(card: CardRow) {
  const name = esc(card.recipient_name);
  return {
    subject: `${card.recipient_name} opened your card`,
    html: notice(`${name} opened your card`, `They just read what you wrote.`, "They opened it."),
    text: `${card.recipient_name} opened your card.`,
  };
}

export function failedEmail(card: CardRow) {
  const name = esc(card.recipient_name);
  return {
    subject: `We couldn't deliver your card to ${card.recipient_name}`,
    html: notice(
      `We couldn't reach ${name}`,
      `We tried several times to deliver to ${esc(card.recipient_email)} and it kept bouncing. Check the address and send it again.`,
      "Delivery problem.",
    ),
    text: `We couldn't deliver your card to ${card.recipient_name} at ${card.recipient_email}.`,
  };
}

function row(label: string, value: string, strong = false) {
  return `<tr><td style="padding:8px 0;font-size:15px;color:${strong ? "#1D1D1F" : "#6E6E73"};${strong ? "font-weight:700;" : ""}">${label}</td><td style="padding:8px 0;font-size:15px;text-align:right;${strong ? "font-weight:700;" : ""}">${value}</td></tr>`;
}

export function receiptEmail(card: CardRow, pay: PaymentRow, gift: GiftRow | undefined, manageUrl: string) {
  const when = formatWhen(card.send_at, card.timezone);
  const lines = [
    row("Card", money(pay.card_cents)),
    pay.tax_cents ? row("Tax", money(pay.tax_cents)) : "",
    gift ? row(`${esc(getGiftBrand(gift.brand)?.name ?? "Gift")} gift card`, money(pay.gift_cents)) : "",
    pay.fee_cents ? row("Gift service fee", money(pay.fee_cents)) : "",
    row("Total", money(pay.amount_cents), true),
  ].join("");
  const html = shell(
    `<tr><td style="background:#fff;border-radius:22px;padding:36px 32px;">
      <div style="font-size:26px;line-height:32px;font-weight:700;letter-spacing:-0.5px;text-align:center;">Sealed and scheduled</div>
      <div style="font-size:16px;line-height:24px;color:#3A3A3C;margin:10px 0 24px;text-align:center;">Your card to ${esc(card.recipient_name)} arrives ${esc(when)}.${gift ? " The gift card is bought the moment it's delivered." : ""} Cancel any time before then for a full refund.</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E8E8ED;border-bottom:1px solid #E8E8ED;margin-bottom:26px;">${lines}</table>
      <div style="text-align:center;">${button(manageUrl, "See your cards")}</div>
      ${pay.receipt_url ? `<div style="text-align:center;font-size:13px;margin-top:18px;"><a href="${pay.receipt_url}" style="color:#0071E3;">Card receipt</a></div>` : ""}
    </td></tr>`,
    `Your card to ${card.recipient_name} is scheduled.`,
  );
  return {
    subject: `Receipt: your card to ${card.recipient_name}`,
    html,
    text: `Your card to ${card.recipient_name} arrives ${when}. Total ${money(pay.amount_cents)}. Manage: ${manageUrl}`,
  };
}

export function renewEmail(card: CardRow) {
  const when = formatWhen(card.send_at, card.timezone);
  return {
    subject: `${card.recipient_name}'s yearly card is coming up`,
    html: notice(
      `Keep ${esc(card.recipient_name)}'s card going`,
      `Your yearly card is ready to go out ${esc(when)}. Tap below to check the message and confirm it for ${money(card.price_cents)}.`,
      "Your yearly card needs a quick confirm.",
    ),
    text: `${card.recipient_name}'s yearly card goes out ${when}. Confirm it at ${site.url}/cards`,
  };
}

export function giftProblemEmail(card: CardRow, gift: GiftRow) {
  return {
    subject: `The gift card for ${card.recipient_name} didn't go through`,
    html: notice(
      "Your card went out, the gift didn't",
      `We couldn't buy the ${esc(getGiftBrand(gift.brand)?.name ?? "")} gift card, so your card was delivered without it and we refunded ${money(gift.amount_cents)} to your card.`,
      "Gift refunded.",
    ),
    text: `We couldn't buy the gift card for ${card.recipient_name} and refunded ${money(gift.amount_cents)}.`,
  };
}
