"use client";

/*
 * The fast timeline, as 96 frames: 9:16 on upright screens (fast-v), 16:9 on wide ones (fast). Loaded once and shared, so the expanding
 * scene and the window below it draw the very same frame at the same moment.
 */
const COUNT = 96;
const LOOP_FROM = 72; // the blurred, full-speed tail that keeps running after the expansion
const FPS = 24;

let images: HTMLImageElement[] = [];

export function loadFastFrames() {
  if (images.length || typeof window === "undefined") return images;
  const dir = matchMedia("(orientation: portrait)").matches ? "fast-v" : "fast";
  images = Array.from({ length: COUNT }, (_, i) => {
    const img = new Image();
    img.decoding = "async";
    img.src = `/assets/frames/${dir}/${String(i).padStart(3, "0")}.webp`;
    return img;
  });
  return images;
}

/** Nearest loaded frame at or before `index`, so a slow connection never shows a gap. */
export function frameAt(index: number) {
  let i = Math.max(0, Math.min(COUNT - 1, Math.round(index)));
  while (i > 0 && !(images[i]?.complete && images[i].naturalWidth)) i--;
  const img = images[i];
  return img?.naturalWidth ? img : null;
}

/** Scroll-scrubbed frame: 0..1 maps onto the whole sequence. */
export const scrubIndex = (p: number) => p * (COUNT - 1);

let loopStart: number | null = null;

/** Starts (or stops) the free-running loop; both views share one clock so they stay in sync. */
export function setLooping(on: boolean) {
  if (on && loopStart === null) loopStart = performance.now();
  if (!on) loopStart = null;
}

/** Free-running frame once the expansion is done: ping-pongs the fast tail from the last frame. */
export function loopIndex(now = performance.now()) {
  const span = COUNT - 1 - LOOP_FROM;
  const f = Math.floor(((now - (loopStart ?? now)) / 1000) * FPS) % (span * 2);
  return COUNT - 1 - (f < span ? f : span * 2 - f);
}

export function drawFrame(canvas: HTMLCanvasElement, img: HTMLImageElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  if (canvas.width !== img.naturalWidth) {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
  }
  ctx.drawImage(img, 0, 0);
}
