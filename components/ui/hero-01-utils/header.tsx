"use client";

/*
 * Burger menu after 21st.dev "Agency Hero Section" (ShadcnSpace), built on the shadcn
 * Sheet. A round button fixed top-right opens a full-screen sheet: wordmark, large
 * section links (the current one marked with a dash), a "Let's Collaborate" pill,
 * and the studio's Instagram. Black and white.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export type NavigationSection = {
  title: string;
  /** A page path ("/about"), a section id on the home page, or "top" for its start. */
  href: string;
  /** Extra scroll past the element's top, in viewport heights (for sections that fade in). */
  offset?: number;
  isActive?: boolean;
};

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
  currentPage,
}: {
  navigationData: NavigationSection[];
  collaborateHref: string;
  instagramHref: string;
  /** Set on pages other than home: marks that page's link and sends section links home. */
  currentPage?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(currentPage ?? navigationData.find((n) => n.isActive)?.href ?? navigationData[0]?.href);

  const scrollToSection = (item: NavigationSection, behavior: ScrollBehavior) => {
    if (item.href === "top") return scrollTo({ top: 0, behavior });
    const el = document.getElementById(item.href);
    if (!el) return;
    const y = el.getBoundingClientRect().top + scrollY + (item.offset ?? 0) * innerHeight;
    scrollTo({ top: y, behavior });
  };

  // Arriving on home from another page with a section link (/#work): go there once the
  // opening has settled its height.
  useEffect(() => {
    if (currentPage) return;
    const id = decodeURIComponent(location.hash.slice(1));
    const item = id && navigationData.find((n) => n.href === id);
    if (!item) return;
    const t = window.setTimeout(() => scrollToSection(item, "auto"), 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mark the section currently in view.
  useEffect(() => {
    if (currentPage) return;
    const onScroll = () => {
      const line = scrollY + innerHeight * 0.45;
      let current = navigationData[0]?.href;
      for (const item of navigationData) {
        if (item.href === "top" || item.href.startsWith("/")) continue;
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
  }, [navigationData, currentPage]);

  const go = (item: NavigationSection) => {
    setOpen(false);
    if (item.href === currentPage) return;
    // Let the sheet close first, then move.
    setTimeout(() => {
      if (item.href.startsWith("/")) return router.push(item.href);
      if (currentPage) return router.push(item.href === "top" ? "/" : `/#${item.href}`);
      scrollToSection(item, "smooth");
    }, 320);
  };

  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] flex justify-end px-4"
      style={{ paddingTop: "calc(14px + env(safe-area-inset-top, 0px))" }}
    >
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          aria-label="Open menu"
          className="pointer-events-auto flex size-12 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
          style={{ visibility: open ? "hidden" : "visible" }}
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
