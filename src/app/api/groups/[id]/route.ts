import { NextResponse } from "next/server";
import { site } from "@/config/site";
import { getCartId } from "@/lib/cart";
import { getDb } from "@/lib/db";
import { groupAdminAddedEmail, groupInviteEmail } from "@/lib/emails";
import {
  addAdmin, addInvites, canManage, getGroup, getSignature, groupAdmins, isOwner, listInvites, parseGroup, publicGroup, sigMedia, signingOpen, updateGroup,
} from "@/lib/groups";
import { newToken } from "@/lib/ids";
import { sendMail } from "@/lib/mail";
import { noteLimits } from "@/lib/notes";
import { getPayment, refund } from "@/lib/payments";
import { limited } from "@/lib/ratelimit";
import { tick } from "@/lib/scheduler";
import { createLoginLink, getUser, isAdmin, normalizeEmail } from "@/lib/session";
import { deletePhoto } from "@/lib/uploads";

type Ctx = { params: Promise<{ id: string }> };
const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

async function load(ctx: Ctx) {
  const g = getGroup((await ctx.params).id);
  const user = await getUser();
  if (!g || g.status === "canceled" || !canManage(g, user, await getCartId())) return { g: undefined, user };
  return { g, user };
}

/** Change who it's for, the design, or the dates. */
export async function PATCH(req: Request, ctx: Ctx) {
  const { g } = await load(ctx);
  if (!g) return fail("Card not found.", 404);
  if (!["draft", "collecting", "failed"].includes(g.status)) return fail("This card has already gone out.", 409);
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const parsed = parseGroup(body, g);
  if (!parsed.ok) return fail(parsed.error);
  updateGroup(g.id, parsed.group);
  return NextResponse.json({ group: publicGroup(getGroup(g.id)!) });
}

/** Take a draft out of the cart, or cancel a paid card before delivery for a refund. */
export async function DELETE(_req: Request, ctx: Ctx) {
  const { g, user } = await load(ctx);
  if (!g) return fail("Card not found.", 404);
  const db = getDb();
  if (g.status === "draft") {
    db.prepare("DELETE FROM group_cards WHERE id = ? AND status = 'draft'").run(g.id);
    return NextResponse.json({ ok: true, refunded: 0 });
  }
  if (!isOwner(g, user) && !isAdmin(user)) return fail("Only the person who bought the card can cancel it.", 403);
  const res = db.prepare("UPDATE group_cards SET status = 'canceled' WHERE id = ? AND status IN ('collecting','failed')").run(g.id);
  if (res.changes !== 1) return fail("This card has already gone out.", 409);
  let refunded = 0;
  const payment = getPayment(g.payment_id);
  if (payment && g.price_cents > 0) {
    try {
      // One payment can cover several cards, so each refund gets its own key.
      refunded = await refund(payment, g.price_cents, `cancel-${g.id}`);
    } catch (err) {
      console.error("[refund]", err);
      return NextResponse.json({ ok: true, refunded: 0, error: "Cancelled, but the refund needs a hand. We'll sort it out by email." });
    }
  }
  return NextResponse.json({ ok: true, refunded });
}

/** Everything else an admin can do, by `action`. */
export async function POST(req: Request, ctx: Ctx) {
  const { g, user } = await load(ctx);
  if (!g || g.status === "draft" || !user) return fail("Card not found.", 404);
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const db = getDb();
  const live = ["collecting", "failed"].includes(g.status);

  switch (body.action) {
    case "invite": {
      if (!signingOpen(g)) return fail("Signing is closed. Move the due date to invite more people.");
      if (limited(`invite:${user.id}`, 300, 3600e3)) return fail("That's a lot of invites for one hour. Try again later.", 429);
      const raw = typeof body.emails === "string" ? body.emails : "";
      const emails = [...new Set(raw.split(/[\s,;]+/).map(normalizeEmail).filter((e): e is string => !!e))];
      if (emails.length === 0) return fail("Add at least one email address.");
      if (emails.length > 50) return fail("Up to 50 emails at a time.");
      const added = addInvites(g.id, emails);
      const from = user.name || user.email;
      for (const inv of added) {
        await sendMail({ to: inv.email, ...groupInviteEmail(g, `${site.url}/g/${g.invite_token}?i=${inv.id}`, from) }).catch((e) => console.error("[invite]", e));
      }
      return NextResponse.json({ sent: added.length, skipped: emails.length - added.length, invites: listInvites(g.id) });
    }

    case "addAdmin": {
      const email = normalizeEmail(body.email);
      if (!email) return fail("Check the email address.");
      if (groupAdmins(g.id).length >= noteLimits.adminsPerCard) return fail(`Up to ${noteLimits.adminsPerCard} admins per card.`);
      addAdmin(g.id, email, "admin");
      const link = createLoginLink(email, { next: `/groups/${g.id}` }) ?? `${site.url}/signin`;
      await sendMail({ to: email, ...groupAdminAddedEmail(g, user.name || user.email, link) }).catch((e) => console.error("[admin]", e));
      return NextResponse.json({ admins: groupAdmins(g.id) });
    }

    case "removeAdmin": {
      const email = normalizeEmail(body.email);
      if (!email || email === g.owner_email) return fail("The card's owner stays an admin.");
      if (!isOwner(g, user) && !isAdmin(user) && email !== user.email) return fail("Only the owner can remove other admins.", 403);
      db.prepare("DELETE FROM group_admins WHERE group_id = ? AND email = ? AND role != 'owner'").run(g.id, email);
      return NextResponse.json({ admins: groupAdmins(g.id) });
    }

    case "hideSignature":
    case "deleteSignature": {
      const sig = getSignature(String(body.signatureId ?? ""));
      if (!sig || sig.group_id !== g.id) return fail("Message not found.", 404);
      if (body.action === "hideSignature") {
        db.prepare("UPDATE signatures SET hidden = ? WHERE id = ?").run(body.hidden ? 1 : 0, sig.id);
      } else {
        db.prepare("DELETE FROM signatures WHERE id = ?").run(sig.id);
        sigMedia(sig).forEach((m) => m.kind === "photo" && deletePhoto(m.src));
      }
      return NextResponse.json({ ok: true });
    }

    case "resetLink": {
      if (!live) return fail("This card has already gone out.", 409);
      const token = newToken();
      db.prepare("UPDATE group_cards SET invite_token = ? WHERE id = ?").run(token, g.id);
      return NextResponse.json({ inviteUrl: `${site.url}/g/${token}` });
    }

    case "closeSigning": {
      if (!live) return fail("This card has already gone out.", 409);
      db.prepare("UPDATE group_cards SET due_at = MIN(due_at, ?) WHERE id = ?").run(Date.now(), g.id);
      return NextResponse.json({ group: publicGroup(getGroup(g.id)!) });
    }

    case "sendNow": {
      if (!live) return fail("This card has already gone out.", 409);
      const now = Date.now();
      db.prepare("UPDATE group_cards SET status = 'collecting', due_at = MIN(due_at, ?), deliver_at = ?, attempts = 0, next_attempt_at = NULL WHERE id = ?").run(now, now, g.id);
      await tick();
      return NextResponse.json({ group: publicGroup(getGroup(g.id)!) });
    }
  }
  return fail("Unknown action.");
}
