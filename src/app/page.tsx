import { Footer, Nav } from "@/components/Nav";
import { HeroScroll } from "@/components/landing/HeroScroll";
import { EveryYear, FinalCta, Gallery, Gifts, HowItWorks, Notifications, Pricing } from "@/components/landing/Sections";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <HeroScroll />
        <Gallery />
        <HowItWorks />
        <Gifts />
        <EveryYear />
        <Notifications />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
