import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Footer, Nav } from "@/components/Nav";
import { CardList } from "./CardList";
import { listCards, publicCard } from "@/lib/cards";
import { getUser } from "@/lib/session";
import { listGroupsFor, publicGroup } from "@/lib/groups";

export const metadata: Metadata = { title: "Your cards" };

export default async function CardsPage({ searchParams }: { searchParams: Promise<{ confirmed?: string }> }) {
  const user = await getUser();
  if (!user) redirect("/signin");
  const { confirmed } = await searchParams;
  const cards = listCards(user.id).map(publicCard);
  return (
    <>
      <Nav />
      <main className="wrap" style={{ padding: "56px 22px 96px", maxWidth: 880, minHeight: "70vh" }}>
        <CardList cards={cards} email={user.email} name={user.name ?? ""} notifyOpen={!!user.notify_open} confirmed={confirmed} groups={listGroupsFor(user.email).map(publicGroup)} />
      </main>
      <Footer />
    </>
  );
}
