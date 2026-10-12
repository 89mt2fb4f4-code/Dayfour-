import type { Metadata } from "next";
import About from "@/components/site/about";
import AgencyHeroSection from "@/components/ui/hero-01";

export const metadata: Metadata = {
  title: "About — DɅYFOVR",
  alternates: { canonical: "/about" },
  openGraph: { url: "/about" },
};

export default function AboutPage() {
  return (
    <main className="w-full bg-black">
      <h1 className="sr-only">About DɅYFOVR</h1>
      <About />
      <AgencyHeroSection currentPage="/about" />
    </main>
  );
}
