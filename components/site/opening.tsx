"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import GlyphPortal from "@/components/ui/glyph-portal";
import ExpandScene from "@/components/ui/scroll-expansion-hero";
import FootageWindow from "@/components/ui/davincho-hero";
import { getSound } from "@/lib/sound";

const WORD = "DɅYFOVR";
const PORTAL_FONT = '"Cormorant Garamond", Garamond, serif';
const smooth = (a: number, b: number, n: number) => {
  const t = Math.min(1, Math.max(0, (n - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export default function Opening() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    // The portal measures its own ink, so its face has to be loaded before it mounts.
    let settled = false;
    const done = () => { if (!settled) { settled = true; setFontReady(true); } };
    document.fonts.load(`700 100px ${PORTAL_FONT}`, WORD).then(done, done);
    const t = window.setTimeout(done, 3000);
    return () => clearTimeout(t);
  }, []);

  // Hand-off to the footage window: hide the pinned scene once it is full-bleed, and in any
  // case once the expansion has been scrolled past (a quick scroll can leave its eased
  // progress just short of the end, which would show the scene's edge over the next section).
  const sceneDone = useRef(false);
  const syncHandOff = useCallback(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap) return;
    const past = !!track && track.getBoundingClientRect().bottom <= window.innerHeight + 1;
    wrap.style.visibility = sceneDone.current || past ? "hidden" : "";
  }, []);
  useEffect(() => {
    addEventListener("scroll", syncHandOff, { passive: true });
    addEventListener("resize", syncHandOff);
    return () => {
      removeEventListener("scroll", syncHandOff);
      removeEventListener("resize", syncHandOff);
    };
  }, [syncHandOff]);

  // The word is solid white, and turns into the scene as the camera goes through the D.
  const onPortal = useCallback((p: number) => {
    wrapRef.current?.style.setProperty("--word-white", String(1 - smooth(0.06, 0.6, p)));
  }, []);

  return (
    <>
      <div
        ref={wrapRef}
        className="relative z-10 transition-opacity duration-1000"
        style={{ opacity: fontReady ? 1 : 0, "--word-white": 1 } as CSSProperties}
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
                  sceneDone.current = p >= 0.999 && target >= 0.999;
                  syncHandOff();
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
