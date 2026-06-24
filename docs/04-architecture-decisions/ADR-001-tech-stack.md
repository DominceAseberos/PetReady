# ADR-001: Technology Stack Selection

## Status
**Accepted** — 2026-06-24

## Context

PetReady needs a tech stack that supports:
- Server-side rendering for SEO and fast initial load
- Real-time push notifications (browser-based)
- Scheduled task execution (time-based simulation events)
- Relational data with complex queries (scores, aggregations)
- Rapid MVP development (target: 8 weeks)
- Single developer / small team capability

## Decision

| Layer | Choice |
|-------|--------|
| Frontend Framework | Next.js 14 (App Router) |
| UI Library | React 18 |
| Styling | Tailwind CSS |
| Backend API | Express.js |
| Database | PostgreSQL 16 |
| Cache & Queue | Redis 7 + Bull |
| Authentication | NextAuth.js |
| Push Notifications | web-push (npm package) |
| Email | Resend |
| Frontend Hosting | Vercel |
| Backend Hosting | Railway |
| Analytics | PostHog |
| Error Tracking | Sentry |
| Language | TypeScript (both frontend and backend) |

## Alternatives Considered

### Frontend
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Next.js** | SSR, file routing, Vercel integration, huge ecosystem | Complexity for simple pages | ✅ Selected |
| Remix | Great data loading, newer patterns | Smaller ecosystem, less hiring pool | ❌ |
| SvelteKit | Fast, small bundles | Smaller ecosystem, less React talent | ❌ |
| Plain React SPA | Simple | No SSR, bad SEO, slower initial load | ❌ |

### Backend
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Express.js** | Simple, well-known, fast to build | Minimal structure | ✅ Selected |
| Fastify | Faster benchmarks | Less middleware ecosystem | ❌ |
| NestJS | Structured, enterprise-ready | Over-engineered for MVP | ❌ |
| Next.js API Routes only | No separate server needed | Limited for background jobs, queues | ❌ |

### Database
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **PostgreSQL** | ACID, JSONB, complex queries, proven | Needs more setup than NoSQL | ✅ Selected |
| MongoDB | Flexible schema, easy start | Weak for relational queries, joins | ❌ |
| MySQL | Well-known | Less JSONB support, fewer features | ❌ |
| Supabase | PostgreSQL + auth + realtime built-in | Vendor lock-in concern | ❌ Considered for future |

### Queue / Scheduler
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Bull (Redis)** | Simple API, delayed jobs, retries | Redis dependency | ✅ Selected |
| BullMQ | Newer version of Bull | API changes, less docs | ❌ |
| RabbitMQ | Industrial strength | Over-engineered for our scale | ❌ |
| Cron jobs | Simplest | Doesn't scale, no per-user scheduling | ❌ |
| Temporal/Inngest | Workflow engines | Complexity, cost for MVP | ❌ |

## Consequences

### Positive
- TypeScript across the stack reduces context-switching
- Next.js + Vercel = instant deploys with zero config
- Bull handles our core need (schedule task X at time Y for user Z)
- PostgreSQL's JSONB lets us store flexible quiz responses without schema migrations
- Entire stack is free-tier friendly for MVP

### Negative
- Two hosting platforms (Vercel + Railway) adds operational complexity
- Redis is an additional service to manage
- Express.js lacks opinionated structure — needs discipline
- Next.js App Router is newer, some edge cases in docs

### Risks
- If we outgrow Bull's capabilities, migration to a workflow engine will cost time
- Vercel's free tier has limits (100GB bandwidth/month) — may need paid at scale

## Decision Drivers

1. **Speed to MVP** (highest priority) — Can a solo dev ship in 8 weeks?
2. **Push notification support** — Must schedule notifications per-user-per-task
3. **Cost** — Near-zero hosting cost during validation phase
4. **Hiring** — If we grow, can we find developers who know this stack?
5. **Scalability** — Can it handle 10K users without rewrite?
