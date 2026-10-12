import { site } from "@/config/site";
import { money } from "@/config/pricing";
import type { CardRow, GroupRow, PaymentRow } from "./db";
import { getDesign, DESIGNS, envelopeColor } from "./designs";
import { formatShort, formatWhen } from "./time";
import { plainName } from "./names";
export { plainName };

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
  const env = envelopeColor(d, card.envelope);
  const url = `${site.url}/c/${card.token}`;
  const from = plainName(card.sender_name);
  const initial = esc((from[0] ?? "K").toUpperCase());
  const html = shell(
    `<tr><td style="background:${env};border-radius:22px;padding:44px 32px 40px;text-align:center;">
      <div style="font-size:13px;letter-spacing:2.5px;text-transform:uppercase;color:#6E6E73;font-weight:600;">A card for</div>
      <div style="font-size:34px;line-height:40px;font-weight:700;letter-spacing:-0.8px;margin:8px 0 26px;">${esc(card.recipient_name)}</div>
      <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr><td style="width:64px;height:64px;border-radius:32px;background:${d.accent};color:#fff;font-size:28px;font-weight:700;text-align:center;line-height:64px;">${initial}</td></tr></table>
      <div style="font-size:16px;line-height:24px;color:#3A3A3C;margin:24px 0 28px;">From ${esc(from)}, sealed and delivered right on time.</div>
      ${button(url, "Open your card", d.accent)}
    </td></tr>`,
    `${from} sent you a card.`,
  );
  return {
    subject: `${from} sent you a card`,
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

function notice(title: string, body: string, preheader: string, href = `${site.url}/cards`, label = "See your cards", color?: string) {
  return shell(
    `<tr><td style="background:#fff;border-radius:22px;padding:36px 32px;text-align:center;">
      <div style="font-size:24px;line-height:30px;font-weight:700;letter-spacing:-0.5px;margin-bottom:10px;">${title}</div>
      <div style="font-size:16px;line-height:24px;color:#3A3A3C;margin-bottom:26px;">${body}</div>
      ${button(href, label, color)}
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

export function receiptEmail(card: CardRow, pay: PaymentRow, manageUrl: string) {
  const when = formatWhen(card.send_at, card.timezone);
  const lines = [
    row("Card", money(pay.card_cents)),
    pay.tax_cents ? row("Tax", money(pay.tax_cents)) : "",
    row("Total", money(pay.amount_cents), true),
  ].join("");
  const html = shell(
    `<tr><td style="background:#fff;border-radius:22px;padding:36px 32px;">
      <div style="font-size:26px;line-height:32px;font-weight:700;letter-spacing:-0.5px;text-align:center;">Sealed and scheduled</div>
      <div style="font-size:16px;line-height:24px;color:#3A3A3C;margin:10px 0 24px;text-align:center;">Your card to ${esc(card.recipient_name)} arrives ${esc(when)}. Cancel any time before then for a full refund.</div>
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

/* ---------- group cards ---------- */

const people = (n: number) => `${n} ${n === 1 ? "person" : "people"}`;
const manageUrl = (g: GroupRow) => `${site.url}/groups/${g.id}`;

export function groupInviteEmail(g: GroupRow, url: string, from: string) {
  const d = getDesign(g.design) ?? DESIGNS[0];
  const due = formatShort(g.due_at, g.timezone);
  const html = shell(
    `<tr><td style="background:${envelopeColor(d, g.envelope)};border-radius:22px;padding:44px 32px 40px;text-align:center;">
      <div style="font-size:13px;letter-spacing:2.5px;text-transform:uppercase;color:#6E6E73;font-weight:600;">Sign the card for</div>
      <div style="font-size:34px;line-height:40px;font-weight:700;letter-spacing:-0.8px;margin:8px 0 18px;">${esc(g.recipient_name)}</div>
      <div style="font-size:16px;line-height:24px;color:#3A3A3C;margin:0 0 28px;">${esc(from)} is putting together a group card${g.headline ? `: &ldquo;${esc(g.headline)}&rdquo;` : ""}. Add a message, a photo or a GIF before <strong>${esc(due)}</strong>.</div>
      ${button(url, "Sign the card", d.accent)}
      <div style="font-size:13px;line-height:20px;color:#6E6E73;margin-top:22px;">Shh, it's a surprise. ${esc(g.recipient_name)} won't see it until it's delivered.</div>
    </td></tr>`,
    `Add your message to ${g.recipient_name}'s card.`,
  );
  return { subject: `Sign ${g.recipient_name}'s card`, html, text: `${from} invited you to sign a group card for ${g.recipient_name}. Signatures are due ${due}.\n\n${url}\n` };
}

export function groupReminderEmail(g: GroupRow, url: string) {
  const d = getDesign(g.design) ?? DESIGNS[0];
  const due = formatShort(g.due_at, g.timezone);
  return {
    subject: `Last call: sign ${g.recipient_name}'s card`,
    html: notice(`There's still time to sign`, `${esc(g.recipient_name)}'s group card closes ${esc(due)}. It only takes a minute.`, "Signatures are due soon.", url, "Sign the card", d.accent),
    text: `${g.recipient_name}'s group card closes ${due}. Sign it here: ${url}`,
  };
}

export function groupAdminAddedEmail(g: GroupRow, by: string, url: string) {
  return {
    subject: `You're helping with ${g.recipient_name}'s card`,
    html: notice(
      `You're an admin on ${esc(g.recipient_name)}'s card`,
      `${esc(by)} added you. You can invite people, tidy up messages and change the delivery date.`,
      "You can now manage this group card.",
      url,
      "Open the card",
    ),
    text: `${by} made you an admin on ${g.recipient_name}'s group card: ${url}`,
  };
}

export function groupAdminReminderEmail(g: GroupRow, count: number) {
  const due = formatShort(g.due_at, g.timezone);
  return {
    subject: `${people(count)} signed ${g.recipient_name}'s card so far`,
    html: notice(`Signatures close ${esc(due)}`, `${people(count)} have signed ${esc(g.recipient_name)}'s card. Share the link once more to catch anyone who missed it.`, "Signatures are due soon.", manageUrl(g), "Manage the card"),
    text: `${people(count)} have signed ${g.recipient_name}'s card. Signatures close ${due}. ${manageUrl(g)}`,
  };
}

export function groupArrivedEmail(g: GroupRow, count: number) {
  const d = getDesign(g.design) ?? DESIGNS[0];
  const url = `${site.url}/gc/${g.view_token}`;
  const html = shell(
    `<tr><td style="background:${envelopeColor(d, g.envelope)};border-radius:22px;padding:44px 32px 40px;text-align:center;">
      <div style="font-size:13px;letter-spacing:2.5px;text-transform:uppercase;color:#6E6E73;font-weight:600;">A card for</div>
      <div style="font-size:34px;line-height:40px;font-weight:700;letter-spacing:-0.8px;margin:8px 0 22px;">${esc(g.recipient_name)}</div>
      <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr><td style="width:72px;height:72px;border-radius:36px;background:${d.accent};color:#fff;font-size:26px;font-weight:700;text-align:center;line-height:72px;">${count}</td></tr></table>
      <div style="font-size:16px;line-height:24px;color:#3A3A3C;margin:22px 0 28px;">${count > 0 ? `${people(count)} signed a card for you.` : "Someone made you a card."}${g.headline ? ` &ldquo;${esc(g.headline)}&rdquo;` : ""}</div>
      ${button(url, "Open your card", d.accent)}
    </td></tr>`,
    count > 0 ? `${people(count)} signed a card for you.` : "You have a card.",
  );
  return { subject: count > 1 ? `${count} people signed a card for you` : "You have a card", html, text: `Open your card: ${url}\n` };
}

export function groupDeliveredEmail(g: GroupRow, count: number) {
  const name = esc(g.recipient_name);
  return {
    subject: `${g.recipient_name}'s group card was delivered`,
    html: notice(`Delivered to ${name}`, `The card with messages from ${people(count)} just landed. We'll tell you when ${name} opens it.`, "Delivered on time.", manageUrl(g), "See the card"),
    text: `${g.recipient_name}'s group card was delivered with messages from ${people(count)}.`,
  };
}

export function groupOpenedEmail(g: GroupRow) {
  const name = esc(g.recipient_name);
  return {
    subject: `${g.recipient_name} opened the group card`,
    html: notice(`${name} opened the card`, `They're reading everyone's messages right now.`, "They opened it.", manageUrl(g), "See the card"),
    text: `${g.recipient_name} opened the group card.`,
  };
}

export function groupFailedEmail(g: GroupRow) {
  return {
    subject: `We couldn't deliver ${g.recipient_name}'s group card`,
    html: notice(`We couldn't reach ${esc(g.recipient_name)}`, `Delivery to ${esc(g.recipient_email)} kept bouncing. Check the address and we'll send it again.`, "Delivery problem.", manageUrl(g), "Fix the address"),
    text: `We couldn't deliver ${g.recipient_name}'s group card to ${g.recipient_email}. ${manageUrl(g)}`,
  };
}

export function groupReceiptEmail(groups: GroupRow[], pay: PaymentRow, manage: string) {
  const lines = [
    ...groups.map((g) => row(`Group card for ${esc(g.recipient_name)}`, money(g.price_cents))),
    pay.tax_cents ? row("Tax", money(pay.tax_cents)) : "",
    row("Total", money(pay.amount_cents), true),
  ].join("");
  const html = shell(
    `<tr><td style="background:#fff;border-radius:22px;padding:36px 32px;">
      <div style="font-size:26px;line-height:32px;font-weight:700;letter-spacing:-0.5px;text-align:center;">${groups.length === 1 ? "Your group card is open for signing" : `${groups.length} group cards are open for signing`}</div>
      <div style="font-size:16px;line-height:24px;color:#3A3A3C;margin:10px 0 24px;text-align:center;">Share each card's invite link and everyone can add a message, photo or GIF. Cancel before delivery for a refund.</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E8E8ED;border-bottom:1px solid #E8E8ED;margin-bottom:26px;">${lines}</table>
      <div style="text-align:center;">${button(manage, "Get the invite links")}</div>
      ${pay.receipt_url ? `<div style="text-align:center;font-size:13px;margin-top:18px;"><a href="${pay.receipt_url}" style="color:#0071E3;">Card receipt</a></div>` : ""}
    </td></tr>`,
    "Your group cards are ready to sign.",
  );
  return { subject: `Receipt: ${groups.length === 1 ? "your group card" : `${groups.length} group cards`}`, html, text: `Total ${money(pay.amount_cents)}. Manage: ${manage}` };
}

/** Confirmation for a card sent with a free link (no payment, so no receipt). */
export function freeCardEmail(card: CardRow, manageUrl: string) {
  const when = formatWhen(card.send_at, card.timezone);
  return {
    subject: `Your card to ${card.recipient_name} is scheduled`,
    html: notice("Sealed and scheduled", `Your card to ${esc(card.recipient_name)} arrives ${esc(when)}. This one's on us.`, "Your card is scheduled.", manageUrl, "See your cards"),
    text: `Your card to ${card.recipient_name} arrives ${when}. Manage: ${manageUrl}`,
  };
}

export function groupFreeEmail(g: GroupRow, inviteUrl: string, manageUrl: string) {
  return {
    subject: `${g.recipient_name}'s group card is open for signing`,
    html: notice(
      `${esc(g.recipient_name)}'s card is ready to sign`,
      `Share this link with everyone who should sign:<br><a href="${inviteUrl}" style="color:#0071E3;word-break:break-all;">${esc(inviteUrl)}</a><br><br>Signatures are due ${esc(formatShort(g.due_at, g.timezone))}. This one's on us.`,
      "Your group card is ready.",
      manageUrl,
      "Manage the card",
    ),
    text: `Share this link to collect signatures: ${inviteUrl}\nManage the card: ${manageUrl}`,
  };
}
