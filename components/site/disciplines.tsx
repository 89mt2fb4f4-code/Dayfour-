"use client";

import { motion } from "motion/react";

const FEATHER = "linear-gradient(to bottom, transparent 0, #000 30svh)";

/** "Short. Commercial. Documentary." Sits low in its frame so Client work follows right under it. */
export default function Disciplines() {
  const lines = [
    { text: "Short.", bold: false },
    { text: "Commercial.", bold: false },
    { text: "Documentary", bold: true },
  ];
  return (
    // Follows the expanded timeline directly: it overlaps the moving footage and fades in
    // over it, so there is no edge between them.
    <section
      id="what-we-make"
      aria-label="What we make"
      className="relative -mt-[30svh] flex h-[78svh] items-end justify-center overflow-hidden bg-black px-6 pb-6"
      style={{ maskImage: FEATHER, WebkitMaskImage: FEATHER }}
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-15%" }}
        transition={{ staggerChildren: 0.12 }}
        className="relative px-5 py-4"
      >
        {lines.map(({ text, bold }) => (
          <div key={text} className="overflow-hidden">
            <motion.p
              variants={{ hidden: { transform: "translateY(100%)", opacity: 0 }, visible: { transform: "translateY(0%)", opacity: 1, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } } }}
              className={`font-sans text-[2.6rem] uppercase leading-[1.02] tracking-[-0.01em] text-white ${bold ? "text-right font-medium" : "font-light"}`}
            >
              {text}
            </motion.p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
