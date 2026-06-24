# Coding Standards

## Document Info
- **Phase**: Implementation
- **Author**: PetReady Team
- **Date**: 2026-06-24
- **Status**: Draft

---

## 1. General Principles

### SOLID Principles (Applied to TypeScript)

| Principle | Application |
|-----------|-------------|
| **S**ingle Responsibility | Each file/module does one thing. A service handles one domain. |
| **O**pen/Closed | Use interfaces and composition. Extend behavior without modifying existing code. |
| **L**iskov Substitution | All implementations of an interface must be interchangeable. |
| **I**nterface Segregation | Small, focused interfaces. Don't force implementations to depend on methods they don't use. |
| **D**ependency Inversion | Depend on abstractions (interfaces), not concrete implementations. Inject dependencies. |

### Code Quality Rules

- No `any` type — use `unknown` and narrow with type guards
- No unused variables or imports (enforced by ESLint)
- No magic numbers — use named constants
- No deeply nested callbacks — use async/await
- Maximum function length: ~30 lines (if longer, extract)
- Maximum file length: ~300 lines (if longer, split)

---

## 2. TypeScript Style

### Naming Conventions

| Entity | Convention | Example |
|--------|-----------|---------|
| Files (components) | PascalCase | `TaskCard.tsx` |
| Files (utilities) | camelCase | `scoreCalculator.ts` |
| Files (types) | camelCase | `simulation.types.ts` |
| Interfaces | PascalCase, no "I" prefix | `SimulationResult` |
| Types | PascalCase | `TaskType` |
| Functions | camelCase | `calculateScore()` |
| Constants | UPPER_SNAKE_CASE | `MAX_SIMULATION_DAYS` |
| React components | PascalCase | `ScoreGauge` |
| CSS classes | kebab-case (Tailwind) | `text-primary-600` |
| DB columns | snake_case | `created_at` |
| API endpoints | kebab-case | `/auth/forgot-password` |
| Environment vars | UPPER_SNAKE_CASE | `DATABASE_URL` |

### Function Style

```typescript
// ✅ Good — clear types, single responsibility
async function getActiveSimulation(userId: string): Promise<Simulation | null> {
  return db.simulations.findFirst({
    where: { userId, status: 'active' },
  });
}

// ❌ Bad — any types, does too much
async function doStuff(data: any) {
  // ...200 lines of mixed concerns
}
```

### Error Handling

```typescript
// ✅ Use custom error classes
class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', 404, `${resource} not found`);
  }
}

class ValidationError extends AppError {
  constructor(details: Record<string, string>) {
    super('VALIDATION_ERROR', 400, 'Validation failed');
    this.details = details;
  }
}

// ✅ Centralized error handler middleware
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message }
    });
  }
  // Unexpected error — log and return generic message
  logger.error(err);
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' }
  });
}
```

---

## 3. Frontend Standards (React/Next.js)

### Component Structure

```typescript
// ✅ Standard component structure
interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
}

export function TaskCard({ task, onComplete }: TaskCardProps) {
  // 1. Hooks first
  const [loading, setLoading] = useState(false);
  
  // 2. Derived state
  const isOverdue = task.scheduledAt < new Date();
  
  // 3. Handlers
  const handleComplete = async () => {
    setLoading(true);
    await onComplete(task.id);
    setLoading(false);
  };

  // 4. Render
  return (
    <div className="rounded-lg border p-4" role="article" aria-label={task.title}>
      <h3 className="font-medium text-gray-900">{task.title}</h3>
      <button
        onClick={handleComplete}
        disabled={loading}
        aria-busy={loading}
        className="mt-2 rounded bg-teal-600 px-4 py-2 text-white hover:bg-teal-700 disabled:opacity-50"
      >
        {loading ? 'Completing...' : 'Mark Complete'}
      </button>
    </div>
  );
}
```

### Rules

- Functional components only (no class components)
- Props interface always defined explicitly (no inline types)
- Use `React.FC` sparingly — prefer explicit return types
- Custom hooks extract reusable logic (`useSimulation`, `useNotifications`)
- Server Components by default, Client Components only when needed
- No prop drilling beyond 2 levels — use context or composition

---

## 4. Backend Standards (Express)

### Route Handler Pattern

```typescript
// ✅ Thin controller, logic in service
router.post('/simulations', authenticate, async (req, res, next) => {
  try {
    const data = CreateSimulationSchema.parse(req.body);
    const simulation = await simulationService.create(req.userId, data);
    res.status(201).json(simulation);
  } catch (error) {
    next(error);
  }
});
```

### Service Layer Pattern

```typescript
// ✅ Service handles business logic
class SimulationService {
  constructor(
    private db: Database,
    private queue: TaskQueue,
    private notificationService: NotificationService,
  ) {}

  async create(userId: string, data: CreateSimulationInput): Promise<Simulation> {
    // Check no active simulation exists
    const active = await this.db.simulations.findActive(userId);
    if (active) {
      throw new ConflictError('SIMULATION_ALREADY_ACTIVE');
    }

    // Create simulation and tasks
    const simulation = await this.db.simulations.create({ userId, ...data });
    const tasks = this.generateTaskSchedule(simulation);
    await this.db.tasks.createMany(tasks);

    // Queue notifications
    await this.queue.scheduleTaskNotifications(tasks);

    return simulation;
  }
}
```

---

## 5. Database Query Standards

```typescript
// ✅ Parameterized queries only (SQL injection prevention)
const result = await db.query(
  'SELECT * FROM simulations WHERE user_id = $1 AND status = $2',
  [userId, 'active']
);

// ❌ NEVER string interpolation
const result = await db.query(
  `SELECT * FROM simulations WHERE user_id = '${userId}'` // SQL INJECTION
);
```

---

## 6. Testing Standards

| Type | Tool | Scope | Coverage Target |
|------|------|-------|----------------|
| Unit | Vitest | Functions, services | >80% |
| Integration | Vitest + Supertest | API endpoints | >70% |
| E2E | Puppeteer | Critical user flows | Key paths |
| Component | React Testing Library | UI components | >70% |

### Test File Naming

```
src/services/scoreCalculator.ts        → tests/services/scoreCalculator.test.ts
src/routes/simulations.ts              → tests/routes/simulations.test.ts
components/TaskCard.tsx                 → components/TaskCard.test.tsx
```

---

## 7. Git Conventions

### Branch Names
```
feature/simulation-engine
fix/notification-timing-bug
docs/update-api-spec
refactor/score-calculator
```

### Commit Messages (Conventional Commits)
```
feat(sim): add task scheduling with timezone support
fix(notif): correct email fallback delay to 30min
docs: add API design documentation
test(score): add unit tests for weighted calculation
refactor(api): extract validation middleware
```

---

## 8. ESLint & Prettier Config

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "no-console": "warn",
    "prefer-const": "error"
  }
}
```

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}
```
