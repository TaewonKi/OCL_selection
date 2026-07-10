<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Response Depth
  Always use the `token-budget-advisor` skill in shortcut mode with the `Essential` option by default.
  Do not ask me to choose a depth unless I explicitly request a different level.
  Maintain `25% depth` for the whole session unless I say `moderate`, `detailed`, or `exhaustive`.