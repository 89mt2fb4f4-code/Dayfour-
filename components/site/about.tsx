"use client";

import CinematicScroll, { type Chapter } from "@/components/ui/scroll-triggered-video-hero";

const chapters: Chapter[] = [
  { id: "studio", title: "DɅYFOVR", body: "We make things that stay with you." },
  {
    id: "private",
    title: "Shhh keeping it private",
    body: "Not everything we make is seen. Not everyone is meant to see it.",
  },
  {
    id: "believe",
    title: "What we believe",
    body: "We believe in restraint. We believe mystery is not a strategy, it is a standard. We believe the work speaks and the studio stays quiet.",
  },
  {
    id: "who",
    title: "Who we work with",
    body: "Creatives. Brands. People with a vision who need someone who can see it too. Not everyone. The right ones.",
  },
];

/** The about page: four chapters on plain black. */
export default function About() {
  return <CinematicScroll chapters={chapters} />;
}
