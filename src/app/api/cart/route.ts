import { NextResponse } from "next/server";
import { groupQuote } from "@/config/pricing";
import { getCartId } from "@/lib/cart";
import { cartGroups, publicGroup } from "@/lib/groups";

export async function GET() {
  const groups = cartGroups(await getCartId());
  return NextResponse.json({ groups: groups.map(publicGroup), quote: groupQuote(groups.length) });
}
