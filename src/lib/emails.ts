import { site } from "@/config/site";
import type { CardRow } from "./db";
import { getDesign, DESIGNS } from "./designs";
import { formatWhen } from "./time";

// Plain HTML emails with inline styles, so Gmail, Outlook and Apple Mail agree.

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

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

export function cardArrivedEmail(card: CardRow) {
  const d = getDesign(card.design) ?? DESIGNS[0];
  const url = `${site.url}/c/${card.token}`;
  const initial = esc((card.sender_name.trim()[0] ?? "K").toUpperCase());
  const html = shell(
    `<tr><td style="background:${d.envelope};border-radius:22px;padding:44px 32px 40px;text-align:center;">
      <div style="font-size:13px;letter-spacing:2.5px;text-transform:uppercase;color:#6E6E73;font-weight:600;">A card for</div>
      <div style="font-size:34px;line-height:40px;font-weight:700;letter-spacing:-0.8px;margin:8px 0 26px;">${esc(card.recipient_name)}</div>
      <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr><td style="width:64px;height:64px;border-radius:32px;background:${d.accent};color:#fff;font-size:28px;font-weight:700;text-align:center;line-height:64px;">${initial}</td></tr></table>
      <div style="font-size:16px;line-height:24px;color:#3A3A3C;margin:24px 0 28px;">From ${esc(card.sender_name)}, sealed and delivered right on time.</div>
      ${button(url, "Open your card", d.accent)}
    </td></tr>`,
    `${card.sender_name} sent you a card.`,
  );
  return {
    subject: `${card.sender_name} sent you a card`,
    html,
    text: `${card.sender_name} sent you a card on ${site.name}.\n\nOpen it here: ${url}\n`,
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
