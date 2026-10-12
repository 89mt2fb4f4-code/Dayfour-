"use client";

/*
 * 21st.dev "Elegant Carousel", used as the client-work detail view: it opens on the
 * project tapped in the glass carousel and shows its number, title, client line and
 * description beside the poster, with arrows and labelled tabs for the others.
 * Changes for DAYFOUR:
 *  - Slides come in as props (client projects); the 16:9 poster plays the project's
 *    YouTube video in place when tapped.
 *  - No auto-advance: the visitor opened this project to read about it.
 *  - Black and white; the colour accents and decorative frame corners are left out.
 *  - The stylesheet (not included with the component) is elegant-carousel.css.
 */
import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import { X, Play } from "lucide-react";
import type { ClientProject } from "@/content/client-work";
import { youtubeEmbed, youtubeId } from "@/lib/youtube";
import "./elegant-carousel.css";

const TRANSITION_DURATION = 800;

export default function ElegantCarousel({
  slides,
  startIndex = 0,
  onClose,
}: {
  slides: ClientProject[];
  startIndex?: number;
  onClose?: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [playing, setPlaying] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const goToSlide = useCallback(
    (index: number, dir?: "next" | "prev") => {
      if (isTransitioning || index === currentIndex) return;
      setDirection(dir || (index > currentIndex ? "next" : "prev"));
      setIsTransitioning(true);
      setPlaying(false);
      setTimeout(() => {
        setCurrentIndex(index);
        setTimeout(() => setIsTransitioning(false), 50);
      }, TRANSITION_DURATION / 2);
    },
    [isTransitioning, currentIndex],
  );

  const goNext = useCallback(() => goToSlide((currentIndex + 1) % slides.length, "next"), [currentIndex, goToSlide, slides.length]);
  const goPrev = useCallback(
    () => goToSlide((currentIndex - 1 + slides.length) % slides.length, "prev"),
    [currentIndex, goToSlide, slides.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") onClose?.();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [goNext, goPrev, onClose]);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = touchStartX.current;
  };
  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (playing) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 60) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const slide = slides[currentIndex];
  if (!slide) return null;
  const videoId = youtubeId(slide.youtubeUrl);
  const state = isTransitioning ? `transitioning ${direction}` : "visible";

  return (
    <div
      className="carousel-wrapper"
      role="dialog"
      aria-modal="true"
      aria-label={slide.title}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {onClose && (
        <button type="button" onClick={onClose} className="carousel-close" aria-label="Close">
          <X className="size-5" strokeWidth={1.5} />
        </button>
      )}

      <div className="carousel-inner">
        <div className="carousel-content">
          <div className="carousel-content-inner">
            <div className={`carousel-collection-num ${state}`}>
              <span className="carousel-num-text">
                {String(currentIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </span>
            </div>
            <h2 className={`carousel-title ${state}`}>{slide.title}</h2>
            {slide.subtitle && <p className={`carousel-subtitle ${state}`}>{slide.subtitle}</p>}
            {slide.description && <p className={`carousel-description ${state}`}>{slide.description}</p>}
            {slide.instagram && (
              <a
                href={`https://www.instagram.com/${slide.instagram}/`}
                target="_blank"
                rel="noopener noreferrer"
                className={`carousel-credit ${state}`}
              >
                @{slide.instagram}
              </a>
            )}

            {slides.length > 1 && (
              <div className="carousel-nav-arrows">
                <button onClick={goPrev} className="carousel-arrow-btn" aria-label="Previous project">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
                <button onClick={goNext} className="carousel-arrow-btn" aria-label="Next project">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="carousel-image-container">
          <div className={`carousel-image-frame ${state}`}>
            {playing && videoId ? (
              <iframe
                src={youtubeEmbed(videoId)}
                title={slide.title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="carousel-video"
              />
            ) : (
              <button type="button" className="carousel-poster" onClick={() => setPlaying(true)} aria-label={`Play ${slide.title}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.poster}
                  alt=""
                  className="carousel-image"
                  // Reuses the carousel's (CORS) copy of the poster; YouTube stills load plainly.
                  crossOrigin={slide.poster.includes("ytimg.com") ? undefined : "anonymous"}
                />
                <span className="carousel-play">
                  <Play className="size-5 translate-x-px" strokeWidth={1.5} fill="currentColor" />
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="carousel-progress-bar">
          {slides.map((s, index) => (
            <button
              key={s.id}
              onClick={() => goToSlide(index)}
              className={`carousel-progress-item ${index === currentIndex ? "active" : ""}`}
              aria-label={`Go to ${s.title}`}
              aria-current={index === currentIndex ? "true" : undefined}
            >
              <div className="carousel-progress-track">
                <div className="carousel-progress-fill" style={{ width: index === currentIndex ? "100%" : "0%" }} />
              </div>
              <span className="carousel-progress-label">{s.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
