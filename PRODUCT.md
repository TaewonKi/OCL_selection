# Product

## Register

product

## Platform

web

## Users

Students at the school register for an Outside Classroom Learning trip: enter a
student ID, pick a destination city, and register subject to a per-city quota.
They browse and decide at their own pace rather than racing against a fast-filling
quota. A secondary teacher audience uses a portal view to oversee registrations,
and a registration-check view lets students confirm their own status afterward.

## Product Purpose

Turns a school trip sign-up — normally a form or spreadsheet — into a structured,
quota-aware registration flow with a live-verified server clock so no one can
dispute who claimed a seat. Success is every student registering without
confusion about quota status, and teachers having a clear, trustworthy view of
who's registered where.

## Positioning

It makes registering feel like booking real travel, not filling out paperwork —
the passport / boarding-pass / departure-board framing turns city selection into
a real, exciting travel-booking moment rather than an administrative task.

## Brand Personality

Official, exclusive, adventurous. The voice treats each destination like a real
departure: formal-institutional in structure (stamps, tickets, manifests) but
exciting in tone, like holding an actual travel document for a real trip. Never
childish or cartoonish — this is a grown-up, official artifact, not a kids' app.

## Anti-references

Generic SaaS blue/indigo (the prior UI before this identity). Childish or
cartoonish styling. A cluttered, dense enterprise-admin look for the teacher
portal — it should stay as clean and considered as the student-facing screens,
not default to a data-grid dashboard aesthetic just because it's an admin view.

## Design Principles

- Treat every screen as a travel artifact, not a form — boarding passes, stamps,
  departure boards, seat maps over inputs, checkboxes, and tables where possible.
- Official over playful: formality and craft signal trustworthiness for a
  quota-enforced, dispute-sensitive process.
- One identity, every surface: the teacher portal and check view earn the same
  passport-system care as the register flow, not a simplified fallback.
- Never trust the client: quota counts and time-sensitive state are always
  server-verified, and the UI should visually communicate that authority (live
  counts, stamped confirmations) rather than optimistic local state.

## Accessibility & Inclusion

WCAG AA. Keyboard navigation throughout, visible focus rings, and full
`prefers-reduced-motion` support (decorative motion — departure board flips,
stamp animations — must have a static/instant fallback).
