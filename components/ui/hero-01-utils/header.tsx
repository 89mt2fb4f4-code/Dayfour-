"use client";

/*
 * Burger menu after 21st.dev "Agency Hero Section" (ShadcnSpace), built on the shadcn
 * Sheet. A round button fixed top-right opens a full-screen sheet: wordmark, large
 * section links (the current one marked with a dash), a "Let's Collaborate" pill,
 * and the studio's Instagram. Black and white.
 */
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export type NavigationSection = {
  title: string;
  /** Element id to scroll to; "top" scrolls to the start of the page. */
  href: string;
  /** Extra scroll past the element's top, in viewport heights (for sections that fade in). */
  offset?: number;
  isActive?: boolean;
};

export const INTRO_DONE_EVENT = "dayfour:intro-done";

function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Header({
  navigationData,
  collaborateHref,
  instagramHref,
}: {
  navigationData: NavigationSection[];
  collaborateHref: string;
  instagramHref: string;
}) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(navigationData.find((n) => n.isActive)?.href ?? navigationData[0]?.href);

  // Hidden during the logo intro, then fades in.
  useEffect(() => {
    const show = () => setVisible(true);
    addEventListener(INTRO_DONE_EVENT, show);
    return () => removeEventListener(INTRO_DONE_EVENT, show);
  }, []);

  // Mark the section currently in view.
  useEffect(() => {
    const onScroll = () => {
      const line = scrollY + innerHeight * 0.45;
      let current = navigationData[0]?.href;
      for (const item of navigationData) {
        if (item.href === "top") continue;
        const el = document.getElementById(item.href);
        if (!el) continue;
        const top = el.getBoundingClientRect().top + scrollY + (item.offset ?? 0) * innerHeight;
        if (top <= line) current = item.href;
      }
      setActive(current);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, [navigationData]);

  const go = (item: NavigationSection) => {
    setOpen(false);
    // Let the sheet close first, then glide to the section.
    setTimeout(() => {
      if (item.href === "top") return scrollTo({ top: 0, behavior: "smooth" });
      const el = document.getElementById(item.href);
      if (!el) return;
      const y = el.getBoundingClientRect().top + scrollY + (item.offset ?? 0) * innerHeight;
      scrollTo({ top: y, behavior: "smooth" });
    }, 320);
  };

  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] flex justify-end px-4 transition-opacity duration-1000"
      style={{ paddingTop: "calc(14px + env(safe-area-inset-top, 0px))", opacity: visible ? 1 : 0 }}
    >
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          aria-label="Open menu"
          className="pointer-events-auto flex size-12 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
          style={{ visibility: visible && !open ? "visible" : "hidden" }}
        >
          <Menu className="size-5" strokeWidth={1.5} />
        </SheetTrigger>

        <SheetContent
          side="right"
          hideClose
          overlayClassName="bg-black/20"
          className="flex h-full w-full flex-col border-none bg-black/35 shadow-none backdrop-blur-xl px-7 pb-[calc(32px+env(safe-area-inset-bottom,0px))] pt-[calc(22px+env(safe-area-inset-top,0px))] text-white sm:max-w-md"
        >
          <div className="flex items-center justify-between">
            <SheetTitle className="font-serif text-2xl font-light tracking-[0.15em] text-white">DɅYFOVR</SheetTitle>
            <SheetClose
              aria-label="Close menu"
              className="flex size-12 items-center justify-center rounded-full border border-white/15 transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-1 focus-visible:outline-white"
            >
              <X className="size-5" strokeWidth={1.5} />
            </SheetClose>
          </div>
          <SheetDescription className="sr-only">Sections of the site</SheetDescription>

          <nav className="mt-12 flex flex-col gap-3">
            {navigationData.map((item) => {
              const isActive = item.href === active;
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => go(item)}
                  aria-current={isActive ? "true" : undefined}
                  className={`flex items-center gap-3 text-left font-sans text-[2.6rem] font-medium leading-[1.1] tracking-[-0.03em] transition-colors ${
                    isActive ? "text-white" : "text-white/45 hover:text-white/80"
                  }`}
                >
                  {isActive && <span aria-hidden="true" className="h-[2px] w-7 bg-white" />}
                  {item.title}
                </button>
              );
            })}
          </nav>

          <a
            href={collaborateHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-12 inline-flex w-fit items-center gap-5 rounded-full bg-[#e6e6e6] py-1.5 pl-6 pr-1.5 font-sans text-base font-normal text-black transition-colors hover:bg-white"
          >
            Let&apos;s Collaborate
            <span className="flex size-10 items-center justify-center rounded-full bg-black text-white">
              <ArrowUpRight className="size-4" strokeWidth={1.8} />
            </span>
          </a>

          <div className="mt-auto flex flex-col gap-5">
            <a
              href={instagramHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="DAYFOUR on Instagram"
              className="flex size-12 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:bg-white/10"
            >
              <InstagramGlyph />
            </a>
            <p className="font-sans text-sm font-light text-white/50">© 2026 DɅYFOVR</p>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
