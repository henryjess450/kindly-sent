import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Composer } from "@/components/composer/Composer";
import { ownedCard, publicCard } from "@/lib/cards";
import { getUser } from "@/lib/session";
import { clientPayConfig } from "@/lib/payments";

export const metadata: Metadata = { title: "Write a card" };

export default async function SendPage({ searchParams }: { searchParams: Promise<{ design?: string; edit?: string }> }) {
  const { design, edit } = await searchParams;
  const user = await getUser();
  let editCard;
  if (edit) {
    const card = ownedCard(edit, user);
    if (!card || !["pending", "unpaid", "scheduled", "failed"].includes(card.status)) notFound();
    editCard = publicCard(card);
  }
  return (
    <>
      <Nav />
      <Composer signedInEmail={user?.email ?? null} defaultName={user?.name ?? ""} initialDesign={design} editCard={editCard} pay={clientPayConfig()} />
    </>
  );
}
