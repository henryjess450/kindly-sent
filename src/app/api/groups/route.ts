import { NextResponse } from "next/server";
import { ensureCartId } from "@/lib/cart";
import { addAdmin, cartCount, getGroup, insertGroup, parseGroup, publicGroup } from "@/lib/groups";
import { site } from "@/config/site";
import { getDb } from "@/lib/db";
import { groupFreeEmail } from "@/lib/emails";
import { claimCode, usableCode } from "@/lib/freecodes";
import { sendMail } from "@/lib/mail";
import { createLoginLink, getUser, normalizeEmail } from "@/lib/session";

const MAX_IN_CART = 50;

// Set up a group card and put it in the cart. Signing opens once it's paid for.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const parsed = parseGroup(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const user = await getUser();

  // A free link from the site admin: skip the cart, open for signing right away.
  if (body.freeCode !== undefined) {
    const email = user?.email ?? normalizeEmail(body.email);
    if (!email) return NextResponse.json({ error: "Add your email so you can manage the card." }, { status: 400 });
    const code = usableCode(body.freeCode, "group");
    if (!code || !claimCode(code.code, "group")) return NextResponse.json({ error: "This free link has been used up." }, { status: 410 });
    const draft = insertGroup(parsed.group, { cartId: "", ownerEmail: email });
    getDb().prepare("UPDATE group_cards SET status = 'collecting', cart_id = NULL, free_code = ? WHERE id = ?").run(code.code, draft.id);
    addAdmin(draft.id, email, "owner");
    const g = getGroup(draft.id)!;
    const inviteUrl = `${site.url}/g/${g.invite_token}`;
    const manage = user ? `${site.url}/groups/${g.id}` : (createLoginLink(email, { next: `/groups/${g.id}` }) ?? `${site.url}/signin`);
    await sendMail({ to: email, ...groupFreeEmail(g, inviteUrl, manage) }).catch((e) => console.error("[free]", e));
    return NextResponse.json({ group: publicGroup(g), inviteUrl, signedIn: !!user, email });
  }

  const cartId = await ensureCartId();
  if (cartCount(cartId) >= MAX_IN_CART) return NextResponse.json({ error: "Your cart is full. Check out first." }, { status: 429 });
  const g = insertGroup(parsed.group, { cartId, ownerEmail: user?.email ?? null });
  return NextResponse.json({ group: publicGroup(g), cartCount: cartCount(cartId) });
}
