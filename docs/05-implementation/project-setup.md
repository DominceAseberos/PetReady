# Project Setup

## Document Info
- **Phase**: Implementation
- **Author**: PetReady Team
- **Date**: 2026-06-24
- **Status**: Draft

---

## 1. Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20 LTS | Runtime |
| pnpm | 9.x | Package manager (fast, disk-efficient) |
| PostgreSQL | 16 | Database |
| Redis | 7 | Queue & cache |
| Git | Latest | Version control |

---

## 2. Project Structure

```
PetReady/
├── docs/                    # This documentation
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities, hooks
│   │   └── public/          # Static assets
│   └── api/                 # Express.js backend
│       ├── src/
│       │   ├── routes/      # API route handlers
│       │   ├── services/    # Business logic
│       │   ├── models/      # DB models/queries
│       │   ├── jobs/        # Bull job processors
│       │   ├── middleware/  # Auth, validation, error handling
│       │   └── utils/       # Shared utilities
│       └── tests/           # API tests
├── packages/
│   └── shared/              # Shared types, constants
├── docker-compose.yml       # Local dev services
├── turbo.json               # Monorepo config
└── package.json             # Root workspace
```

---

## 3. Monorepo Setup

Using **Turborepo** for monorepo management:
- `apps/web` — Next.js 14 frontend
- `apps/api` — Express.js backend
- `packages/shared` — TypeScript types shared between apps

---

## 4. Environment Variables

### apps/web/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random-secret>
GOOGLE_CLIENT_ID=<oauth-client-id>
GOOGLE_CLIENT_SECRET=<oauth-secret>
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<web-push-public-key>
```

### apps/api/.env
```
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/petready
REDIS_URL=redis://localhost:6379
JWT_SECRET=<random-secret>
VAPID_PUBLIC_KEY=<web-push-public-key>
VAPID_PRIVATE_KEY=<web-push-private-key>
RESEND_API_KEY=<resend-key>
POSTHOG_API_KEY=<posthog-key>
NODE_ENV=development
```

---

## 5. Local Development

```bash
# Clone and install
git clone https://github.com/DominceAseberos/PetReady.git
cd PetReady
pnpm install

# Start infrastructure
docker-compose up -d  # PostgreSQL + Redis

# Run migrations
pnpm --filter api db:migrate

# Start development
pnpm dev  # Runs both web (3000) and api (3001)
```

---

## 6. Docker Compose (Local Dev)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: petready
      POSTGRES_USER: petready
      POSTGRES_PASSWORD: localdev
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

---

## 7. Key Dependencies

### Frontend (apps/web)
```json
{
  "next": "14.x",
  "react": "18.x",
  "tailwindcss": "3.x",
  "next-auth": "4.x",
  "@tanstack/react-query": "5.x",
  "zod": "3.x",
  "lucide-react": "latest"
}
```

### Backend (apps/api)
```json
{
  "express": "4.x",
  "bull": "4.x",
  "pg": "8.x",
  "jsonwebtoken": "9.x",
  "bcryptjs": "2.x",
  "web-push": "3.x",
  "zod": "3.x",
  "helmet": "7.x",
  "cors": "2.x",
  "morgan": "1.x",
  "resend": "3.x"
}
```

### Shared Dev Dependencies
```json
{
  "typescript": "5.x",
  "eslint": "8.x",
  "prettier": "3.x",
  "vitest": "1.x",
  "turbo": "2.x"
}
```
