---
name: anti-ai-slop-design
description: Enforce human-crafted design quality. Use when generating any UI component, page, or layout. Prevents generic AI patterns.
---

# Anti-AI-Slop Design Rules

Concrete, checkable rules that distinguish "designed by a human who shipped product" from "default LLM output."

## P0 — Must Fix (Cardinal Sins)

1. **No default Tailwind indigo as accent** — no `#6366f1`, `#4f46e5`, `#4338ca`. Use our design tokens (`--color-primary: teal-600`).
2. **No purple→blue "trust" gradient heroes** — use flat surfaces + intentional typography.
3. **No emoji as feature icons** — use 1.6–1.8px monoline SVG icons with `currentColor` (Lucide icons).
4. **Display text uses brand font** — h1/h2 use `var(--font-display)`, never hardcoded Inter/Roboto.
5. **No rounded card with colored left-border** — the "AI dashboard tile." Drop the radius or the border.
6. **No invented metrics** — no "10× faster", "99.9% uptime" without real data source.
7. **No filler copy** — no lorem ipsum, no "feature one / two / three".

## P1 — Should Fix (Soft Tells)

- No standard "Hero → Features → Pricing → FAQ → CTA" without variation.
- No external placeholder images (unsplash, placehold.co).
- Cap `var(--accent)` usage to 2 visible uses per screen.
- No more than 12 raw hex values outside `:root`.

## P2 — Polish (Nice to Fix)

- No decorative blob/wave SVG backgrounds without meaning.
- Break perfect symmetry — alternate dense + breathing sections.
- Every section needs `data-testid` for testing.

## How to Add Soul

Aim for **80% proven patterns + 20% distinctive choice**:

1. **One bold visual move** — a typography choice, unexpected proportion, or single color decision.
2. **Voice in microcopy** — "Start your simulation" not "Get started". Buttons say what they DO.
3. **One micro-interaction** — button press 2px shift, number counting up, task check animation.
4. **One product-specific detail** — a paw print in the loading state, pet-related empty states.

## PetReady Design Tokens

```css
:root {
  --color-primary: #0D9488;      /* Teal-600 — trust, calm */
  --color-secondary: #F59E0B;    /* Amber-500 — warmth */
  --color-success: #10B981;      /* Green-500 */
  --color-warning: #F97316;      /* Orange-500 */
  --color-danger: #EF4444;       /* Red-500 */
  --color-bg: #F9FAFB;           /* Gray-50 */
  --color-text: #1F2937;         /* Gray-800 */
  --color-muted: #6B7280;        /* Gray-500 */
  --font-display: 'Plus Jakarta Sans', sans-serif;
  --font-body: 'Inter', sans-serif;
}
```

## Checklist Before Shipping Any Page

- [ ] Could someone identify this as PetReady from a screenshot? (soul test)
- [ ] Zero P0 violations present?
- [ ] Primary CTA is a clear verb+noun? ("Start simulation", not "Get started")
- [ ] Max 1 primary CTA per screen?
- [ ] No decorative elements without purpose?
- [ ] Text passes 4.5:1 contrast ratio?
- [ ] Interactive elements have 44×44px minimum tap target?
