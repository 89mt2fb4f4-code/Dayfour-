"use client";

import Timeline from "@/components/ui/timeline";
import { WorkCard } from "@/components/ui/expand-map";
import { useEffect, useState } from "react";
import { projects as localProjects, type Project } from "@/content/work";
import { fetchCmsProjects } from "@/lib/cms";
import { youtubeId } from "@/lib/youtube";
import Crosshairs from "@/components/ui/crosshairs";

/** Shown while there is no work to list. Type after the angled "Coming soon" screen reference. */
function ComingSoon() {
  const hud = "font-hud text-[9px] font-medium uppercase leading-[1.35] tracking-[0.08em] text-white/55";
  return (
    <section id="work" aria-label="Our work, coming soon" className="relative flex h-[100svh] items-center justify-center overflow-hidden bg-black">
      <Crosshairs seed={51} count={7} />
      <p className="absolute left-6 top-[calc(24px+env(safe-area-inset-top,0px))] font-serif text-xl font-light tracking-[0.08em] text-white/80">
        Our work
      </p>

      <div className="relative" style={{ perspective: "900px" }}>
        <div className="relative px-6 py-10" style={{ transform: "rotateY(-16deg) rotateX(5deg) rotateZ(-2deg)" }}>
          <div className={`absolute -top-2 left-0 ${hud}`}>
            <p>DF-004 / SEQ 01</p>
            <p>00:00:15:23 — 00:03:13:35</p>
          </div>
          <div className={`absolute -left-1 top-[34%] flex items-center gap-2 ${hud}`}>
            <p className="text-right">IN EDIT<br />NOT FOR VIEW</p>
            <span className="border border-white/50 px-1 py-px text-white/70">004</span>
          </div>

          <h2 className="font-hud text-[21vw] font-semibold uppercase leading-[0.86] tracking-[-0.01em] text-[#c9c9c9] md:text-[9rem]">
            Coming
            <br />
            <span className="relative">
              Soon
              <span aria-hidden="true" className="absolute -right-[0.02em] top-[62%] ml-2 translate-x-full font-hud text-[0.28em] tracking-[0.06em] text-[#c9c9c9]">
                //////
              </span>
            </span>
          </h2>

          <div className={`absolute right-2 top-[20%] text-right ${hud}`}>
            <p>01 DF-M-YP02</p>
            <p>155 5 1878 s</p>
          </div>
          <div className={`mt-3 flex items-center gap-2 ${hud}`}>
            <span className="border border-white/50 px-1 py-px text-white/70">R26</span>
            <p>01 NN-GHT88<br />88 D8</p>
          </div>
        </div>
      </div>

      {/* Viewfinder corners and a slate marker, low in the frame. */}
      <div aria-hidden="true" className="absolute bottom-[12svh] left-[22vw] h-[16svh] w-[30vw]">
        <span className="absolute left-0 top-0 h-2 w-2 border-l border-t border-white/60" />
        <span className="absolute right-0 top-0 h-2 w-2 border-r border-t border-white/60" />
        <span className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-white/60" />
        <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-white/60" />
      </div>
      <div aria-hidden="true" className={`absolute bottom-[16svh] right-[10vw] flex items-start gap-2 ${hud}`}>
        <svg width="26" height="30" viewBox="0 0 26 30" className="text-white/60">
          <rect x="0.5" y="0.5" width="25" height="29" fill="none" stroke="currentColor" />
          <line x1="0.5" y1="0.5" x2="25.5" y2="29.5" stroke="currentColor" />
        </svg>
        <p>A-78 <span className="text-[7px]">V-5</span><br />88 A<br />01 SW-M-YP02</p>
      </div>
    </section>
  );
}

/** Admin projects first, then the ones in content/work.ts that aren't already there. */
function useProjects() {
  const [projects, setProjects] = useState<Project[]>(localProjects);
  useEffect(() => {
    let live = true;
    fetchCmsProjects().then((cms) => {
      if (!live || !cms) return;
      const seen = new Set(cms.map((p) => youtubeId(p.youtubeUrl)));
      setProjects([...cms, ...localProjects.filter((p) => !seen.has(youtubeId(p.youtubeUrl)))]);
    });
    return () => {
      live = false;
    };
  }, []);
  return projects;
}

export default function Work() {
  const projects = useProjects();
  if (!projects.length) return <ComingSoon />;
  return (
    <Timeline
      title="Our work"
      lead={
        <div className="flex h-full w-full items-end bg-df-grey-dim p-6">
          <p className="font-serif text-2xl font-light italic text-white/80">The work is the argument.</p>
        </div>
      }
      items={projects.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.meta ?? "",
        media: <WorkCard id={p.id} title={p.title} meta={p.meta} youtubeUrl={p.youtubeUrl} cover={p.cover} />,
      }))}
    />
  );
}
