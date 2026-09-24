"use client";

/*
 * Adapted from 21st.dev "Scroll media expansion hero" (arunachalam).
 * Changes for DAYFOUR:
 *  - Driven by normal page scroll (sticky), not by hijacking wheel/touch events,
 *    so it hands off cleanly from the section above and to the one below.
 *  - The media is a slow looping video that gives way to a frame sequence
 *    scrubbed by the scroll (the fast timeline), so speed builds as it expands.
 *  - Square corners, white type, ends full-bleed.
 */
import { useEffect, useRef, type ReactNode } from "react";

interface FrameSequence {
  count: number;
  src: (index: number) => string;
}

interface ScrollExpandMediaProps {
  mediaSrc: string;
  mediaSrcAlt?: string;
  posterSrc?: string;
  bgImageSrc: string;
  /** Two lines that slide apart as the media expands. */
  titleLines?: [string, string];
  frames?: FrameSequence;
  textBlend?: boolean;
  onProgress?: (progress: number) => void;
  children?: ReactNode;
}

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const smooth = (a: number, b: number, n: number) => {
  const t = clamp((n - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export default function ScrollExpandMedia({
  mediaSrc,
  mediaSrcAlt,
  posterSrc,
  bgImageSrc,
  titleLines,
  frames,
  textBlend,
  onProgress,
  children,
}: ScrollExpandMediaProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const leftRef = useRef<HTMLHeadingElement>(null);
  const rightRef = useRef<HTMLHeadingElement>(null);
  const progressRef = useRef(onProgress);
  progressRef.current = onProgress;

  useEffect(() => {
    const section = sectionRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    const images: HTMLImageElement[] = [];
    let raf = 0;
    let lastFrame = -1;
    let lastP = -1;

    const load = () => {
      if (!frames || images.length) return;
      for (let i = 0; i < frames.count; i++) {
        const img = new Image();
        img.decoding = "async";
        img.src = frames.src(i);
        images.push(img);
      }
    };

    const drawFrame = (p: number) => {
      if (!frames || !ctx) return;
      let i = Math.round(smooth(0.06, 1, p) * (frames.count - 1));
      while (i > 0 && !(images[i]?.complete && images[i].naturalWidth)) i--;
      const img = images[i];
      if (!img?.naturalWidth || i === lastFrame) return;
      lastFrame = i;
      if (canvas.width !== img.naturalWidth) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
      }
      ctx.drawImage(img, 0, 0);
    };

    const render = () => {
      raf = 0;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const rect = section.getBoundingClientRect();
      // The expansion runs over the pinned stretch; any extra height is for children.
      const pinned = section.querySelector<HTMLElement>("[data-sem-track]")!.offsetHeight - vh;
      const p = clamp(-rect.top / Math.max(1, pinned));
      const mobile = vw < 768;

      const startW = Math.min(300, vw * 0.78);
      const startH = Math.min(400, vh * 0.52);
      const e = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
      boxRef.current!.style.width = `${startW + (vw - startW) * e}px`;
      boxRef.current!.style.height = `${startH + (vh - startH) * e}px`;
      bgRef.current!.style.opacity = String(1 - p);
      shadeRef.current!.style.opacity = String(0.5 - p * 0.3);

      const shift = p * (mobile ? 180 : 150);
      const fade = String(1 - smooth(0.55, 0.85, p));
      leftRef.current!.style.transform = `translateX(-${shift}vw)`;
      rightRef.current!.style.transform = `translateX(${shift}vw)`;
      leftRef.current!.style.opacity = fade;
      rightRef.current!.style.opacity = fade;

      canvas.style.opacity = String(smooth(0.03, 0.14, p));
      drawFrame(p);

      if (p !== lastP) {
        lastP = p;
        progressRef.current?.(p);
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    const near = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          load();
          void videoRef.current?.play().catch(() => {});
        } else {
          videoRef.current?.pause();
        }
      },
      { rootMargin: "150% 0px" },
    );
    near.observe(section);
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    render();
    return () => {
      cancelAnimationFrame(raf);
      near.disconnect();
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
    };
  }, [frames]);

  return (
    <section ref={sectionRef} className="relative">
      <div data-sem-track className="relative h-[280svh]">
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
          <div ref={bgRef} className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bgImageSrc} alt="" className="h-full w-full object-cover object-center" />
            <div className="absolute inset-0 bg-black/10" />
          </div>

          <div
            ref={boxRef}
            className="absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
            style={{ width: 300, height: 400, boxShadow: "0px 0px 50px rgba(0, 0, 0, 0.3)" }}
          >
            <video
              ref={videoRef}
              poster={posterSrc}
              muted
              loop
              playsInline
              preload="auto"
              className="absolute inset-0 h-full w-full object-cover"
              disablePictureInPicture
              disableRemotePlayback
            >
              <source src={mediaSrc} type="video/mp4" />
              {mediaSrcAlt && <source src={mediaSrcAlt} type="video/webm" />}
            </video>
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover opacity-0" />
            <div ref={shadeRef} className="absolute inset-0 bg-black/30" />
          </div>

          {titleLines && (
            <div
              className={`relative z-10 flex h-full w-full flex-col items-center justify-center gap-2 text-center ${
                textBlend ? "mix-blend-difference" : ""
              }`}
            >
              <h2 ref={leftRef} className="font-serif text-5xl font-light tracking-[0.06em] text-white will-change-transform md:text-6xl lg:text-7xl">
                {titleLines[0]}
              </h2>
              <h2 ref={rightRef} className="font-serif text-5xl font-light italic tracking-[0.06em] text-white will-change-transform md:text-6xl lg:text-7xl">
                {titleLines[1]}
              </h2>
            </div>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}
