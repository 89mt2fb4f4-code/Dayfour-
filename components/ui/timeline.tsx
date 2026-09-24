// Built using Hyperiux Vault: https://vault.hyperiux.com
// Adapted for DAYFOUR: items are projects passed in as props (alternating above and
// below the line), each hosting its own media; white line and dots; square corners.
"use client";

import { type CSSProperties, type ReactNode, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

/* Inline stand-in for @gsap/react's useGSAP. One gsap.context lives for the
   component's lifetime; the callback is re-added when dependencies change. */
function useGSAP(
  callback: () => void | (() => void),
  options?: { dependencies?: unknown[]; scope?: { current: Element | null } | Element | null },
) {
  const deps = options?.dependencies ?? [];
  const scope = options?.scope;
  const ctxRef = useRef<gsap.Context | null>(null);
  const cleanupRef = useRef<(() => void) | undefined>(undefined);

  useLayoutEffect(() => {
    const el = scope && typeof scope === "object" && "current" in scope ? scope.current : (scope as Element | null);
    ctxRef.current = gsap.context(() => {}, el ?? undefined);
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = undefined;
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (!ctxRef.current) return;
    cleanupRef.current?.();
    const ret = ctxRef.current.add(callback);
    cleanupRef.current = typeof ret === "function" ? ret : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export type TimelineItem = {
  id: string;
  title: string;
  content: string;
  media?: ReactNode;
};

type SplitTextInstance = InstanceType<typeof SplitText>;

export type TimelineProps = {
  items: TimelineItem[];
  title?: string;
  periodLabel?: string;
  lead?: ReactNode;
  textColor?: string;
  mutedTextColor?: string;
  activeColor?: string;
  backgroundColor?: string;
  duration?: number;
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeToReducedMotion = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
};
const usePrefersReducedMotion = () =>
  useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia?.(REDUCED_MOTION_QUERY)?.matches ?? false,
    () => false,
  );

const cls = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, "-");

export default function Timeline({
  items,
  title = "Our work",
  periodLabel,
  lead,
  textColor = "#ffffff",
  mutedTextColor = "#8a8a8a",
  activeColor = "#ffffff",
  backgroundColor = "#000000",
  duration = 1.4,
}: TimelineProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wholeSliderRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const normalizedDuration = Math.max(0.2, duration);
  const top = items.filter((_, i) => i % 2 === 0);
  const bottom = items.filter((_, i) => i % 2 === 1);
  const count = Math.max(1, items.length);
  const activeStyle: CSSProperties = { backgroundColor: activeColor };
  const mutedTextStyle: CSSProperties = { color: mutedTextColor };

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const isMobile = window.innerWidth < 600;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top top", end: isMobile ? "82% 50%" : "92% bottom", scrub: true },
        defaults: { ease: "none" },
      });
      tl.fromTo(wholeSliderRef.current, { xPercent: 0 }, { xPercent: isMobile ? -(100 - 100 / (1 + count * 0.55)) : -65 });

      const lineWidth = isMobile ? "65%" : "98%";
      if (reducedMotion) {
        gsap.set(".journey-line", { width: lineWidth });
        return;
      }
      gsap.to(".journey-line", {
        width: lineWidth,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: isMobile ? "top 30%" : "top 25%",
          end: isMobile ? "80% 50%" : "92% bottom",
          scrub: true,
        },
      });
    },
    { dependencies: [reducedMotion, count], scope: sectionRef },
  );

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      if (reducedMotion) {
        items.forEach((item) => {
          const k = cls(item.id);
          gsap.set(`.jl-${k}`, { scaleY: 1 });
          gsap.set(`.jd-${k}`, { scale: 1 });
        });
        return;
      }

      const splits: SplitTextInstance[] = [];
      const isMobile = window.innerWidth < 600;
      // Spread each item's reveal evenly along the scroll.
      const span = isMobile ? [22, 79] : [6, 85];
      const step = (span[1] - span[0] - 10) / Math.max(1, items.length - 1);

      items.forEach((item, index) => {
        const k = cls(item.id);
        const isTop = index % 2 === 0;
        gsap.set(`.jl-${k}`, { scaleY: 0, transformOrigin: isTop ? "bottom bottom" : "top top" });
        gsap.set(`.jd-${k}`, { scale: 0 });

        const startPos = span[0] + step * index;
        const tl = gsap
          .timeline({ scrollTrigger: { trigger: section, start: `${startPos}% 30%`, end: `${startPos + 10}% 50%`, scrub: true } })
          .to(`.jl-${k}`, { scaleY: 1, duration: normalizedDuration * 0.4 })
          .to(`.jd-${k}`, { scale: 1, duration: normalizedDuration * 0.4 }, "<");

        const media = section.querySelector(`.media-${k}`);
        if (media) tl.fromTo(media, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: normalizedDuration }, "<");

        // Text items reveal line by line from behind a mask.
        [section.querySelector(`.title-${k}`), section.querySelector(`.description-${k}`)].forEach((el, i) => {
          if (!el) return;
          const split = new SplitText(el, { type: "lines", mask: "lines" });
          splits.push(split);
          tl.fromTo(split.lines, { y: 100 }, { y: 0, duration: normalizedDuration, stagger: 0.02, ease: "power2.out" }, i ? "<" : "<0.1");
        });
      });

      const handleResize = () => ScrollTrigger.refresh();
      window.addEventListener("resize", handleResize);
      return () => {
        splits.forEach((s) => s.revert());
        window.removeEventListener("resize", handleResize);
      };
    },
    { dependencies: [normalizedDuration, reducedMotion, items], scope: sectionRef },
  );

  const itemBody = (item: TimelineItem, alignBottom: boolean) => {
    const k = cls(item.id);
    return (
      <div className={`flex h-full w-full flex-col space-y-[1vw] ${alignBottom ? "justify-end" : ""}`}>
        {item.media && <div className={`media-${k} mb-[2vw] max-[600px]:mb-[4vw]`}>{item.media}</div>}
        {!item.media && (
          <>
            <h4 className={`title-${k} font-serif text-[2.5vw] font-light leading-none max-[600px]:text-[6.4vw]`}>{item.title}</h4>
            <p className={`description-${k} w-[90%] text-[1.5vw] leading-[1.15] max-[600px]:text-[4.2vw]`} style={mutedTextStyle}>
              {item.content}
            </p>
          </>
        )}
      </div>
    );
  };

  return (
    <section
      ref={sectionRef}
      id="work"
      className="relative w-full"
      style={{ color: textColor, backgroundColor, height: `max(200vw, ${120 + count * 70}vh)` }}
    >
      <div className="sticky top-0 h-[100svh] w-screen overflow-hidden pt-[10%] max-[600px]:pt-[12svh]">
        <div
          ref={wholeSliderRef}
          className="flex h-[30vw] items-center gap-[5vw] px-[5vw] max-[600px]:h-[76svh] max-[600px]:px-[7vw]"
          style={{ width: `${100 + count * 55}vw` }}
        >
          <div className="h-full w-[30vw] shrink-0 overflow-hidden max-[600px]:h-[65vw] max-[600px]:w-[85vw]">{lead}</div>

          <div className="relative h-full w-full">
            <div className="absolute left-0 top-[49%] flex h-fit w-full items-center">
              <div className="size-[.8vw] rounded-full max-[600px]:size-[2vw]" style={activeStyle} />
              <div className="journey-line h-px w-[0%]" style={activeStyle} />
              <div className="size-[.8vw] rounded-full max-[600px]:size-[2vw]" style={activeStyle} />
            </div>

            <div className="flex h-1/2 w-full items-center justify-start gap-[.5vw]">
              <div className="h-full w-[20%] shrink-0 pt-[2vw] max-[600px]:h-fit max-[600px]:pt-[5vw]">
                <h2 className="w-[65%] font-serif text-[3vw] font-light leading-[0.95] max-[600px]:text-[8.5vw]">{title}</h2>
              </div>
              <div className="flex h-full w-full gap-x-[15vw] max-[600px]:gap-x-[30vw]">
                {top.map((item) => (
                  <div key={item.id} className="relative h-full w-[30vw] shrink-0 px-[3vw] max-[600px]:w-[70vw] max-[600px]:px-[7vw]">
                    <div className="absolute bottom-0 left-0 top-0 h-full w-full">
                      <div className={`jd-${cls(item.id)} relative aspect-square size-[1vw] -translate-x-1/2 rounded-full max-[600px]:size-[2.5vw]`} style={activeStyle} />
                      <div className={`jl-${cls(item.id)} h-[94%] w-px origin-bottom`} style={activeStyle} />
                    </div>
                    <div className="mt-[-1vw] h-full max-[600px]:mt-[-2vw]">{itemBody(item, false)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex h-1/2 w-full items-center justify-start">
              <div className="h-full w-[34%] shrink-0 pt-[2vw] max-[600px]:w-[30%] max-[600px]:pt-[5vw]">
                {periodLabel && (
                  <p className="text-[1.65vw] leading-none max-[600px]:text-[4.2vw]" style={mutedTextStyle}>
                    {periodLabel}
                  </p>
                )}
              </div>
              <div className="ml-[7vw] flex h-full w-full gap-x-[20vw] max-[600px]:gap-x-[30vw]">
                {bottom.map((item) => (
                  <div key={item.id} className="relative h-full w-[25vw] shrink-0 px-[3vw] max-[600px]:w-[70vw] max-[600px]:px-[7vw]">
                    <div className="absolute bottom-[-1%] left-0 h-full w-full">
                      <div className={`jl-${cls(item.id)} h-[94%] w-px origin-top max-[600px]:h-full`} style={activeStyle} />
                      <div className={`jd-${cls(item.id)} relative aspect-square size-[1vw] -translate-x-1/2 rounded-full max-[600px]:size-[2.5vw]`} style={activeStyle} />
                    </div>
                    {itemBody(item, true)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
