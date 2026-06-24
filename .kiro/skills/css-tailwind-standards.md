---
name: css-tailwind-standards
description: CSS and Tailwind best practices for performance, accessibility, and maintainability. Use when writing any styling or UI component.
---

# CSS & Tailwind Standards

## Design Token Hierarchy

```
Design Tokens (CSS vars in :root)
  → Tailwind Theme (tailwind.config)
    → Utility Classes (in JSX)
      → @apply (LAST RESORT only)
```

## Rules

### Do

- Use Tailwind utility classes directly in JSX (that's the point).
- Use design tokens from `tailwind.config` — never hardcode colors/spacing.
- Use responsive prefixes (`sm:`, `md:`, `lg:`) for breakpoints.
- Use `group-` and `peer-` for parent/sibling state.
- Extract repeated patterns into React COMPONENTS, not @apply classes.
- Use `clsx` or `cn()` for conditional classes.

### Don't

- Don't use arbitrary values (`w-[247px]`) unless truly one-off.
- Don't use @apply in components — extract to a React component instead.
- Don't mix Tailwind with custom CSS files (pick one per component).
- Don't use `!important` — ever.
- Don't use inline styles unless truly dynamic (computed values).

## Performance

- **Purge unused CSS** — Tailwind does this automatically in production.
- **Avoid dynamic class names** — `bg-${color}-500` won't be purged. Use full strings.
- **Minimize layout shifts** — set explicit `w-` and `h-` on images/containers.
- **Prefer `transform` + `opacity`** for animations (GPU-accelerated).
- **Use `will-change` sparingly** — only on elements that actually animate.

## Accessibility Requirements

| Rule | Implementation |
|------|---------------|
| Color contrast | 4.5:1 minimum (use `text-gray-900` on light, `text-white` on dark) |
| Focus indicators | `focus-visible:ring-2 focus-visible:ring-primary-500` on all interactive |
| Tap targets | `min-h-[44px] min-w-[44px]` on buttons/links |
| Motion | `motion-reduce:` prefix for users who prefer reduced motion |
| Screen readers | `sr-only` for visually hidden labels, `aria-*` attributes |
| Skip navigation | First element: "Skip to main content" link |

## Component Patterns

### Button

```tsx
<button
  className="inline-flex items-center justify-center rounded-md px-4 py-2
             min-h-[44px] min-w-[44px]
             bg-teal-600 text-white font-medium
             hover:bg-teal-700 active:bg-teal-800
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2
             disabled:opacity-50 disabled:cursor-not-allowed
             transition-colors duration-150"
  aria-busy={loading}
  disabled={loading}
>
  {loading ? 'Processing...' : 'Complete Task'}
</button>
```

### Card (Anti-Slop Version)

```tsx
{/* NO colored left border + rounded combo. Use subtle shadow instead */}
<div className="bg-white p-5 shadow-sm border border-gray-100 rounded-lg">
  <h3 className="text-base font-semibold text-gray-900">{title}</h3>
  <p className="mt-1 text-sm text-gray-600">{description}</p>
</div>
```

## Responsive Breakpoints

| Prefix | Min Width | Target |
|--------|-----------|--------|
| (none) | 0px | Mobile first |
| `sm:` | 640px | Large phone |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Laptop |
| `xl:` | 1280px | Desktop |

## Dark Mode

- Use `dark:` prefix for dark mode variants.
- Test ALL components in both modes.
- Background: `bg-white dark:bg-gray-900`
- Text: `text-gray-900 dark:text-gray-100`
- Borders: `border-gray-200 dark:border-gray-700`

## Animations (Purposeful Only)

```css
/* Only animate what has meaning */
.task-complete { animation: checkmark 0.3s ease-out; }
.score-reveal { animation: countUp 1.2s ease-out; }

/* NO decorative: floating blobs, pulsing borders, gradient shifts */
```
