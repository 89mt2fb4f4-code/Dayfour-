/**
 * Small "+" marks scattered across a section, like registration marks on a proof.
 * Positions come from a seed, so they are random-looking but identical on every
 * render (no hydration mismatch) and different per section.
 */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function Crosshairs({ seed, count = 7, className = "" }: { seed: number; count?: number; className?: string }) {
  const rand = rng(seed);
  const marks = Array.from({ length: count }, () => ({
    x: 6 + rand() * 88,
    y: 5 + rand() * 90,
    size: 7 + Math.round(rand() * 5),
    alpha: 0.22 + rand() * 0.38,
  }));
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      {marks.map((m, i) => (
        <span
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${m.x}%`, top: `${m.y}%`, width: m.size, height: m.size, opacity: m.alpha }}
        >
          <span className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white" />
          <span className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-white" />
        </span>
      ))}
    </div>
  );
}
