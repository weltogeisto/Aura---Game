# NOTES

## External validation

- Tailwind responsive breakpoint semantics (`sm:` and above) validated against official docs: https://tailwindcss.com/docs/responsive-design
- Dynamic viewport units (`dvh`) behavior validated against MDN docs for viewport-percentage lengths: https://developer.mozilla.org/en-US/docs/Web/CSS/length#viewport-percentage_lengths

## Key decision

- Use `min-h-dvh` / `max-h-[92dvh]` for modal-like screens so mobile browser chrome changes do not clip primary actions.
- Keep responsive behavior in component-level Tailwind classes to avoid introducing another CSS abstraction layer.
