import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/Nav";
import { SignBoard } from "./SignBoard";
import { getCartId } from "@/lib/cart";
import { getDb, type UserRow } from "@/lib/db";
import { canManage, getGroupByInvite, listSignatures, publicGroup, publicSignature } from "@/lib/groups";
import { getUser } from "@/lib/session";

export const metadata: Metadata = { title: "Sign the card", robots: { index: false, follow: false } };

function Missing({ title, body }: { title: string; body: string }) {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 22, textAlign: "center" }}>
      <div>
        <h1 className="display display-m">{title}</h1>
        <p className="lede" style={{ margin: "12px auto 28px", maxWidth: 480 }}>{body}</p>
        <Link href="/" className="btn btn-primary">Go to the home page</Link>
      </div>
    </main>
  );
}

export default async function SignPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ i?: string }> }) {
  const { token } = await params;
  const { i } = await searchParams;
  const g = getGroupByInvite(token);
  if (!g || g.status === "draft" || g.status === "canceled") return <Missing title="This card isn't here." body="The link may have been reset by the organiser, or copied wrong." />;
  if (g.status === "sent") return <Missing title="This card has been delivered." body={`${g.recipient_name} has their card now, so signing is closed. Thanks for being part of it.`} />;
  const user = await getUser();
  const owner = g.owner_email ? (getDb().prepare("SELECT * FROM users WHERE email = ?").get(g.owner_email) as UserRow | undefined) : undefined;
  return (
    <main style={{ background: "var(--bg-alt)", minHeight: "100vh" }}>
      <div style={{ position: "absolute", top: 16, left: 22, zIndex: 5 }}>
        <BrandMark />
      </div>
      <SignBoard
        group={publicGroup(g)}
        inviteToken={token}
        inviteId={i ?? null}
        organiser={owner?.name ?? null}
        manageUrl={canManage(g, user, await getCartId()) ? `/groups/${g.id}` : null}
        notes={listSignatures(g.id).map(publicSignature)}
      />
    </main>
  );
}
