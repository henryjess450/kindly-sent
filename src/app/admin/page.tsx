import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Footer, Nav } from "@/components/Nav";
import { AdminDashboard } from "./AdminDashboard";
import { site } from "@/config/site";
import { adminLists, adminStats } from "@/lib/admin";
import { listCodes } from "@/lib/freecodes";
import { getUser, isAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// The site admin's view of every card: what's coming up, what's gone out, and free links.
export default async function AdminPage() {
  const user = await getUser();
  if (!user) redirect("/signin?next=/admin");
  if (!isAdmin(user)) notFound();
  const { upcoming, sent } = adminLists();
  return (
    <>
      <Nav />
      <main className="wrap" style={{ padding: "48px 22px 96px", maxWidth: 1100 }}>
        <AdminDashboard stats={adminStats()} upcoming={upcoming} sent={sent} codes={listCodes()} siteUrl={site.url} />
      </main>
      <Footer />
    </>
  );
}
