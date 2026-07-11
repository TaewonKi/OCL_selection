<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Response Depth
  Always use the `token-budget-advisor` skill in shortcut mode with the `Essential` option by default.
  Do not ask me to choose a depth unless I explicitly request a different level.
  Maintain `25% depth` for the whole session unless I say `moderate`, `detailed`, or `exhaustive`.

## Design Context

This project has a captured design identity — see `PRODUCT.md` (strategy: register,
users, positioning, anti-references) and `DESIGN.md` (visual system: the "Diplomatic
Passport" passport/boarding-pass identity — ink/brass/paper palette, Fraunces/Geist/Geist
Mono type, stamp/stub/security-paper signature components). Read both before doing any
UI work; don't default to generic SaaS styling.