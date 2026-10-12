"use client";

/*
 * The full-screen project detail (Elegant Carousel) that both Client work and
 * DɅYFOVR Original open: number, title, line, description, credit and video.
 * The page behind stops scrolling while it is open.
 */
import { useEffect } from "react";
import { createPortal } from "react-dom";
import ElegantCarousel from "@/components/ui/elegant-carousel";
import type { ClientProject } from "@/content/client-work";

export default function ProjectDetail({
  projects,
  index,
  onClose,
}: {
  projects: ClientProject[];
  index: number | null;
  onClose: () => void;
}) {
  const open = index !== null;
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[90] overflow-y-auto overscroll-contain bg-black">
      <ElegantCarousel slides={projects} startIndex={index} onClose={onClose} />
    </div>,
    document.body,
  );
}
