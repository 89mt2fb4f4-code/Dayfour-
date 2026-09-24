# DAYFOUR

The studio site. Next.js + Tailwind, built phone-first, exported as a static site.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static site in out/
```

## Page order

1. **Opening** (`components/site/opening.tsx`): logo render, then DɅYFOVR as a Glyph Portal into the
   slow timeline, then the scroll expansion ("We don't / do normal") that scrubs the fast timeline.
2. **About** (`components/site/about.tsx`): four chapters in the EVOLVE poster style.
3. **Work** (`components/site/work.tsx`): "Coming soon" until projects exist, then the horizontal
   timeline with tap-to-play YouTube cards.
4. **Let's work** and the **footer** with the metallic button. Both open the studio's Instagram DM
   (`lib/links.ts`).

Sound is synthesized in `lib/sound.ts` and starts on the visitor's first tap (browsers require one).

## Adding work

Until the Sanity admin is connected, add projects to `content/work.ts`:

```ts
export const projects: Project[] = [
  { id: "kidsuper-nyfw", title: "KidSuper NYFW", meta: "Fashion. New York. 2026.",
    youtubeUrl: "https://youtu.be/VIDEO_ID" },
];
```

## Assets

- `public/assets/video/`: logo render and slow timeline (24fps).
- `public/assets/frames/fast/`: 96 frames of the fast timeline, scrubbed by scroll.
- `public/fonts/`: self-hosted fonts. Cormorant Garamond and Anton have an added Ʌ glyph (a flipped V)
  so the wordmark sets in one face.
- `docs/brand.md`, `docs/references/`: brand rules and design references.
