"use client";

import CinematicScroll, { type Chapter } from "@/components/ui/scroll-triggered-video-hero";

/* Dark studio gradients: a soft grey light in the upper left falling to black.
   The light drifts a little between chapters so each crossfade has some movement. */
const dark = (x: number, y: number, light = "#4a4a4a") =>
  `radial-gradient(120% 85% at ${x}% ${y}%, ${light} 0%, #1c1c1c 45%, #050505 100%)`;

const chapters: Chapter[] = [
  {
    id: "studio",
    title: "DɅYFOVR",
    body: "We make things that stay with you.",
    background: dark(22, 18, "#525252"),
  },
  {
    id: "private",
    title: "Shhh keeping it private",
    body: "Not everything we make is seen. Not everyone is meant to see it.",
    background: dark(30, 24),
  },
  {
    id: "believe",
    title: "What we believe",
    body: "We believe in restraint. We believe mystery is not a strategy, it is a standard. We believe the work speaks and the studio stays quiet.",
    background: dark(18, 30, "#444444"),
  },
  {
    id: "who",
    title: "Who we work with",
    body: "Creatives. Brands. People with a vision who need someone who can see it too. Not everyone. The right ones.",
    background: dark(26, 20, "#3e3e3e"),
  },
];

export default function About() {
  return <CinematicScroll chapters={chapters} />;
}
