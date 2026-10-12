import { Footer, Nav } from "@/components/Nav";
import { HeroScroll } from "@/components/landing/HeroScroll";
import { EveryYear, FinalCta, Gallery, HowItWorks, Notifications, Pricing } from "@/components/landing/Sections";

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
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
