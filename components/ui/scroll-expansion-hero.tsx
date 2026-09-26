"use client";

/*
 * Adapted from 21st.dev "Scroll media expansion hero" (arunachalam).
 * Changes for DAYFOUR:
 *  - It is a scene, not a section: it lives inside the Glyph Portal's letter, so the
 *    zoom through the D lands straight on this frame. It reads its progress from a
 *    scroll track element (`trackRef`) instead of hijacking wheel/touch events.
 *  - The box holds the slow timeline while still; the scroll scrubs the fast
 *    timeline frames as it expands. Once full-bleed, the fast footage keeps running.
 *  - Square corners, white type, ends full-bleed.
 */
import { useEffect, useRef, useState, type RefObject } from "react";
import { drawFrame, frameAt, loadFastFrames, loopIndex, scrubIndex, setLooping } from "@/lib/fast-frames";
import { getSound } from "@/lib/sound";
import Crosshairs from "@/components/ui/crosshairs";

interface ExpandSceneProps {
  trackRef: RefObject<HTMLElement | null>;
  mediaSrc: string;
  mediaSrcAlt?: string;
  posterSrc?: string;
  /** Upright (9:16) versions, used when the screen is taller than it is wide. */
  portrait?: { mediaSrc: string; mediaSrcAlt?: string; posterSrc?: string };
  bgImageSrc: string;
  /** Two lines that slide apart as the media expands. */
  titleLines?: [string, string];
  /** Small red caption beside the title. */
  caption?: string;
  /** Eased progress, and the raw scroll position it is gliding toward. */
  onProgress?: (progress: number, target: number) => void;
}

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const smooth = (a: number, b: number, n: number) => {
  const t = clamp((n - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export default function ExpandScene({ trackRef, mediaSrc, mediaSrcAlt, posterSrc, portrait, bgImageSrc, titleLines, caption, onProgress }: ExpandSceneProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const leftRef = useRef<HTMLHeadingElement>(null);
  const rightRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const progressRef = useRef(onProgress);
  progressRef.current = onProgress;
  // Only mounts in the browser (after the portal's font loads), so this is read once, on the client.
  const [upright] = useState(() => typeof window !== "undefined" && matchMedia("(orientation: portrait)").matches);

  useEffect(() => {
    const canvas = canvasRef.current!;
    let raf = 0;
    let lastP = -1;
    let lastFrame = -1;
    let visible = true;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    loadFastFrames();

    let shown = -1; // eased progress that glides after the scroll target

    const paint = () => {
      raf = 0;
      const track = trackRef.current;
      if (!track || !visible) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const rect = track.getBoundingClientRect();
      const target = clamp(-rect.top / Math.max(1, rect.height - vh));
      shown = shown < 0 || reduce ? target : shown + (target - shown) * 0.14;
      if (Math.abs(target - shown) < 0.0004) shown = target;
      const p = shown;
      const mobile = vw < 768;

      const startW = Math.min(300, vw * 0.78);
      const startH = Math.min(400, vh * 0.52);
      rootRef.current!.style.setProperty("--bx", `${startW / 2}px`);
      const e = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
      boxRef.current!.style.width = `${startW + (vw - startW) * e}px`;
      boxRef.current!.style.height = `${startH + (vh - startH) * e}px`;
      // Davincho-style parallax inside the box: the footage drifts up and settles
      // exactly as the box reaches full-bleed.
      mediaRef.current!.style.transform = `translate3d(0, ${(1 - e) * 5}%, 0) scale(${1 + (1 - e) * 0.12})`;
      bgRef.current!.style.opacity = String(1 - p);
      shadeRef.current!.style.opacity = String(0.4 - p * 0.3);

      if (leftRef.current && rightRef.current) {
        const shift = p * (mobile ? 180 : 150);
        const fade = String(1 - smooth(0.55, 0.85, p));
        leftRef.current.style.transform = `translate3d(-${shift}vw, 0, 0)`;
        rightRef.current.style.transform = `translate3d(${shift}vw, 0, 0)`;
        leftRef.current.style.opacity = fade;
        rightRef.current.style.opacity = fade;
        const gridFade = String(1 - smooth(0.05, 0.35, p));
        if (gridRef.current) gridRef.current.style.opacity = gridFade;
        if (captionRef.current) captionRef.current.style.opacity = gridFade;
      }

      // Slow video while still; the fast frames take over with the first stretch of scroll.
      canvas.style.opacity = String(smooth(0.02, 0.1, p));
      const done = p >= 0.995;
      setLooping(done);
      // The slow-timeline hum plays while the scene is up, and lets go once it is full-bleed.
      getSound().scene(!done);
      const index = done ? loopIndex() : scrubIndex(smooth(0.04, 1, p));
      const img = frameAt(index);
      if (img && index !== lastFrame) {
        lastFrame = index;
        drawFrame(canvas, img);
      }

      if (p !== lastP) {
        lastP = p;
        progressRef.current?.(p, target);
      }
      // Keep going while easing toward the target, and keep the footage moving once full-bleed.
      if (done || shown !== target) raf = requestAnimationFrame(paint);
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };

    const measure = new ResizeObserver(() => {
      const t = titleRef.current;
      if (!t) return;
      rootRef.current!.style.setProperty("--gx", `${t.offsetWidth / 2}px`);
      rootRef.current!.style.setProperty("--gy", `${t.offsetHeight / 2}px`);
    });
    if (titleRef.current) measure.observe(titleRef.current);

    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) getSound().scene(false);
      if (visible) {
        void videoRef.current?.play().catch(() => {});
        schedule();
      } else {
        videoRef.current?.pause();
      }
    });
    seen.observe(rootRef.current!);
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(raf);
      seen.disconnect();
      measure.disconnect();
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
    };
  }, [trackRef]);

  return (
    <div ref={rootRef} className="absolute inset-0 overflow-hidden bg-black">
      <div ref={bgRef} className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bgImageSrc} alt="" className="h-full w-full object-cover object-center" />
      </div>

      {/* Grid lines around the title, behind the video box, with dots where they cross.
          --gy is half the title block's height (measured below); --bx is half the box's
          starting width, so the vertical rails and their dots sit just outside the box. */}
      {titleLines && (
        <div ref={gridRef} aria-hidden="true" className="pointer-events-none absolute inset-0">
          {["calc(50% - var(--gy, 48px))", "calc(50% + var(--gy, 48px))"].map((top) => (
            <span key={top} className="absolute inset-x-0 h-px bg-white/25" style={{ top }} />
          ))}
          {["calc(50% - var(--bx, 150px) - 34px)", "calc(50% - var(--bx, 150px) - 14px)", "calc(50% + var(--bx, 150px) + 14px)"].map(
            (left) => (
              <span key={left} className="absolute inset-y-0 w-px bg-white/25" style={{ left }} />
            ),
          )}
          {["calc(50% - var(--gy, 48px))", "calc(50% + var(--gy, 48px))"].flatMap((top) =>
            ["calc(50% - var(--bx, 150px) - 34px)", "calc(50% - var(--bx, 150px) - 14px)", "calc(50% + var(--bx, 150px) + 14px)"].map(
              (left) => (
                <span
                  key={top + left}
                  className="absolute size-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                  style={{ top, left }}
                />
              ),
            ),
          )}
        </div>
      )}
      <Crosshairs seed={11} count={8} />

      <div
        ref={boxRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
        style={{ width: 300, height: 400, boxShadow: "0px 0px 50px rgba(0, 0, 0, 0.3)", contain: "strict" }}
      >
        <div ref={mediaRef} className="absolute inset-0 will-change-transform">
        <video
          ref={videoRef}
          poster={upright && portrait?.posterSrc ? portrait.posterSrc : posterSrc}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
          disablePictureInPicture
          disableRemotePlayback
        >
          {portrait && <source src={portrait.mediaSrc} type="video/mp4" media="(orientation: portrait)" />}
          {portrait?.mediaSrcAlt && <source src={portrait.mediaSrcAlt} type="video/webm" media="(orientation: portrait)" />}
          <source src={mediaSrc} type="video/mp4" />
          {mediaSrcAlt && <source src={mediaSrcAlt} type="video/webm" />}
        </video>
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover opacity-0" />
        </div>
        <div ref={shadeRef} className="absolute inset-0 bg-black/30" />
      </div>

      {titleLines && (
        <div className="absolute inset-0 flex items-center justify-center text-center">
          {/* Poster-style title: tight grotesk, registered mark, thin grid lines (after the
              Nocturna reference), with a small red caption (after the Murakami reference). */}
          <div ref={titleRef} className="relative px-3 py-2">
            {caption && (
              <p
                ref={captionRef}
                className="absolute -top-6 right-0 text-right font-mono text-[9px] uppercase leading-[1.2] tracking-[0.02em] text-[#e0352b]"
              >
                {caption}
              </p>
            )}
            <h2
              ref={leftRef}
              className="font-sans text-[2.5rem] font-medium leading-[0.95] tracking-[-0.055em] text-[#e9e9e6] will-change-transform md:text-6xl"
            >
              {titleLines[0]}
            </h2>
            <h2
              ref={rightRef}
              className="font-sans text-[2.5rem] font-medium leading-[0.95] tracking-[-0.055em] text-[#e9e9e6] will-change-transform md:text-6xl"
            >
              {titleLines[1]}
              <sup className="ml-0.5 align-super text-[0.38em] font-normal tracking-normal">®</sup>
            </h2>
          </div>
        </div>
      )}

      {/* Solid white while the scene is only seen through the letters; fades as the camera enters. */}
      <div className="pointer-events-none absolute inset-0 bg-white" style={{ opacity: "var(--word-white, 0)" }} />
    </div>
  );
}
