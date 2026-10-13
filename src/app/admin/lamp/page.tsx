import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Footer, Nav } from "@/components/Nav";
import { LampPanel } from "@/components/lamp/LampPanel";
import { site } from "@/config/site";
import { getLampSettings, lampKeyMadeAt, lampPresence, recentPlays } from "@/lib/lamp/server";
import { getUser, isAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Card lamp", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// The LED ring on the desk: play animations, pick what lights it up, pair it.
export default async function LampPage() {
  const user = await getUser();
  if (!user) redirect("/signin?next=/admin/lamp");
  if (!isAdmin(user)) notFound();
  return (
    <>
      <Nav />
      <main className="wrap" style={{ padding: "48px 22px 96px", maxWidth: 1100 }}>
        <LampPanel settings={getLampSettings()} status={lampPresence()} plays={recentPlays()} keyMadeAt={lampKeyMadeAt()} site={site.url} />
      </main>
      <Footer />
    </>
  );
}
