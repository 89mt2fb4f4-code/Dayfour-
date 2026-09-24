"use client";

import { motion } from "framer-motion";

/** "Short Film. Commercial. Documentary." set in a thin frame with corner dots. */
export default function Disciplines() {
  const lines = [
    { text: "Short Film.", bold: false },
    { text: "Commercial.", bold: false },
    { text: "Documentary", bold: true },
  ];
  return (
    <section aria-label="What we make" className="relative flex h-[72svh] items-center justify-center overflow-hidden bg-black px-6">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-15%" }}
        transition={{ staggerChildren: 0.12 }}
        className="relative px-5 py-4"
      >
        {/* Frame: lines run past the corners, with a dot at each corner. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <span className="absolute -left-[100vw] -right-[100vw] top-0 h-px bg-white/25" />
          <span className="absolute -left-[100vw] -right-[100vw] bottom-0 h-px bg-white/25" />
          <span className="absolute -bottom-[30svh] -top-[30svh] left-0 w-px bg-white/25" />
          <span className="absolute -bottom-[30svh] -top-[30svh] right-0 w-px bg-white/25" />
          {["left-0 top-0", "right-0 top-0", "left-0 bottom-0", "right-0 bottom-0"].map((pos) => (
            <span key={pos} className={`absolute ${pos} size-2 rounded-full bg-white`} style={{ translate: `${pos.includes("left") ? "-50%" : "50%"} ${pos.includes("top") ? "-50%" : "50%"}` }} />
          ))}
        </div>
        {lines.map(({ text, bold }) => (
          <div key={text} className="overflow-hidden">
            <motion.p
              variants={{ hidden: { y: "100%", opacity: 0 }, visible: { y: "0%", opacity: 1, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } } }}
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
