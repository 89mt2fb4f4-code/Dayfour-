"use client";

/*
 * Adapted from 21st.dev "Let's work together".
 * Changes for DAYFOUR: the booking link opens the studio's Instagram DM, the status
 * dot is white, no calendar icon or email (private by design), serif headline.
 */
import type React from "react";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

interface LetsWorkTogetherProps {
  contactHref: string;
  contactLabel?: string;
  note?: string;
}

export function LetsWorkTogether({ contactHref, contactLabel = "Message us", note = "By appointment." }: LetsWorkTogetherProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setShowSuccess(true), 500);
  };

  return (
    <section id="contact" className="flex min-h-[100svh] items-center justify-center bg-black px-6">
      <div className="relative flex flex-col items-center gap-12">
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-8 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            opacity: showSuccess ? 1 : 0,
            transform: showSuccess ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
            pointerEvents: showSuccess ? "auto" : "none",
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <span
              className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground transition-all duration-500"
              style={{ transform: showSuccess ? "translateY(0)" : "translateY(10px)", opacity: showSuccess ? 1 : 0, transitionDelay: "100ms" }}
            >
              Good
            </span>
            <h3
              className="font-serif text-4xl font-light tracking-tight text-foreground transition-all duration-500"
              style={{ transform: showSuccess ? "translateY(0)" : "translateY(10px)", opacity: showSuccess ? 1 : 0, transitionDelay: "200ms" }}
            >
              Let&apos;s talk
            </h3>
          </div>

          <a
            href={contactHref}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            className="group relative flex items-center gap-4 transition-all duration-500"
            style={{
              transform: showSuccess ? (isButtonHovered ? "translateY(0) scale(1.02)" : "translateY(0) scale(1)") : "translateY(15px) scale(1)",
              opacity: showSuccess ? 1 : 0,
              transitionDelay: "150ms",
            }}
          >
            <div
              className="h-px w-8 bg-border transition-all duration-500 sm:w-12"
              style={{ transform: isButtonHovered ? "scaleX(0)" : "scaleX(1)", opacity: isButtonHovered ? 0 : 0.5 }}
            />
            <div
              className="relative flex items-center gap-3 overflow-hidden rounded-full border px-6 py-3 transition-all duration-500 sm:px-8 sm:py-4"
              style={{
                borderColor: isButtonHovered ? "var(--foreground)" : "var(--border)",
                backgroundColor: isButtonHovered ? "var(--foreground)" : "transparent",
              }}
            >
              <span
                className="text-sm font-medium tracking-wide transition-all duration-500 sm:text-base"
                style={{ color: isButtonHovered ? "var(--background)" : "var(--foreground)" }}
              >
                {contactLabel}
              </span>
              <ArrowUpRight
                className="size-4 transition-all duration-500 sm:size-5"
                strokeWidth={1.5}
                style={{
                  color: isButtonHovered ? "var(--background)" : "var(--foreground)",
                  transform: isButtonHovered ? "translate(3px, -3px) scale(1.1)" : "translate(0, 0) scale(1)",
                }}
              />
            </div>
            <div
              className="h-px w-8 bg-border transition-all duration-500 sm:w-12"
              style={{ transform: isButtonHovered ? "scaleX(0)" : "scaleX(1)", opacity: isButtonHovered ? 0 : 0.5 }}
            />
          </a>

          <span
            className="font-serif text-base italic text-muted-foreground transition-all duration-500"
            style={{ transform: showSuccess ? "translateY(0)" : "translateY(10px)", opacity: showSuccess ? 1 : 0, transitionDelay: "450ms" }}
          >
            {note}
          </span>
        </div>

        <div
          className="flex items-center gap-3 transition-all duration-500"
          style={{ opacity: isClicked ? 0 : 1, transform: isClicked ? "translateY(-20px)" : "translateY(0)", pointerEvents: isClicked ? "none" : "auto" }}
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-white" />
          </span>
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Available for projects</span>
        </div>

        <button
          type="button"
          className="group relative cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleClick}
          style={{ pointerEvents: isClicked ? "none" : "auto" }}
        >
          <div className="flex flex-col items-center gap-6">
            <h2
              className="relative text-center font-serif text-6xl font-light tracking-tight text-foreground transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] md:text-7xl lg:text-8xl"
              style={{ opacity: isClicked ? 0 : 1, transform: isClicked ? "translateY(-40px) scale(0.95)" : "translateY(0) scale(1)" }}
            >
              <span className="block overflow-hidden">
                <span
                  className="block transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ transform: isHovered && !isClicked ? "translateY(-8%)" : "translateY(0)" }}
                >
                  Let&apos;s work
                </span>
              </span>
              <span className="block overflow-hidden">
                <span
                  className="block italic transition-transform delay-75 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ transform: isHovered && !isClicked ? "translateY(-8%)" : "translateY(0)" }}
                >
                  <span className="text-muted-foreground">together</span>
                </span>
              </span>
            </h2>

            <div className="relative mt-4 flex size-16 items-center justify-center sm:size-20">
              <div
                className="pointer-events-none absolute inset-0 rounded-full border transition-all ease-out"
                style={{
                  borderColor: isClicked || isHovered ? "var(--foreground)" : "var(--border)",
                  backgroundColor: !isClicked && isHovered ? "var(--foreground)" : "transparent",
                  transform: isClicked ? "scale(3)" : isHovered ? "scale(1.1)" : "scale(1)",
                  opacity: isClicked ? 0 : 1,
                  transitionDuration: isClicked ? "700ms" : "500ms",
                }}
              />
              <ArrowUpRight
                className="size-6 transition-all ease-[cubic-bezier(0.16,1,0.3,1)] sm:size-7"
                style={{
                  transform: isClicked ? "translate(100px, -100px) scale(0.5)" : isHovered ? "translate(2px, -2px)" : "translate(0, 0)",
                  opacity: isClicked ? 0 : 1,
                  color: isHovered && !isClicked ? "var(--background)" : "var(--foreground)",
                  transitionDuration: isClicked ? "600ms" : "500ms",
                }}
              />
            </div>
          </div>

          <div className="absolute -left-8 top-1/2 -translate-y-1/2 sm:-left-16">
            <div
              className="h-px w-8 bg-border transition-all duration-500 sm:w-12"
              style={{
                transform: isClicked ? "scaleX(0) translateX(-20px)" : isHovered ? "scaleX(1.5)" : "scaleX(1)",
                opacity: isClicked ? 0 : isHovered ? 1 : 0.5,
              }}
            />
          </div>
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 sm:-right-16">
            <div
              className="h-px w-8 bg-border transition-all duration-500 sm:w-12"
              style={{
                transform: isClicked ? "scaleX(0) translateX(20px)" : isHovered ? "scaleX(1.5)" : "scaleX(1)",
                opacity: isClicked ? 0 : isHovered ? 1 : 0.5,
              }}
            />
          </div>
        </button>

        <div
          className="mt-8 flex flex-col items-center gap-4 text-center transition-all delay-100 duration-500"
          style={{ opacity: isClicked ? 0 : 1, transform: isClicked ? "translateY(20px)" : "translateY(0)", pointerEvents: isClicked ? "none" : "auto" }}
        >
          <p className="max-w-[32ch] text-sm leading-relaxed text-muted-foreground">
            Have a vision? Tell us about it. Not everyone. The right ones.
          </p>
        </div>
      </div>
    </section>
  );
}
