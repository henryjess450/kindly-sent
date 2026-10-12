import type { Metadata } from "next";
import { Footer, Nav } from "@/components/Nav";
import { CartView } from "./CartView";
import { getCartId } from "@/lib/cart";
import { cartGroups, publicGroup } from "@/lib/groups";
import { clientPayConfig } from "@/lib/payments";
import { getUser } from "@/lib/session";

export const metadata: Metadata = { title: "Cart" };
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const user = await getUser();
  const groups = cartGroups(await getCartId()).map(publicGroup);
  return (
    <>
      <Nav />
      <main className="wrap" style={{ padding: "56px 22px 96px", maxWidth: 880, minHeight: "70vh" }}>
        <CartView groups={groups} signedInEmail={user?.email ?? null} pay={clientPayConfig()} />
      </main>
      <Footer />
    </>
  );
}
