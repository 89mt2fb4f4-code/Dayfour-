import Opening from "@/components/site/opening";
import About from "@/components/site/about";
import Work from "@/components/site/work";
import Disciplines from "@/components/site/disciplines";
import SoundToggle from "@/components/site/sound-toggle";
import AgencyHeroSection from "@/components/ui/hero-01";
import { LetsWorkTogether } from "@/components/ui/lets-work-section";
import { INSTAGRAM_DM } from "@/lib/links";

export default function Home() {
  return (
    <main className="w-full bg-black">
      <h1 className="sr-only">DAYFOUR. Film. Commercial. Documentary.</h1>
      <Opening />
      <About />
      <Disciplines />
      <Work />
      <LetsWorkTogether contactHref={INSTAGRAM_DM} />
      <SoundToggle />
      <AgencyHeroSection />
    </main>
  );
}
