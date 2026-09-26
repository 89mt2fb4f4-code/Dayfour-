"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import GlyphPortal from "@/components/ui/glyph-portal";
import ExpandScene from "@/components/ui/scroll-expansion-hero";
import FootageWindow from "@/components/ui/davincho-hero";
import { getSound } from "@/lib/sound";
import { INTRO_DONE_EVENT } from "@/components/ui/hero-01-utils/header";

const WORD = "DɅYFOVR";
const PORTAL_FONT = '"Cormorant Garamond", Garamond, serif';
const smooth = (a: number, b: number, n: number) => {
  const t = Math.min(1, Math.max(0, (n - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

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
        () => getSound().hit(),
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
      {/* Upright screens play the 9:16 render, which already fills a phone's width. Wide screens
          play the 16:9 render, whose logo sits in the middle ~29%, scaled up to fill the frame. */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 portrait:inset-0 portrait:translate-x-0 portrait:translate-y-0 landscape:aspect-video landscape:w-[min(317vw,177.8svh)]">
        <video data-logo-intro muted playsInline preload="auto" className="h-full w-full object-contain" style={{ opacity: still ? 0 : 1 }}>
          <source src="/assets/video/logo-v.mp4" type="video/mp4" media="(orientation: portrait)" />
          <source src="/assets/video/logo-v.webm" type="video/webm" media="(orientation: portrait)" />
          <source src="/assets/video/logo.mp4" type="video/mp4" />
          <source src="/assets/video/logo.webm" type="video/webm" />
        </video>
        <picture>
          <source srcSet="/assets/img/logo-end-v.jpg" media="(orientation: portrait)" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/img/logo-end.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-contain transition-opacity duration-[2000ms]"
            style={{ opacity: still ? 1 : 0 }}
          />
        </picture>
      </div>
    </div>
  );
}

export default function Opening() {
  const [introDone, setIntroDone] = useState(false);
  const [fontReady, setFontReady] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useScrollLock(!introDone);
  const endIntro = useCallback(() => {
    setIntroDone(true);
    dispatchEvent(new Event(INTRO_DONE_EVENT));
  }, []);

  useEffect(() => {
    // The portal measures its own ink, so its face has to be loaded before it mounts.
    let settled = false;
    const done = () => { if (!settled) { settled = true; setFontReady(true); } };
    document.fonts.load(`700 100px ${PORTAL_FONT}`, WORD).then(done, done);
    const t = window.setTimeout(done, 3000);
    return () => clearTimeout(t);
  }, []);

  // The word is solid white, and turns into the scene as the camera goes through the D.
  const onPortal = useCallback((p: number) => {
    wrapRef.current?.style.setProperty("--word-white", String(1 - smooth(0.06, 0.6, p)));
  }, []);

  return (
    <>
      <LogoIntro onDone={endIntro} />

      <div
        ref={wrapRef}
        className="relative z-10 transition-opacity delay-500 duration-[1600ms]"
        style={{ opacity: introDone ? 1 : 0, "--word-white": 1 } as CSSProperties}
      >
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
            onProgress={onPortal}
            background={
              <ExpandScene
                trackRef={trackRef}
                mediaSrc="/assets/video/timeline-slow.mp4"
                mediaSrcAlt="/assets/video/timeline-slow.webm"
                posterSrc="/assets/img/timeline-poster.jpg"
                portrait={{
                  mediaSrc: "/assets/video/timeline-slow-v.mp4",
                  mediaSrcAlt: "/assets/video/timeline-slow-v.webm",
                  posterSrc: "/assets/img/timeline-poster-v.jpg",
                }}
                bgImageSrc="/assets/img/intro-frame-bg.jpg"
                titleLines={["We don’t", "do normal"]}
                caption="Visual aesthetic"
                onProgress={(p, target) => {
                  getSound().rise(p);
                  // Full-bleed: hand over to the identical footage window underneath, so the
                  // footage never slides when the pinned scene lets go.
                  if (wrapRef.current) wrapRef.current.style.visibility = p >= 0.999 && target >= 0.999 ? "hidden" : "";
                }}
              />
            }
          >
            {/* Scroll room for the expansion, which plays while the portal stays pinned. */}
            <div ref={trackRef} className="h-[260svh]" />
          </GlyphPortal>
        ) : (
          <div className="h-[100svh]" />
        )}
      </div>

      {/* The footage keeps running while the next section slides over it. It sits under
          the end of the opening so the swap is invisible. */}
      <FootageWindow className="-mt-[calc(100svh+120px)]" />
    </>
  );
}
