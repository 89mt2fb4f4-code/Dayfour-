"use client";

/*
 * Client work: the liquid glass carousel of client projects. Tapping the centred one
 * focuses it, then the detail view (Elegant Carousel) opens over the page with that
 * project's information and video. Projects come from the admin and content/client-work.ts;
 * until there are any, temporary samples show.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LiquidGlassCarousel, type LiquidGlassCarouselHandle } from "@/components/ui/liquid-glass-carousel";
import ProjectDetail from "@/components/site/project-detail";
import { clientProjects, sampleClientProjects, type ClientProject } from "@/content/client-work";
import { youtubeId } from "@/lib/youtube";
import { fetchClientProjects } from "@/lib/cms";

function useClientProjects() {
  const [projects, setProjects] = useState<ClientProject[] | null>(null);
  useEffect(() => {
    let live = true;
    fetchClientProjects().then((cms) => {
      if (!live) return;
      // Admin projects first, then the ones in code that aren't already in the admin.
      const seen = new Set((cms ?? []).map((p) => youtubeId(p.youtubeUrl)));
      const all = [...(cms ?? []), ...clientProjects.filter((p) => !seen.has(youtubeId(p.youtubeUrl)))];
      setProjects(all.length ? all : sampleClientProjects);
    });
    return () => {
      live = false;
    };
  }, []);
  return projects;
}

export default function ClientWork() {
  const projects = useClientProjects();
  const sectionRef = useRef<HTMLElement>(null);
  const controlRef = useRef<LiquidGlassCarouselHandle | null>(null);
  const activeRef = useRef(0);
  const [near, setNear] = useState(false);
  const [detail, setDetail] = useState<number | null>(null);

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

      {projects && <ProjectDetail projects={projects} index={detail} onClose={close} />}
    </section>
  );
}
