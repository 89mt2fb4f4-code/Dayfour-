"use client";

import { motion } from "framer-motion";
import Crosshairs from "@/components/ui/crosshairs";

/** "Short Film. Commercial. Documentary." set in a thin frame with corner dots. */
export default function Disciplines() {
  const lines = [
    { text: "Short Film.", bold: false },
    { text: "Commercial.", bold: false },
    { text: "Documentary", bold: true },
  ];
  return (
    <section id="what-we-make" aria-label="What we make" className="relative flex h-[72svh] items-center justify-center overflow-hidden bg-black px-6">
      <Crosshairs seed={23} count={6} />
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-15%" }}
        transition={{ staggerChildren: 0.12 }}
        className="relative px-5 py-4"
      >
        {/* Frame: lines run past the corners, a second rail sits just under the bottom edge,
            and a dot marks each crossing (after the "Give yourself permission" reference). */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <span className="absolute -left-[100vw] -right-[100vw] top-0 h-px bg-white/25" />
          <span className="absolute -left-[100vw] -right-[100vw] bottom-0 h-px bg-white/25" />
          <span className="absolute -left-[100vw] -right-[100vw] h-px bg-white/25" style={{ top: "calc(100% + 18px)" }} />
          <span className="absolute -bottom-[40svh] -top-[40svh] left-0 w-px bg-white/25" />
          <span className="absolute -bottom-[40svh] -top-[40svh] right-0 w-px bg-white/25" />
          {["0%", "100%", "calc(100% + 18px)"].flatMap((y) =>
            ["0%", "100%"].map((x) => (
              <span
                key={y + x}
                className="absolute size-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                style={{ left: x, top: y }}
              />
            )),
          )}
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
