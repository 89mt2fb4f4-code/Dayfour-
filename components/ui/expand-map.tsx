"use client";

/*
 * Adapted from 21st.dev "Expand Map" (LocationMap).
 * Kept: the 3D tilt that follows the pointer and the underline that grows on hover.
 * Replaced: the map drawing, pin and "Live" badge with the project's still. Tapping the
 * card opens the full detail view (description and video), the same one Client work uses.
 * Square corners, black and white.
 */
import type React from "react";
import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "motion/react";
import { Play } from "lucide-react";
import { youtubeId, youtubeThumb } from "@/lib/youtube";

interface WorkCardProps {
  title: string;
  meta?: string;
  youtubeUrl: string;
  cover?: string;
  onOpen: () => void;
  className?: string;
}

export function WorkCard({ title, meta, youtubeUrl, cover, onOpen, className }: WorkCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoId = youtubeId(youtubeUrl);
  const still = cover ?? (videoId ? youtubeThumb(videoId) : undefined);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-50, 50], [8, -8]);
  const rotateY = useTransform(mouseX, [-50, 50], [-8, 8]);
  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - (rect.left + rect.width / 2));
    mouseY.set(e.clientY - (rect.top + rect.height / 2));
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={containerRef}
      className={`relative w-[min(62vw,360px)] select-none ${className ?? ""}`}
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative overflow-hidden border border-white/15 bg-black"
        style={{ rotateX: springRotateX, rotateY: springRotateY, transformStyle: "preserve-3d" }}
      >
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Open ${title}`}
          className="group relative block aspect-video w-full cursor-pointer focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-4 focus-visible:outline-white"
        >
          {still && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={still}
              alt=""
              className="absolute inset-0 h-full w-full object-cover grayscale-[0.2]"
              draggable={false}
              // Not every YouTube video has the largest still; fall back to the next size.
              onError={(e) => {
                const img = e.currentTarget;
                if (videoId && !cover && !img.src.includes("hqdefault")) img.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                else img.style.visibility = "hidden";
              }}
            />
          )}
          <span className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/10" />
          <span className="absolute left-1/2 top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-black/30 text-white backdrop-blur-sm">
            <Play className="size-4 translate-x-px" strokeWidth={1.5} fill="currentColor" />
          </span>
        </button>
      </motion.div>

      <div className="mt-3 space-y-1">
        <button type="button" onClick={onOpen} className="block text-left">
          <motion.span
            className="block font-serif text-2xl font-light text-white"
            animate={{ x: isHovered ? 4 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {title}
          </motion.span>
        </button>
        {meta && <p className="font-sans text-xs font-light text-df-grey-light">{meta}</p>}
        <motion.div
          className="h-px bg-gradient-to-r from-white/50 via-white/25 to-transparent"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0.3 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}
