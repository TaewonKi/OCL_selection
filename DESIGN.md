---
name: OCL Selection
description: Passport / boarding-pass registration system for an Outside Classroom Learning trip
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
    fontSize: "clamp(3rem, 7vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist Mono, monospace"
    fontSize: "0.7rem"
    fontWeight: 700
    letterSpacing: "0.18em"
    fontFeature: "uppercase"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
spacing:
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "16px 24px"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
  button-primary-disabled:
    backgroundColor: "{colors.ink}"
  button-secondary:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "16px 24px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "14px 16px"
  stamp:
    backgroundColor: "transparent"
    textColor: "{colors.stamp}"
    rounded: "{rounded.sm}"
    padding: "5px 10px"
---

# Design System: OCL Selection

## 1. Overview

**Creative North Star: "The Departure Gate"**

OCL Selection treats a school trip sign-up as a real travel document, not a form. Every screen borrows the vocabulary of an actual departure gate: boarding-pass stubs with punched notches, foil stamps pressed at a jaunty angle, a split-flap departure board, security-paper crosshatching under the value fields that matter most. The system is formal-institutional in structure — navy ink, brass foil, dashed tear-lines — but the tone underneath is adventurous: this is the moment a student claims a real seat to a real place, and the interface should make that feel official and exciting at once.

It explicitly rejects the generic SaaS blue/indigo dashboard look this project shipped with originally, and it rejects anything childish or cartoonish — no bubble shapes, no mascot illustration, no playful bounce. The teacher portal earns the same passport-system craft as the student-facing register flow; it does not fall back to a dense enterprise data-grid just because it's an admin view.

**Key Characteristics:**
- Navy ink + brass foil + paper, not blue-and-white SaaS
- Boarding-pass and departure-board metaphors carried literally into component shape (stubs, stamps, split-flap seams)
- Geist Mono for every label, eyebrow, ID, seat count, and date — always uppercase, always letter-spaced
- Flat-to-lifted-on-demand: cards sit nearly flat, elevation appears only around a modal or an active selection

## 2. Colors

A navy-and-paper base with a single warm brass accent and two status inks (teal for open/success, oxblood for full/error) — restrained, not decorative.

### Primary
- **Ink** (#0e2a47): the dominant surface color for headers, primary buttons, and body text. Carries the authority of the system — it is the color of the passport cover and the departure board.

### Secondary
- **Brass** (#b0832a) / **Brass Soft** (#c9a24b): the foil accent — eyebrow labels, selected-state borders, stamp ink on neutral content. Used sparingly, the way real foil stamping is sparing.

### Tertiary
- **Stamp Teal** (#15736b): success / open / available state — a city with room left, a confirmed registration.
- **Oxblood** (#94372b): error / full / closed state — a city at quota, a validation failure.

### Neutral
- **Paper** (#fbfaf6): the base background, warm off-white standing in for aged document stock.
- **Line** (#e6dfcd): borders, dividers, the dashed tear-line on ticket stubs.
- **Ink Soft** (#51617a): secondary text, helper copy, inactive labels.
- **Board** (#0b1a2e): the departure-board surface itself — near-black navy, used behind light text as a header band.

### Named Rules
**The Foil Rule.** Brass appears only as an accent — eyebrows, selected borders, stamp ink — never as a body background or a dominant surface. Its rarity is what makes it read as foil rather than paint.

**The Status-Ink Rule.** Stamp teal and oxblood are reserved exclusively for open/success and full/error states. Never used decoratively; a colored stamp always means something specific happened.

## 3. Typography

**Display Font:** Fraunces (with Georgia, serif fallback)
**Body Font:** Geist (with system-ui, sans-serif fallback)
**Label/Mono Font:** Geist Mono (with monospace fallback)

**Character:** A serif/sans/mono trio pairing on the contrast axis — Fraunces brings warmth and editorial weight to destination names and headlines, Geist keeps body copy quiet and legible, and Geist Mono renders every piece of "official" data (IDs, counts, dates, stamps) with the clipped, ledger-like precision of a manifest.

### Hierarchy
- **Display** (600, `clamp(3rem, 7vw, 4.5rem)`, line-height 0.95, tracking -0.02em): Fraunces. Hero headline only — "Register", destination names in the boarding pass hero.
- **Headline** (600, 1.5–1.875rem, line-height 1.1): Fraunces. Section titles, ticket headers on the boarding-pass card.
- **Title** (600, 1.125–1.25rem, line-height 1.3): Geist. Card headers, form section labels.
- **Body** (400, 1rem, line-height 1.5, max 65–75ch): Geist. Form copy, descriptions, confirmation text.
- **Label** (700, 0.6–0.7rem, letter-spacing 0.15–0.25em, uppercase): Geist Mono. Every eyebrow, stamp, seat count, student ID, and footer credit in the system.

### Named Rules
**The All-Mono-Labels Rule.** Any text acting as a label, ID, count, date, or eyebrow renders in Geist Mono, uppercase, letter-spaced ≥0.15em — no exceptions, even for a single inline number.

## 4. Elevation

Mostly flat with lifted moments reserved for focal content. Ticket-style cards (`shadow-xl`, `shadow-2xl`) carry real elevation because they represent the physical object — a boarding pass, a modal document — being handed to the user; everything else (inputs, secondary cards, status bars) sits at `shadow-sm` or flat with a border doing the separating work instead.

### Shadow Vocabulary
- **Ambient** (`shadow-sm`): default card and status-bar elevation — a light lift, not a floating object.
- **Document** (`shadow-xl` / `shadow-2xl`): boarding-pass and confirmation cards, modals — the "physical ticket" moments.
- **Interactive lift** (`shadow-lg` → `hover:shadow-xl`): primary submit buttons gain elevation on hover, reinforcing that the action is about to produce a physical-feeling result.

### Named Rules
**The Physical-Object Rule.** Elevation scales with how much an element represents a real, held document. A form field is flat; a boarding pass is not.

## 5. Components

### Buttons
- **Shape:** rounded-xl (12px) as the default; rounded-lg (8px) for compact secondary actions.
- **Primary:** ink background, paper text, `py-4 px-6`, `font-semibold`, `shadow-lg` lifting to `shadow-xl` on hover, `active:scale-[0.99]` for tactile press feedback. Disabled drops to `ink/15` background with `ink/40` text.
- **Secondary / Ghost:** white or transparent background, `border border-ink/15`, `hover:bg-ink/5`. Used for "back", "cancel", and non-committal actions.
- **Danger:** oxblood background/border variant for destructive or blocked-quota confirmations.

### Stamp (signature component)
Foil/ink stamp: `border: 2px solid currentColor`, `rounded-lg`, uppercase Geist Mono at 0.7rem with 0.18em tracking, rotated -7deg, background tinted 8% of the current color. Entrance uses `stamp-press` (scale down from 1.35 with a quick ease, 0.28s) — never used without a `prefers-reduced-motion` fallback to an instant, unscaled appearance.

### Cards / Containers
- **Corner Style:** rounded-2xl (16px) for content panels, rounded-3xl (24px) for hero ticket/boarding-pass cards.
- **Background:** white or paper, occasionally `bg-security` crosshatch for the "important value" fields (quota counts, confirmation blocks).
- **Shadow Strategy:** see Elevation — document-tier cards get `shadow-xl`; supporting cards get `shadow-sm` or none.
- **Border:** `border border-line` as the default separator; status-tinted borders (`border-stamp/30`, `border-oxblood/20`, `border-brass/40`) when the card represents a specific state.
- **Internal Padding:** `p-6` mobile, up to `p-10` desktop for hero cards.

### Inputs / Fields
- **Style:** paper background, `border border-line`, `rounded-xl`, `px-4 py-3.5`. Numeric/ID fields use `font-mono tabular-nums`.
- **Focus:** `focus:ring-2 focus:ring-ink/40` plus `focus:border-transparent` — a soft ink halo, not a color change.
- **Disabled:** `opacity-50`, `cursor-not-allowed`.

### Navigation / Status Bars
- Board-style header bands (`bg-board` or status color, `text-paper`) cap ticket cards, echoing a departure-board display strip. `.gate-pulse` marks a live/active indicator dot with a slow 2s opacity blink (disabled under reduced motion).

### The Boarding Pass (signature component)
A ticket card with a `.stub` perforation (dashed left edge, two punched-notch circles at top/bottom) separating a header band from the detail body. Used for the confirmation/summary states in Register — the moment a student's choice becomes a "real" document.

## 6. Do's and Don'ts

### Do:
- **Do** render every label, ID, count, date, and eyebrow in Geist Mono, uppercase, letter-spaced ≥0.15em.
- **Do** reserve brass for accents only — never as a dominant background.
- **Do** use stamp teal and oxblood exclusively for open/success and full/error states.
- **Do** give document-tier cards (boarding pass, confirmation, modal) real elevation (`shadow-xl`/`2xl`); keep supporting UI flat or `shadow-sm`.
- **Do** pair every decorative animation (`title-float`, `gate-pulse`, `stamp-press`) with a `prefers-reduced-motion: reduce` fallback that removes it entirely.
- **Do** give the teacher portal the same passport-system craft as the student-facing screens.

### Don't:
- **Don't** use generic SaaS blue/indigo — the palette is navy ink, brass foil, and paper, not a blue-accent dashboard.
- **Don't** introduce childish or cartoonish elements — no bubble shapes, mascots, or playful bounce easing.
- **Don't** let the teacher/admin view collapse into a dense, cluttered enterprise data-grid aesthetic.
- **Don't** use `border-left`/`border-right` colored stripes as a decorative accent.
- **Don't** use gradient text (`background-clip: text` with a gradient fill).
- **Don't** round cards or sections beyond 24px (rounded-3xl); nothing in this system should read as "insanely rounded."
