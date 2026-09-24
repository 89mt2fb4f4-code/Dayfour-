import Opening from "@/components/site/opening";
import About from "@/components/site/about";
import Work from "@/components/site/work";
import Footer from "@/components/site/footer";
import SoundToggle from "@/components/site/sound-toggle";
import { LetsWorkTogether } from "@/components/ui/lets-work-section";
import { INSTAGRAM_DM } from "@/lib/links";

export default function Home() {
  return (
    <main className="w-full bg-black">
      <h1 className="sr-only">DAYFOUR. Film. Commercial. Documentary.</h1>
      <Opening />
      <About />
      <Work />
      <LetsWorkTogether contactHref={INSTAGRAM_DM} />
      <Footer />
      <SoundToggle />
    </main>
  );
}
