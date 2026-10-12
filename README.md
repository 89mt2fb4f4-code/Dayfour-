# DAYFOUR

The studio site. Next.js + Tailwind, built phone-first, exported as a static site.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static site in out/
```

## Page order

Home (`app/page.tsx`):

1. **Opening** (`components/site/opening.tsx`): DɅYFOVR as a Glyph Portal into the slow timeline,
   then the scroll expansion ("We don't / do normal") that scrubs the fast timeline.
2. **What we make** (`components/site/disciplines.tsx`): "Short. Commercial. Documentary.", fading in
   over the running footage.
3. **Client work** (`components/site/client-work.tsx`): the liquid glass carousel (WebGL, three.js).
   Tapping the centred project opens the detail view (`components/ui/elegant-carousel.tsx`) with its
   information and video. Shows temporary samples until client work is added in the admin.
4. **DɅYFOVR Original** (`components/site/work.tsx`): the horizontal timeline with tap-to-play
   YouTube cards ("Coming soon" while there are no projects).
5. **Let's work**: the metallic button opens the studio's Instagram DM (`lib/links.ts`).

**About** is its own page (`app/about/page.tsx`): four chapters on black, reached from the menu.

Sound (`lib/sound.ts`) is only the timeline's own audio: it loops from the opening, quickens with
the expansion, then fades out. It starts on the visitor's first tap (browsers require one).

## Adding work

Projects are added in the admin at **dayfour.studio/studio** (Sanity), under **Client work** or
**DɅYFOVR Original**. Publishing there shows on
the site within about a minute, with no rebuild. Setup: create a free project at sanity.io/manage,
put its ID in `sanity/env.ts`, and add `https://www.dayfour.studio` and `https://dayfour.studio` (credentials allowed) under
API → CORS origins.

Projects can also live in code in `content/work.ts`; they show after the admin's.

## Assets

- `public/assets/video/`: logo render and slow timeline (24fps). `-v` files are the 9:16 versions,
  used on upright screens (phones); the others are 16:9, used on wide screens.
- `public/assets/frames/fast/` (16:9) and `fast-v/` (9:16): 96 frames of the fast timeline, scrubbed by scroll.
- `public/fonts/`: self-hosted fonts. Cormorant Garamond and Anton have an added Ʌ glyph (a flipped V)
  so the wordmark sets in one face.
- `docs/brand.md`, `docs/references/`: brand rules and design references.

## Deploy

Hosted on Vercel (project `my-dayfour`), connected to this repo. The production branch is
`claude/21st-server-check-klhree`: every push to it goes live at www.dayfour.studio (dayfour.studio redirects there).
