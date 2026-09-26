"use client";

/*
 * Adapted from 21st.dev "Expand Map" (LocationMap).
 * Kept: the 3D tilt that follows the pointer, the spring expand on tap, the
 * underline that grows on hover. Replaced: the map drawing, pin and "Live" badge
 * with a video still that becomes a playing YouTube video when opened.
 * Square corners, black and white. Only one card plays at a time.
 */
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "motion/react";
import { youtubeEmbed, youtubeId, youtubeThumb } from "@/lib/youtube";

const OPEN_EVENT = "dayfour:work-open";

interface WorkCardProps {
  id: string;
  title: string;
  meta?: string;
  youtubeUrl: string;
  cover?: string;
  className?: string;
}

export function WorkCard({ id, title, meta, youtubeUrl, cover, className }: WorkCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoId = youtubeId(youtubeUrl);
  const still = cover ?? (videoId ? youtubeThumb(videoId) : undefined);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-50, 50], [8, -8]);
  const rotateY = useTransform(mouseX, [-50, 50], [-8, 8]);
  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  // Opening one card closes the others.
  useEffect(() => {
    const onOpen = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== id) setIsExpanded(false);
    };
    addEventListener(OPEN_EVENT, onOpen);
    return () => removeEventListener(OPEN_EVENT, onOpen);
  }, [id]);

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

  const toggle = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    if (next) dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: id }));
  };

  return (
    <motion.div
      ref={containerRef}
      className={`relative select-none ${className ?? ""}`}
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Width animates only for the moment of a tap. (A layout/FLIP animation fights the
          timeline's sideways transform, so plain width is the right tool here.) */}
      <motion.div
        initial={false}
        animate={{ width: isExpanded ? "min(86vw, 640px)" : "min(62vw, 360px)" }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
      >
      <motion.div
        className="relative overflow-hidden border border-white/15 bg-black"
        style={{ rotateX: springRotateX, rotateY: springRotateY, transformStyle: "preserve-3d" }}
      >
        <div className="relative aspect-video w-full">
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
          <AnimatePresence>
            {isExpanded && videoId && (
              <motion.iframe
                key="player"
                src={youtubeEmbed(videoId)}
                title={title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              />
            )}
          </AnimatePresence>
          {!isExpanded && (
            <button
              type="button"
              onClick={toggle}
              aria-label={`Play ${title}`}
              className="absolute inset-0 cursor-pointer bg-black/25 transition-colors hover:bg-black/10 focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-4 focus-visible:outline-white"
            />
          )}
        </div>
      </motion.div>
      </motion.div>

      <div className="mt-3 space-y-1">
        <button type="button" onClick={toggle} className="block text-left">
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
          animate={{ scaleX: isHovered || isExpanded ? 1 : 0.3 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}
