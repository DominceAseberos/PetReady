---
name: ux-heuristics-auditor
description: Audit UI against Nielsen's 10 heuristics and Krug's usability laws. Use when reviewing any page, component, or user flow for usability issues.
---

# UX Heuristics Auditor

Rate any interface 0–10. Always state the current score and improvements needed to reach 10/10.

## Core Principle

**"Don't Make Me Think"** — every page should be self-evident. If something requires thinking, it's a usability problem.

## Krug's Laws

1. **Don't Make Me Think** — clear labels, no jargon, no ambiguity.
2. **Clicks don't matter if they're confident** — 3 mindless clicks > 1 confusing click.
3. **Get rid of half the words** — then half again. Brevity makes useful content prominent.
4. **Trunk Test** — drop on any page, user should instantly know: what site, what page, where am I, what can I do.

## Nielsen's 10 Heuristics Checklist

| # | Heuristic | Check |
|---|-----------|-------|
| 1 | **Visibility of system status** | Loading states, progress bars, confirmations on every action |
| 2 | **Match real world** | User language ("Sign in" not "Authenticate"), natural ordering |
| 3 | **User control & freedom** | Undo, cancel, exit available everywhere |
| 4 | **Consistency** | Same words/styles mean same thing throughout |
| 5 | **Error prevention** | Constraints, autocomplete, sensible defaults, confirmation for destructive only |
| 6 | **Recognition > recall** | Show options, don't require memorization |
| 7 | **Flexibility** | Keyboard shortcuts for power users, progressive disclosure |
| 8 | **Minimalist design** | Every element earns its place, one primary CTA |
| 9 | **Error recovery** | Messages say: what happened + why + how to fix |
| 10 | **Help & documentation** | Searchable, task-focused, contextual |

## Severity Rating

| Rating | Level | Action |
|--------|-------|--------|
| 0 | Not a problem | Ignore |
| 1 | Cosmetic | Fix if time |
| 2 | Minor | Schedule fix |
| 3 | Major | Fix soon |
| 4 | Catastrophic | Fix immediately |

## Quick Diagnostic Questions

- Can I tell what site/page this is immediately?
- Is the main action obvious?
- Can I find navigation without searching?
- Does the system show what's happening?
- Are error messages helpful (what + why + fix)?
- Can I undo or go back?
- Does it work without hover (mobile/keyboard)?
- Are all interactive elements labelled?
- Does anything make me think "huh?"

## PetReady-Specific Checks

- [ ] Quiz progress is always visible
- [ ] Simulation status (day X of Y, tasks done) visible at a glance
- [ ] Notification permission request explains WHY (simulation needs it)
- [ ] Score breakdown is scannable (bars, not walls of text)
- [ ] Every task completion gives immediate visual feedback
- [ ] Event scenarios are readable in < 10 seconds
- [ ] Results page passes the "so what?" test (actionable, not just a number)

## Common Fixes

| Problem | Fix |
|---------|-----|
| Mystery meat navigation | Add text labels alongside icons |
| Wall of text | Break with headings, bullets, whitespace |
| No loading indicator | Skeleton screen or spinner |
| Tiny tap targets | 44×44px minimum |
| Unclear required fields | Mark optional, not required |
| Hover-only info | Make visible by default |
| Broken back button | Never hijack browser history |
