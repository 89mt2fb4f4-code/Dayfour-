"use client";

/*
 * Client work: the liquid glass carousel of client projects. Tapping the centred one
 * focuses it, then the detail view (Elegant Carousel) opens over the page with that
 * project's information and video. Projects come from the admin; until there are any,
 * temporary samples show (content/client-work.ts).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LiquidGlassCarousel, type LiquidGlassCarouselHandle } from "@/components/ui/liquid-glass-carousel";
import ElegantCarousel from "@/components/ui/elegant-carousel";
import { sampleClientProjects, type ClientProject } from "@/content/client-work";
import { fetchClientProjects } from "@/lib/cms";

function useClientProjects() {
  const [projects, setProjects] = useState<ClientProject[] | null>(null);
  useEffect(() => {
    let live = true;
    fetchClientProjects().then((cms) => {
      if (live) setProjects(cms?.length ? cms : sampleClientProjects);
    });
    return () => {
      live = false;
    };
  }, []);
  return projects;
}

/** Stops the page behind the detail view from scrolling while it is open. */
function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, [locked]);
}

export default function ClientWork() {
  const projects = useClientProjects();
  const sectionRef = useRef<HTMLElement>(null);
  const controlRef = useRef<LiquidGlassCarouselHandle | null>(null);
  const activeRef = useRef(0);
  const [near, setNear] = useState(false);
  const [detail, setDetail] = useState<number | null>(null);
  useScrollLock(detail !== null);

  // The WebGL carousel starts only when the section comes near, so nothing renders off screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "50% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const items = useMemo(() => projects?.map((p) => ({ src: p.poster, title: p.title, aspect: 16 / 9 })) ?? [], [projects]);

  const openTimer = useRef(0);
  const onFocusChange = useCallback((focused: boolean) => {
    clearTimeout(openTimer.current);
    // Let the focus animation play, then open the details.
    if (focused) openTimer.current = window.setTimeout(() => setDetail(activeRef.current), 650);
  }, []);
  useEffect(() => () => clearTimeout(openTimer.current), []);

  const close = useCallback(() => {
    setDetail(null);
    controlRef.current?.closeFocus();
  }, []);

  return (
    <section ref={sectionRef} id="client-work" aria-label="Client work" className="relative bg-black">
      <h2 className="px-6 font-serif text-[2rem] font-light leading-none text-white">Client work</h2>
      <div className="relative mt-2 h-[44svh] min-h-[340px] w-full md:h-[80svh]">
        {near && items.length > 0 && (
          <LiquidGlassCarousel
            items={items}
            entry={false}
            className="min-h-[340px]"
            controlRef={controlRef}
            onActiveChange={(i) => (activeRef.current = i)}
            onFocusChange={onFocusChange}
          />
        )}
      </div>

      {detail !== null &&
        projects &&
        createPortal(
          <div className="fixed inset-0 z-[90] overflow-y-auto overscroll-contain bg-black">
            <ElegantCarousel slides={projects} startIndex={detail} onClose={close} />
          </div>,
          document.body,
        )}
    </section>
  );
}
