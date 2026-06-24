---
name: git-branching-strategy
description: Git workflow with feature branches, PR-based merging, and auto-cleanup. Use when creating branches, committing, or merging.
---

# Git Branching Strategy

## Branch Structure

```
main          ← Production (auto-deploys to petready.app)
  └── develop ← Integration branch (auto-deploys to staging)
       ├── feature/auth-system
       ├── feature/quiz-ui
       ├── feature/simulation-engine
       ├── fix/notification-timing
       └── docs/update-api-spec
```

## Rules

1. **Never push directly to `main`** — always through PR from `develop`.
2. **Never push directly to `develop`** — always through PR from feature branch.
3. **One feature = one branch** — branch from `develop`, merge back to `develop`.
4. **Delete branch after merge** — keep the repo clean.
5. **Squash merge** for feature branches (clean history).

## Branch Naming

```
feature/<short-description>    → New functionality
fix/<short-description>        → Bug fixes
docs/<short-description>       → Documentation only
refactor/<short-description>   → Code restructuring (no behavior change)
test/<short-description>       → Adding tests only
chore/<short-description>      → Dependencies, config, tooling
```

## Workflow

### Starting a new feature

```bash
git checkout develop
git pull origin develop
git checkout -b feature/quiz-ui
```

### Working on it

```bash
# Commit frequently with conventional commits
git add -A
git commit -m "feat(quiz): add progress bar component"
git push -u origin feature/quiz-ui
```

### Merging (via PR)

```bash
# Create PR: feature/quiz-ui → develop
gh pr create --base develop --title "feat(quiz): lifestyle assessment UI" --body "..."

# After approval + CI passes, squash merge via GitHub UI
# Branch auto-deletes after merge (GitHub setting enabled)
```

### Releasing to production

```bash
# Create PR: develop → main
gh pr create --base main --head develop --title "release: v0.1.0 - MVP auth + quiz"

# After CI passes, merge to main
# Auto-deploys to production via Vercel/Railway
```

## GitHub Settings (Enable These)

1. **Settings → General → Pull Requests**:
   - ✅ Automatically delete head branches
   - ✅ Allow squash merging
   - ❌ Disable merge commits (force squash for cleanliness)

2. **Settings → Branches → Branch protection (main)**:
   - ✅ Require pull request before merging
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date

3. **Settings → Branches → Branch protection (develop)**:
   - ✅ Require pull request before merging
   - ✅ Require status checks to pass

## Commit Messages (Conventional Commits)

```
<type>(<scope>): <short description>

Types: feat, fix, docs, style, refactor, test, chore
Scope: auth, quiz, sim, score, notif, api, ui, db
```

Examples:
```
feat(sim): implement task scheduling with timezone support
fix(notif): correct email fallback delay from 15min to 30min
docs(api): add OpenAPI spec for /simulations endpoints
test(score): add edge case tests for zero-task scenarios
chore(deps): update next.js to 14.2.1
```

## Feature Branch List (MVP)

| Branch | What | Depends On |
|--------|------|-----------|
| `feature/project-setup` | Monorepo, configs, Docker, CI | — |
| `feature/database-schema` | Migrations, all tables | project-setup |
| `feature/auth-system` | Register, login, OAuth, JWT | database-schema |
| `feature/quiz-ui` | Assessment questions + UI | auth-system |
| `feature/simulation-engine` | Task scheduler, Bull queue | database-schema |
| `feature/notifications` | Web Push + email fallback | simulation-engine |
| `feature/simulation-dashboard` | Live task UI, progress | simulation-engine, quiz-ui |
| `feature/events-system` | Random events + responses | simulation-engine |
| `feature/score-calculator` | Weighted scoring algorithm | simulation-engine |
| `feature/results-page` | Score display + recommendations | score-calculator |
| `feature/preparation-plan` | Checklist generation + UI | results-page |
