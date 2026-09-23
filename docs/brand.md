# DAYFOUR — Brand & Website Design System

> **Intro update (September 2026):** The intro no longer morphs the logo into a hero still with rain.
> New sequence: the 3D logo plays and changes angle → the camera zooms out to reveal the logo is a
> frame inside an editing app → the camera moves down onto the editing timeline → the timeline footage
> (fast and slow versions) becomes the hero, with the DɅYFOVR wordmark over it.
> The motion sections below that mention rain and the logo-to-image morph are superseded by this.

---

## BRAND FOUNDATION

**Studio:** DAYFOUR
**Handle:** @dayfour.studio
**Owner:** @god.kagari
**Category:** Production Company — Film, Commercial, Documentary
**Brand feeling:** You found something private.

---

## COLOR SYSTEM

```
--df-black:        #000000   — Primary background. Always black. Never near-black.
--df-white:        #FFFFFF   — Primary text and logo on black
--df-grey-dim:     #1A1A1A   — Subtle section dividers, card backgrounds
--df-grey-mid:     #3D3D3D   — Secondary text, metadata
--df-grey-light:   #8A8A8A   — Captions, timestamps, small labels
--df-accent:       #FFFFFF   — No color accent. White is the only contrast.
```

**Rule:** The site never uses color. Black and white only. Any image or video brings its own color — the UI never competes with it.

---

## TYPOGRAPHY

**Display / Hero:**
- Font: **Cormorant Garamond** — Thin or Light weight
- Use: DAYFOUR wordmark, section titles, large statements
- Tracking: +0.15em — wide, editorial, luxury
- Case: Mixed case preferred. Never all caps for long statements.

**Body / UI:**
- Font: **Inter** — Light (300) weight
- Use: All body copy, descriptions, navigation, labels
- Size: 14px base, 1.7 line height
- Max line length: 60 characters

**Accent / Label:**
- Font: **Cormorant Garamond** — Italic
- Use: Single line statements, the brand copy lines
- Sparingly. One use per section maximum.

**Type Scale:**
```
Hero display:    72-96px  Cormorant Garamond Thin
Section title:   36-48px  Cormorant Garamond Light
Subheading:      20-24px  Inter Light
Body:            14-16px  Inter Light
Caption/meta:    11-12px  Inter Light  #8A8A8A
```

---

## LOGO

**Primary mark:** The DAYFOUR geometric symbol (existing file)
**Wordmark:** DɅYFOVR — custom modified A and O characters
**Logo color:** White on black only. Never inverted.
**Clear space:** Minimum 40px on all sides
**Minimum size:** 32px height

**Logo animation:** 3D cinematic reveal — black to logo to black, ethereal sound build. Used as website intro only.

---

## WEBSITE STRUCTURE

### Intro Sequence
The 3D logo animation plays on load. 6 seconds. Seamless dissolve into the hero section. No skip button. The wait is intentional.

### Hero Section
Full bleed. Black and white film still or cinematic photograph. DAYFOUR wordmark in Cormorant Garamond Thin centered or left-aligned. Single line beneath — one of the brand statements. No buttons. No CTA. Just the world.

```
┌─────────────────────────────────────┐
│                                     │
│   [full bleed cinematic image]      │
│                                     │
│   DɅYFOVR                           │
│                                     │
│   We make things that stay with you │
│                                     │
│              ↓                      │
└─────────────────────────────────────┘
```

### Statement Section
Pure black background. White text only. Brand copy centered on screen. Wide tracking. Generous whitespace. Nothing else.

```
DɅYFOVR

We make things that stay with you
_________________________________

Not everything we make is seen.
Not everyone is meant to see it.
_________________________________

What we believe

We believe in restraint.
We believe mystery is not a
strategy, it is a standard.
We believe the work speaks
and the studio stays quiet.
_________________________________

Who we work with

Creatives. Brands. People with
a vision who need someone who
can see it too. Not everyone.
The right ones.
_________________________________

Film. Commercial. Documentary.
```

### Work Section
**OUR WORK** — left aligned, Cormorant Garamond, understated.

Videos displayed as a vertical scrollable film strip. Each piece is a tall card — full width on mobile, stacked. On desktop, slight overlap suggesting depth. When in focus: full opacity. When not: 40% opacity. One video in frame at a time.

Each video card has:
- The video (autoplay muted on hover/focus)
- Title — Cormorant Garamond Light
- Single line description — Inter Light, #8A8A8A
- Nothing else

```
┌─────────────────────────────────────┐
│  OUR WORK                           │
│                                     │
│  ┌───────────────────────────────┐  │
│  │   [VIDEO — full width]        │  │
│  │   KidSuper NYFW               │  │
│  │   Fashion. New York. 2026.    │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  [VIDEO — slightly dimmed]    │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Contact / Footer
Minimal. Black. Centered.

```
DɅYFOVR

@dayfour.studio
@god.kagari

By appointment.
```

No contact form. No email listed publicly. Inquiry through Instagram DM only. Private by design.

---

## DESIGN PRINCIPLES

1. **Black is the only background.** Never white, never grey, never gradient. Every section sits on black.
2. **Restraint over decoration.** If an element doesn't need to exist, it doesn't exist. No icons, no decorative shapes, no filler.
3. **Typography as the visual.** In sections without imagery the type IS the design. Wide tracking, generous whitespace, Cormorant Garamond doing the heavy lifting.
4. **Images and video are full bleed.** Never contained in rounded cards. Never with borders. They bleed to the edge.
5. **One thing moves at a time.** The logo animation on load. After that — scroll reveals only. No hover animations on every card. No floating elements. Stillness is the luxury signal.
6. **The scroll tells a story.** Intro → brand statement → belief → work. Someone who reads top to bottom understands Day Four before they see a single video.

---

## MOTION GUIDELINES

**The full sequence — everything is alive, nothing is ever fully static:**

**Act 1 — Intro:** 3D logo animation emerges from black. Ethereal sound builds. Logo holds.

**Act 1→2 — Transformation:** The logo does not fade or cut — it morphs and transforms directly into the hero image. The logo becomes the world. *(Superseded — see intro update at top.)*

**Act 2 — Hero lands:** The hero image is 3D and subtly animated — parallax breathing, slight movement, alive but not distracting. Rain begins falling over the image. DɅYFOVR text appears small over the image. *(Rain superseded — see intro update at top.)*

**Act 2 scroll behavior:** As the user scrolls:
- DɅYFOVR text slowly zooms in — scale increases proportionally to scroll
- Rain continues falling
- The hero image begins moving again — 3D animation pulling downward, transitioning the viewer toward the description section

**Act 3 — Description:** Text reveals line by line on scroll. The momentum from the hero carries in but the environment is still black. Stillness after movement.

**Act 4 — Work:** Horizontal scroll mechanic. Videos reveal as they hit center. Description text animates in letter by letter or word by word on scroll alongside each video.

**Rules:**
- The logo-to-image transformation is the single most important moment — it must feel seamless
- Rain fades out as the user fully enters the description section — it does not cut
- Everything else scrolls into stillness — the contrast between the living hero and the still description is intentional
- No hover animations on every element — motion is purposeful and rare outside the hero

---

## WHAT NOT TO DO

- No color accents
- No rounded corners on image cards
- No buttons with colored backgrounds
- No icons
- No ALL CAPS navigation
- No numbered sections (01 / 02 / 03)
- No gradient overlays on images
- No animated background elements
- No chatbot or contact widget
- No social media icon row in the footer

---

## VOICE ON THE WEBSITE

Every word on this site should feel like it cost something to say.

Short sentences. No adjectives that don't earn their place. No explaining what Day Four is — showing it. The work is the argument.

---

*This document governs all Day Four digital and brand decisions.*
*Updated: September 2026*
