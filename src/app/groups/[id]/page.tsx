import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Footer, Nav } from "@/components/Nav";
import { GroupAdmin } from "./GroupAdmin";
import { site } from "@/config/site";
import { getCartId } from "@/lib/cart";
import { canManage, getGroup, groupAdmins, isOwner, listInvites, listSignatures, publicGroup, publicSignature } from "@/lib/groups";
import { getUser, isAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Group card", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function GroupAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = getGroup(id);
  if (!g || g.status === "canceled") notFound();
  if (g.status === "draft") redirect("/cart");
  const user = await getUser();
  if (!user) redirect(`/signin?next=/groups/${id}`);
  if (!canManage(g, user, await getCartId())) notFound();
  return (
    <>
      <Nav />
      <main className="wrap" style={{ padding: "48px 22px 96px", maxWidth: 1000 }}>
        <GroupAdmin
          group={publicGroup(g)}
          inviteUrl={`${site.url}/g/${g.invite_token}`}
          viewPath={`/gc/${g.view_token}`}
          notes={listSignatures(g.id, { includeHidden: true }).map(publicSignature)}
          invites={listInvites(g.id)}
          admins={groupAdmins(g.id)}
          me={user.email}
          owner={isOwner(g, user) || isAdmin(user)}
        />
      </main>
      <Footer />
    </>
  );
}
