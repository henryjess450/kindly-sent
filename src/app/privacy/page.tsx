import type { Metadata } from "next";
import { Footer, Nav } from "@/components/Nav";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <>
      <Nav />
      <main className="wrap" style={{ maxWidth: 720, padding: "64px 22px 96px" }}>
        <h1 className="display display-m">Privacy</h1>
        <p className="muted">Draft for review. {site.name} is based in {site.location}, so this follows BC&apos;s Personal Information Protection Act (PIPA).</p>
        <h2>What we keep</h2>
        <p>Your email address and name, and for each card: the design, your message, the recipient&apos;s name and email, and when it should arrive. We record when a card is delivered and first opened so we can tell you.</p>
        <h2>What we do with it</h2>
        <p>Only deliver your cards and send you notes about them. We never sell or share it, never add recipients to a mailing list, and never email a recipient anything except the card you sent them.</p>
        <h2>Deleting it</h2>
        <p>Cancel a card any time before it goes out. To delete your account and every card, email <a className="link" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.</p>
      </main>
      <Footer />
    </>
  );
}
