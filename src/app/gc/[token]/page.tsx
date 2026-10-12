import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/Nav";
import { GroupView } from "./GroupView";
import { getCartId } from "@/lib/cart";
import { DESIGNS, envelopeColor, getDesign } from "@/lib/designs";
import { canManage, getGroupByView, listSignatures, publicSignature } from "@/lib/groups";
import { getUser } from "@/lib/session";

export const metadata: Metadata = { title: "You have a card", robots: { index: false, follow: false } };

export default async function GroupCardPage({ params }: { params: Promise<{ token: string }> }) {
  const g = getGroupByView((await params).token);
  const admin = !!g && canManage(g, await getUser(), await getCartId());
  if (!g || g.status === "canceled" || g.status === "draft" || (g.status !== "sent" && !admin)) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 22, textAlign: "center" }}>
        <div>
          <h1 className="display display-m">This card isn&apos;t here.</h1>
          <p className="lede" style={{ margin: "12px 0 28px" }}>It may not be time yet, or the link was copied wrong.</p>
          <Link href="/" className="btn btn-primary">Go to the home page</Link>
        </div>
      </main>
    );
  }
  const design = getDesign(g.design) ?? DESIGNS[0];
  return (
    <main>
      <div style={{ position: "fixed", top: 16, left: 22, zIndex: 50 }}>
        <BrandMark />
      </div>
      <GroupView
        design={design}
        token={g.view_token}
        preview={admin}
        envelope={envelopeColor(design, g.envelope)}
        liner={g.liner}
        headline={g.headline}
        recipientName={g.recipient_name}
        notes={listSignatures(g.id).map(publicSignature)}
      />
    </main>
  );
}
