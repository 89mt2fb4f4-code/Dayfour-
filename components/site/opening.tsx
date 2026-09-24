"use client";

import { useCallback, useEffect, useState } from "react";
import GlyphPortal from "@/components/ui/glyph-portal";
import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import { getSound } from "@/lib/sound";

const WORD = "DɅYFOVR";
const PORTAL_FONT = '"Cormorant Garamond", Garamond, serif';
const FAST_FRAMES = { count: 96, src: (i: number) => `/assets/frames/fast/${String(i).padStart(3, "0")}.jpg` };

/** Blocks scrolling while the logo plays. No skip: the wait is intentional. */
function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const root = document.documentElement;
    const prevent = (e: Event) => e.preventDefault();
    root.style.overflow = "hidden";
    addEventListener("wheel", prevent, { passive: false });
    addEventListener("touchmove", prevent, { passive: false });
    return () => {
      root.style.overflow = "";
      removeEventListener("wheel", prevent);
      removeEventListener("touchmove", prevent);
    };
  }, [locked]);
}

function LogoIntro({ onDone }: { onDone: () => void }) {
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const video = document.querySelector<HTMLVideoElement>("[data-logo-intro]")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let finished = false;
    const timers: number[] = [];
    const finish = () => {
      if (finished) return;
      finished = true;
      setFading(true);
      onDone();
      timers.push(window.setTimeout(() => setGone(true), 1400));
    };
    if (reduce) {
      setStill(true);
      timers.push(window.setTimeout(finish, 1200));
      return () => timers.forEach(clearTimeout);
    }
    const start = () => {
      video.play().then(
        () => getSound().swell(6),
        () => {
          // Autoplay refused (e.g. iOS low power mode): hold the final frame instead.
          setStill(true);
          timers.push(window.setTimeout(finish, 2500));
        },
      );
    };
    video.addEventListener("ended", finish, { once: true });
    if (video.readyState >= 3) start();
    else {
      video.addEventListener("canplaythrough", start, { once: true });
      timers.push(window.setTimeout(start, 4000));
    }
    timers.push(window.setTimeout(finish, 12000)); // never hang on a stalled video
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  if (gone) return null;
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-50 overflow-hidden bg-black transition-opacity duration-[1200ms] ease-out"
      style={{ opacity: fading ? 0 : 1 }}
    >
      {/* The logo sits in the middle ~29% of the 16:9 render; scale it to fill a phone's width. */}
      <div className="absolute left-1/2 top-1/2 aspect-video -translate-x-1/2 -translate-y-1/2" style={{ width: "min(317vw, 177.8svh)" }}>
        <video data-logo-intro muted playsInline preload="auto" className="h-full w-full" style={{ opacity: still ? 0 : 1 }}>
          <source src="/assets/video/logo.mp4" type="video/mp4" />
          <source src="/assets/video/logo.webm" type="video/webm" />
        </video>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/img/logo-end.jpg"
          alt=""
          className="absolute inset-0 h-full w-full transition-opacity duration-[2000ms]"
          style={{ opacity: still ? 1 : 0 }}
        />
      </div>
    </div>
  );
}

export default function Opening() {
  const [introDone, setIntroDone] = useState(false);
  const [fontReady, setFontReady] = useState(false);
  useScrollLock(!introDone);
  const endIntro = useCallback(() => setIntroDone(true), []);

  useEffect(() => {
    // The portal measures its own ink, so its face has to be loaded before it mounts.
    let settled = false;
    const done = () => { if (!settled) { settled = true; setFontReady(true); } };
    document.fonts.load(`700 100px ${PORTAL_FONT}`, WORD).then(done, done);
    const t = window.setTimeout(done, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <LogoIntro onDone={endIntro} />

      <div className="transition-opacity delay-500 duration-[1600ms]" style={{ opacity: introDone ? 1 : 0 }}>
        {fontReady ? (
          <GlyphPortal
            word={WORD}
            focusChar="D"
            interactive={false}
            fontFamily={PORTAL_FONT}
            fontWeight={700}
            scrollLength={2.6}
            className="dayfour-portal"
            style={{ "--gp-paper": "#000", "--gp-ink": "#fff", "--gp-field": "#000", "--gp-foreground": "#fff" }}
            background={
              <video
                src="/assets/video/timeline-slow.mp4"
                poster="/assets/img/timeline-poster.jpg"
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  transform: "scale(var(--gp-field-scale,1))",
                  // Brighter while it is only a word on black; normal once the camera is inside.
                  filter: "brightness(calc(1 + 1.6 * var(--gp-caption, 1))) contrast(1.05)",
                }}
              />
            }
          >
            <div />
          </GlyphPortal>
        ) : (
          <div className="h-[100svh]" />
        )}
      </div>

      <ScrollExpandMedia
        mediaSrc="/assets/video/timeline-slow.mp4"
        mediaSrcAlt="/assets/video/timeline-slow.webm"
        posterSrc="/assets/img/timeline-poster.jpg"
        bgImageSrc="/assets/img/intro-frame-bg.png"
        titleLines={["We don’t", "do normal"]}
        frames={FAST_FRAMES}
        onProgress={(p) => getSound().rise(p)}
      />
    </>
  );
}
