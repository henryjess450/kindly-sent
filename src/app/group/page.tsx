import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { GroupSetup } from "@/components/group/GroupSetup";
import { getCartId } from "@/lib/cart";
import { canManage, cartCount, getGroup, publicGroup } from "@/lib/groups";
import { getUser } from "@/lib/session";
import { usableCode } from "@/lib/freecodes";

export const metadata: Metadata = { title: "Start a group card" };

export default async function GroupPage({ searchParams }: { searchParams: Promise<{ design?: string; edit?: string; free?: string }> }) {
  const { design, edit, free } = await searchParams;
  const user = await getUser();
  const freeCode = !edit && usableCode(free, "group") ? free : undefined;
  const cartId = await getCartId();
  let initial;
  if (edit) {
    // Only drafts are edited here; paid cards are edited on their dashboard.
    const g = getGroup(edit);
    if (!g || g.status !== "draft" || !canManage(g, user, cartId)) notFound();
    initial = publicGroup(g);
  }
  return (
    <>
      <Nav />
      {initial ? (
        <main className="wrap" style={{ maxWidth: 700, padding: "48px 22px 96px" }}>
          <h1 className="display display-m" style={{ marginBottom: 28 }}>Edit {initial.recipientName}&apos;s card</h1>
          <GroupSetup initial={initial} groupId={initial.id} afterSave="/cart" />
        </main>
      ) : (
        <GroupSetup cartCount={cartCount(cartId)} initialDesign={design} freeCode={freeCode} signedInEmail={user?.email ?? null} />
      )}
    </>
  );
}
