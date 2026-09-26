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

Projects are added in the admin at **dayfour.studio/studio** (Sanity). Publishing there shows on
the site within about a minute, with no rebuild. Setup: create a free project at sanity.io/manage,
put its ID in `sanity/env.ts`, and add `https://dayfour.studio` (credentials allowed) under
API → CORS origins.

Projects can also live in code in `content/work.ts`; they show after the admin's.

## Assets

- `public/assets/video/`: logo render and slow timeline (24fps).
- `public/assets/frames/fast/`: 96 frames of the fast timeline, scrubbed by scroll.
- `public/fonts/`: self-hosted fonts. Cormorant Garamond and Anton have an added Ʌ glyph (a flipped V)
  so the wordmark sets in one face.
- `docs/brand.md`, `docs/references/`: brand rules and design references.

## Deploy

Hosted on Vercel (project `my-dayfour`), connected to this repo. The production branch is
`claude/21st-server-check-klhree`: every push to it goes live at dayfour.studio.
