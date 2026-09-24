"use client";

/*
 * Adapted from 21st.dev "Scroll-Triggered Video Hero" (daiwiikharihar).
 * Changes for DAYFOUR:
 *  - Chapters come in as props. Each can have a video or a CSS background
 *    (the about section uses grey, grainy gradients after the EVOLVE poster).
 *  - Kept: header line, masked title reveal, the frosted glass text box.
 *  - Removed: chapter numbers, the indigo accents, the button and the floating
 *    progress pill. Type is white; titles use the condensed poster face.
 *  - A chapter can render its own layout (the first one sets the title vertically).
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useScroll, type Variants } from "framer-motion";
import Crosshairs from "@/components/ui/crosshairs";

export interface Chapter {
  id: string;
  title: string;
  body: string;
  /** Small label beside the header line. */
  label?: string;
  videoUrl?: string;
  background?: string;
  /** Replaces the default heading + body layout. */
  render?: () => ReactNode;
}

const textContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export const textReveal: Variants = {
  hidden: { y: "100%", opacity: 0 },
  visible: { y: "0%", opacity: 1, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, delay: 0.35, ease: "easeOut" } },
};

const FilmGrain = () => (
  <div className="pointer-events-none absolute inset-0 z-20 opacity-[0.16] mix-blend-overlay">
    <div
      className="absolute inset-0 h-full w-full"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
      }}
    />
  </div>
);

const ChapterBackgrounds = ({ chapters, current }: { chapters: Chapter[]; current: number }) => (
  <div className="absolute inset-0 h-full w-full overflow-hidden bg-black">
    {chapters.map((chapter, index) => (
      <motion.div
        key={chapter.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: index === current ? 1 : 0, zIndex: index === current ? 10 : 0 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="absolute inset-0 h-full w-full"
        style={{ background: chapter.background } as CSSProperties}
      >
        {chapter.videoUrl && (
          <>
            <video src={chapter.videoUrl} className="h-full w-full object-cover" autoPlay muted loop playsInline />
            <div className="absolute inset-0 bg-black/40" />
          </>
        )}
      </motion.div>
    ))}
    <FilmGrain />
    <Crosshairs seed={37} count={9} className="z-20" />
  </div>
);

export default function CinematicScroll({
  chapters,
  className,
  style,
}: {
  chapters: Chapter[];
  className?: string;
  style?: CSSProperties;
}) {
  const containerRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      setActiveIndex(Math.min(Math.floor(latest * chapters.length), chapters.length - 1));
    });
  }, [scrollYProgress, chapters.length]);

  return (
    <section ref={containerRef} className={`relative w-full ${className ?? ""}`} style={{ height: `${chapters.length * 62 + 38}svh`, ...style }}>
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <ChapterBackgrounds chapters={chapters} current={activeIndex} />
      </div>

      <div className="pointer-events-none absolute inset-0 z-30">
        {chapters.map((chapter) => (
          <div key={chapter.id} className="relative flex h-[62svh] w-full items-center px-6 md:px-24">
            {chapter.render ? (
              chapter.render()
            ) : (
              <motion.div
                variants={textContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, margin: "-20%" }}
                className="pointer-events-auto max-w-4xl"
              >
                {/* Header line */}
                <motion.div variants={fadeIn} className="mb-6 flex items-center gap-4">
                  <div className="h-0.5 w-12 bg-white" />
                  {chapter.label && (
                    <span className="font-sans text-xs font-medium uppercase tracking-[0.3em] text-white/70">{chapter.label}</span>
                  )}
                </motion.div>

                {/* Masked title reveal */}
                <div className="mb-6 overflow-hidden py-2">
                  <motion.h2 variants={textReveal} className="font-poster text-5xl uppercase leading-[0.95] text-white md:text-7xl">
                    {chapter.title}
                  </motion.h2>
                </div>

                {/* Description box */}
                <motion.div
                  variants={fadeIn}
                  className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md"
                >
                  <p className="font-sans text-lg font-light leading-relaxed text-white/80">{chapter.body}</p>
                </motion.div>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
