import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Nav } from "@/components/Nav";
import { getCode } from "@/lib/freecodes";

export const metadata: Metadata = { title: "A free card", robots: { index: false, follow: false } };

// A free link from the site admin: send it on to the right composer.
export default async function FreeLink({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const c = getCode(code);
  if (c && !c.disabled && c.used < c.max_uses) redirect(c.kind === "group" ? `/group?free=${c.code}` : `/send?free=${c.code}`);
  return (
    <>
      <Nav />
      <main style={{ minHeight: "calc(100vh - 52px)", display: "grid", placeItems: "center", padding: 22, textAlign: "center" }}>
        <div>
          <h1 className="display display-m">This free link has been used up.</h1>
          <p className="lede" style={{ margin: "12px auto 28px", maxWidth: 480 }}>Every free card on it has been sent. You can still send one for {c?.kind === "group" ? "$1.50" : "$1"}.</p>
          <Link href={c?.kind === "group" ? "/group" : "/send"} className="btn btn-brand">{c?.kind === "group" ? "Start a group card" : "Write a card"}</Link>
        </div>
      </main>
    </>
  );
}
