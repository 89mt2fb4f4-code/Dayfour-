"use client";

/*
 * Adapted from 21st.dev "Davincho Hero-1" (cnippet-dev): a clipped window over a
 * fixed, parallaxing background. Here the background is the fast timeline, still
 * running, so the section below slides over moving footage instead of a frozen frame.
 */
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import { drawFrame, frameAt, loadFastFrames, loopIndex, setLooping } from "@/lib/fast-frames";

export default function FootageWindow({ children, className }: { children?: ReactNode; className?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollYProgress } = useScroll({ offset: ["start end", "end start"], target: container });
  // Drift only while the window is leaving (second half), so it never opens a gap.
  const y = useTransform(scrollYProgress, [0.5, 1], ["0%", "-10%"]);

  useEffect(() => {
    loadFastFrames();
    const canvas = canvasRef.current!;
    let raf = 0;
    let running = false;
    let last = -1;
    const tick = () => {
      if (!running) return;
      setLooping(true);
      const index = loopIndex();
      const img = frameAt(index);
      if (img && index !== last) {
        last = index;
        drawFrame(canvas, img);
      }
      raf = requestAnimationFrame(tick);
    };
    const seen = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (running) raf = requestAnimationFrame(tick);
    });
    seen.observe(container.current!);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      seen.disconnect();
    };
  }, []);

  return (
    <div
      ref={container}
      aria-hidden="true"
      className={`relative z-0 h-[calc(100svh+120px)] overflow-hidden bg-black ${className ?? ""}`}
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      <div className="fixed left-0 top-0 h-[100svh] w-full">
        <motion.div className="relative h-full w-full" style={{ y }}>
          <canvas ref={canvasRef} className="h-full w-full object-cover" />
        </motion.div>
      </div>
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  );
}
