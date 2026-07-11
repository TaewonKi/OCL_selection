---
name: OCL Selection
description: Passport / boarding-pass identity for the Outside Classroom Learning trip-registration system
colors:
  ink: "#0e2a47"
  ink-soft: "#51617a"
  brass: "#b0832a"
  brass-soft: "#c9a24b"
  paper: "#fbfaf6"
  line: "#e6dfcd"
  board: "#0b1a2e"
  stamp: "#15736b"
  oxblood: "#94372b"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(3rem, 6vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Geist Mono, monospace"
    fontSize: "0.7rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.18em"
rounded:
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  3xl: "24px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.xl}"
    padding: "16px 24px"
  button-secondary:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "16px 24px"
  button-danger:
    backgroundColor: "{colors.oxblood}"
    textColor: "#ffffff"
    rounded: "{rounded.xl}"
    padding: "12px 24px"
  input-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "14px 16px"
  card:
    backgroundColor: "#ffffff"
    rounded: "{rounded.3xl}"
    padding: "32px"
---

# Design System: OCL Selection

## 1. Overview

**Creative North Star: "The Diplomatic Passport"**

Every screen behaves like a real travel document, not a web form: security-paper crosshatch under key data, ink stamps that press onto the page, torn ticket stubs with punched notches, and departure-board digits with a split-flap seam. Registering for a trip should feel like the moment a passport gets stamped at a real gate — official, deliberate, a little ceremonial — not like submitting a Google Form.

The system is crisp and precise rather than heavy: solid ink-filled primary actions, generous padding, understated borders. Confidence comes from restraint and correctness, not visual weight. Shadow is used as a light ambient cue for depth and hover feedback, never as a physical "paper lifted off the desk" effect — the physicality lives in the stamps, stubs, and security paper, not in drop shadows.

This system explicitly rejects generic SaaS blue/indigo, anything childish or cartoonish, and the dense enterprise-dashboard look for admin surfaces — the teacher portal earns the same passport-system care as the student-facing screens.

**Key Characteristics:**
- Passport/boarding-pass artifacts (stamps, stubs, security paper, departure boards) carry the identity, not decoration for its own sake
- Ink-dominant palette with brass as a rare, deliberate accent
- Monospace for every label, ID, count, and date — uppercase, letter-spaced, ledger-like
- Ambient shadow, never simulated physical elevation
- Official and precise over playful or bold

## 2. Colors

The palette reads as a real travel document: deep ink on warm paper, with brass as the only decorative accent and two semantic colors reserved strictly for state.

### Primary
- **Ink** (`#0e2a47`): The dominant color — body text, primary button fills, headers. Carries the weight and authority of the system.
- **Ink Soft** (`#51617a`): Secondary text, muted labels, de-emphasized copy. A washed-out step of Ink, never a separate hue.

### Secondary
- **Brass** (`#b0832a`): The single decorative accent — eyebrow labels, selected-state borders, foil-stamp details. Used sparingly; its rarity is what reads as "official," not saturation.
- **Brass Soft** (`#c9a24b`): Lighter step of Brass for highlighted fills and hover states on brass-accented elements.

### Tertiary
- **Board** (`#0b1a2e`): The near-black departure-board surface. Used for dark header bars and the departure-board component only — never as a general dark mode.

### Neutral
- **Paper** (`#fbfaf6`): The base background — warm off-white, the "page" every artifact sits on.
- **Line** (`#e6dfcd`): Borders, dividers, card outlines. A warm neutral, not a cool gray — keeps borders feeling like paper edges, not UI chrome.

### Status colors (semantic, not decorative)
- **Stamp** (`#15736b`): Success / open / available. Used exclusively for confirmed registrations, open quotas, and the "gate open" indicator.
- **Oxblood** (`#94372b`): Error / full / closed. Used exclusively for full quotas, validation errors, and destructive confirmations.

### Named Rules
**The Rare Brass Rule.** Brass appears on no more than one element per screen — a single eyebrow, a single selected border, a single stamp accent. It is a seal, not a theme color; if it starts filling backgrounds, it stops reading as official.

**The Status-Only Rule.** Stamp (green) and Oxblood (red) are never used decoratively. They exist only to report a real system state (open/full, success/error). Do not reach for them for emphasis or hierarchy.

## 3. Typography

**Display Font:** Fraunces (with Georgia, serif fallback)
**Body Font:** Geist (with system-ui, sans-serif fallback)
**Label/Mono Font:** Geist Mono (with monospace fallback)

**Character:** A serif/sans/mono trio pulling three distinct registers — Fraunces gives destination names and headlines the weight of an engraved title, Geist keeps body copy clean and legible, and Geist Mono renders every piece of "official data" (IDs, counts, dates, stamps) like a ledger entry or ticket printout.

### Hierarchy
- **Display** (600, `clamp(3rem, 6vw, 4.5rem)`, line-height 0.95, tracking -0.02em): Fraunces. Hero headlines and destination names only. Floats gently via `.title-float` on the homepage hero.
- **Headline** (600–700, 1.5–1.875rem): Fraunces or Geist depending on context — section titles, card headers on board/stamp bars.
- **Title** (600, 1rem–1.125rem): Geist. Card and modal titles, form section headers.
- **Body** (400, 1rem, line-height 1.5): Geist. Form labels, descriptions, general copy. Cap prose at 65–75ch.
- **Label** (700, 0.6–0.75rem, tracking 0.15–0.25em, uppercase): Geist Mono. Eyebrows, stamps, IDs, seat counts, dates, footer text — always uppercase, always letter-spaced.

### Named Rules
**The Mono-Is-Official Rule.** Any piece of data that functions as a record — a student ID, a seat count, a timestamp, a confirmation code — renders in Geist Mono, uppercase, letter-spaced. If it's a fact the system is attesting to, it's mono; if it's conversational copy, it's Geist.

## 4. Elevation

The system uses real `box-shadow` as a soft ambient cue for depth and interactive feedback — not as a physical "object resting on a surface" metaphor. Ticket-style cards carry a light `shadow-sm` at rest; modals and primary CTAs step up to `shadow-lg`/`shadow-xl`/`shadow-2xl` to signal focus or urgency. Physicality — the sense of a real, tactile document — comes from the stamp, stub, and security-paper treatments described in Components, not from shadow depth.

### Shadow Vocabulary
- **Resting card** (`box-shadow: 0 1px 2px rgba(0,0,0,0.05)` / Tailwind `shadow-sm`): Default state for ticket cards and list rows.
- **Elevated card** (Tailwind `shadow-xl`): Confirmed-registration tickets, active state cards.
- **Modal** (Tailwind `shadow-2xl`): Confirmation dialogs, blocking overlays.
- **Primary CTA** (Tailwind `shadow-lg`, `hover:shadow-xl`): The main register/confirm button — the one shadow step that responds to hover, reinforcing it's the primary action.

### Named Rules
**The Ambient-Not-Physical Rule.** Shadow signals focus and hierarchy, never weight or material. Don't reach for a heavier shadow to make something feel "more real" — that job belongs to the stamp/stub/security-paper vocabulary.

## 5. Components

Buttons, cards, and inputs stay crisp and precise: clean borders, generous internal padding, confident color fills, no unnecessary ornament. The passport identity lives in the signature components (stamps, stubs, security paper, departure board), not in the base primitives.

### Buttons
- **Shape:** `rounded-xl` (12px) for all standard buttons; `rounded-lg` (8px) reserved for the stamp component only.
- **Primary:** Ink fill (`bg-ink`), paper text, `font-semibold`, `py-4 px-6`, `shadow-lg` at rest stepping to `shadow-xl` on hover, `hover:bg-ink/90`, `active:scale-[0.99]` for tactile press feedback. Disabled: `bg-ink/15 text-ink/40`.
- **Secondary / Ghost:** White fill, `border border-ink/15`, ink text, `hover:bg-ink/5`. Same radius and padding as primary; distinguished by fill, not shape.
- **Danger:** Oxblood fill (`bg-oxblood`), white text, `hover:bg-oxblood/90` — reserved for destructive confirmations only (leaving a registered city, canceling).
- **Small / Utility:** `px-4 py-2`, Geist Mono, `text-xs`, `tracking-[0.15em]`, uppercase, `border border-ink/15`, `rounded-lg` — used for secondary navigation links (e.g. "back" actions), not primary flows.

### Cards / Tickets
- **Corner Style:** `rounded-3xl` (24px) for primary ticket/registration cards; `rounded-2xl` (16px) for nested data grids and secondary panels.
- **Background:** White for ticket bodies; `bg-paper` with `.bg-security` crosshatch for the data-grid panel inside a ticket.
- **Header bar:** A full-bleed `bg-board` (pending) or `bg-stamp` (confirmed) strip across the card top, paper-colored text — this is what tells a student which state their ticket is in before reading anything else.
- **Border:** `border border-line` (or `border-stamp/30` / `border-oxblood/20` when the card carries that status).
- **Shadow Strategy:** See Elevation — `shadow-sm` at rest, `shadow-xl` for the confirmed/active card.
- **Internal Padding:** `p-6` mobile, `p-8`–`p-10` desktop.

### Inputs / Fields
- **Style:** `bg-paper`, `border border-line`, `rounded-xl`, `px-4 py-3.5`. ID and numeric fields use `font-mono tabular-nums`; text fields use Geist.
- **Focus:** `focus:ring-2 focus:ring-ink/40`, `focus:border-transparent` — a soft ink glow, not a color change.
- **Disabled:** `opacity-50 cursor-not-allowed`. Placeholder text at `text-ink/30` — flagged for a contrast check against the 4.5:1 body-text minimum on `paper`.

### Signature Component: Ink Stamp
A rotated (`-7deg`), 2px `currentColor`-bordered badge (`rounded-lg`, 8px) in uppercase Geist Mono, `tracking-[0.18em]`, `font-weight: 700`, `font-size: 0.7rem`, with an 8%-opacity tint of its own color as background. Animates in with `.stamp-in` (`stamp-press`, 0.28s, scale 1.35→1 with an opacity ramp) — a physical "press" moment for confirmations. Respects `prefers-reduced-motion` (animation removed, stamp appears instantly).

### Signature Component: Ticket Stub
The `.stub` class renders a left-edge tear line via two `paper`-colored punched circles (14px, positioned at the card's top and bottom edge). Used on boarding-pass-style cards to reinforce the "real ticket" metaphor at the structural level, not just through color.

### Signature Component: Departure Board
`.board-sheen` adds a faint top-down gradient sheen to board-colored surfaces; `.flap` renders the horizontal split-flap seam across board digit tiles (used by the Countdown component). `.gate-pulse` slow-blinks a live "gate open" indicator dot (2s cycle, 100%→35%→100% opacity).

### Navigation
Minimal — small mono utility buttons (see Buttons: Small/Utility) for back/secondary actions; no persistent top nav chrome. Each page opens with a mono eyebrow label (`tracking-[0.25em]`, brass) establishing context before the Fraunces headline.

## 6. Do's and Don'ts

### Do:
- **Do** use Geist Mono, uppercase, letter-spaced for every ID, count, date, and stamp — this is the system's "official record" signal.
- **Do** treat the stamp, stub, and security-paper components as the primary carriers of the passport identity; reach for them before reaching for color or shadow.
- **Do** keep Brass to a single accent per screen (the Rare Brass Rule).
- **Do** use Stamp (green) and Oxblood (red) exclusively for real system state — open/full, success/error — never for decoration.
- **Do** keep the teacher portal and check view as considered and identity-consistent as the register flow — same tickets, same stamps, same care.
- **Do** provide a static/instant fallback for every animation (`.title-float`, `.gate-pulse`, `.stamp-in`) under `prefers-reduced-motion`.

### Don't:
- **Don't** use generic SaaS blue/indigo anywhere — that's the identity this system explicitly replaced.
- **Don't** go childish or cartoonish. This is a grown-up, official artifact, not a kids' app — no bright primary colors, no bouncy easing, no mascot-style illustration.
- **Don't** let the teacher/admin view collapse into a dense, gray enterprise-dashboard look. It gets the same ticket-and-stamp treatment as every other screen, not a data-grid fallback.
- **Don't** use shadow to simulate physical weight or "lifted paper." Shadow is an ambient focus cue; physicality comes from stamps, stubs, and security paper.
- **Don't** use `border-left`/`border-right` colored stripes as accents — not part of this system's vocabulary.
- **Don't** apply gradient text, glassmorphism, or hero-metric SaaS templates — none of these fit the passport metaphor.
