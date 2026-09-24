"use client";

import { motion } from "framer-motion";
import CinematicScroll, { fadeIn, textReveal, type Chapter } from "@/components/ui/scroll-triggered-video-hero";

/* Grey studio-paper gradients after the EVOLVE poster: light top-left, falling to
   near-black in the corners. Each chapter sits a little darker, so the last one
   hands over to the black work section. */
const paper = (light: string, mid: string, dark: string) =>
  `radial-gradient(130% 90% at 28% 18%, ${light} 0%, ${mid} 42%, ${dark} 100%)`;

const chapters: Chapter[] = [
  {
    id: "studio",
    title: "DɅYFOVR",
    body: "We make things that stay with you.",
    background: paper("#a4a4a4", "#6f6f6f", "#1c1c1c"),
    render: () => (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-20%" }}
        transition={{ staggerChildren: 0.15 }}
        className="pointer-events-auto absolute inset-0"
      >
        {/* The title runs top to bottom down the right edge, like EVOLVE. */}
        <div className="absolute inset-y-[5svh] right-[4vw] flex items-center overflow-hidden">
          <motion.h2
            variants={textReveal}
            className="font-poster uppercase leading-[0.8] text-white [writing-mode:vertical-rl]"
            style={{ fontSize: "min(23svh, 34vw)" }}
          >
            DɅYFOVR
          </motion.h2>
        </div>
        <motion.p
          variants={fadeIn}
          className="absolute left-6 top-[46%] max-w-[13ch] text-right font-condensed text-lg font-normal leading-snug tracking-[0.02em] text-white md:left-24 md:text-2xl"
          style={{ right: "calc(4vw + min(23svh, 34vw) * 0.95 + 16px)" }}
        >
          We make things that stay with you.
        </motion.p>
      </motion.div>
    ),
  },
  {
    id: "private",
    title: "Shhh keeping it private",
    body: "Not everything we make is seen. Not everyone is meant to see it.",
    background: paper("#8c8c8c", "#575757", "#141414"),
  },
  {
    id: "believe",
    title: "What we believe",
    body: "We believe in restraint. We believe mystery is not a strategy, it is a standard. We believe the work speaks and the studio stays quiet.",
    background: paper("#727272", "#424242", "#0c0c0c"),
  },
  {
    id: "who",
    title: "Who we work with",
    body: "Creatives. Brands. People with a vision who need someone who can see it too. Not everyone. The right ones.",
    background: paper("#555555", "#2a2a2a", "#000000"),
  },
];

export default function About() {
  return <CinematicScroll chapters={chapters} />;
}
