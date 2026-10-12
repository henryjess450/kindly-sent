import { Footer, Nav } from "@/components/Nav";
import { HeroScroll } from "@/components/landing/HeroScroll";
import { EveryYear, FinalCta, Gallery, HowItWorks, Notifications } from "@/components/landing/Sections";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <HeroScroll />
        <Gallery />
        <HowItWorks />
        <EveryYear />
        <Notifications />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
