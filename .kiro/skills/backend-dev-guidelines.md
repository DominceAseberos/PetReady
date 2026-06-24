---
name: backend-dev-guidelines
description: Backend development standards for Node.js/Express/TypeScript. Use when creating routes, services, middleware, or any server-side code.
---

# Backend Development Guidelines

## Architecture: Layered (Routes → Controllers → Services → Repositories)

```
routes/        → HTTP method + path + middleware chain
controllers/   → Parse request, call service, format response
services/      → Business logic, orchestration, validation
models/        → Database queries, data access
middleware/    → Auth, validation, error handling, logging
```

### Rules

- **Controllers are thin** — max 10 lines, no business logic.
- **Services are testable** — inject dependencies, no direct imports of DB.
- **Models are dumb** — just SQL/queries, no logic.
- **Middleware is reusable** — compose chains, single responsibility.

## SOLID Principles (Enforced)

| Principle | Rule |
|-----------|------|
| **Single Responsibility** | One file = one concern. `scoreCalculator.ts` doesn't send emails. |
| **Open/Closed** | New event types added by creating new files, not modifying existing switch statements. |
| **Liskov Substitution** | All notification channels implement same `NotificationChannel` interface. |
| **Interface Segregation** | `TaskRepository` doesn't have `sendEmail()` method. |
| **Dependency Inversion** | Services accept interfaces via constructor, not `import db from './db'`. |

## Error Handling

### Custom Error Classes (required)

```typescript
// All errors extend AppError
class AppError extends Error {
  constructor(public code: string, public statusCode: number, message: string) {
    super(message);
  }
}

// Specific errors
class NotFoundError extends AppError { /* 404 */ }
class ValidationError extends AppError { /* 400, includes field details */ }
class ConflictError extends AppError { /* 409 */ }
class UnauthorizedError extends AppError { /* 401 */ }
```

### Error Handling Rules

- **Never** let unhandled promise rejections crash the server.
- **Always** use centralized error middleware (last middleware in chain).
- **Never** expose stack traces in production.
- **Always** log errors with context (userId, requestId, endpoint).
- Error messages are for USERS: plain language, specific, actionable.
- Error logs are for DEVELOPERS: full context, stack trace, request data.

### Error Message Format (user-facing)

```json
{
  "error": {
    "code": "MACHINE_READABLE_CODE",
    "message": "Human-readable explanation of what went wrong",
    "details": { "field": "specific field info if validation" }
  }
}
```

## Input Validation (Zod, always)

```typescript
// Every endpoint validates input with Zod schema
const CreateSimulationSchema = z.object({
  assessment_id: z.string().uuid(),
  pet_type: z.enum(['dog', 'cat', 'bird', 'rabbit']),
  pet_size: z.enum(['small', 'medium', 'large']).optional(),
  duration_days: z.number().int().min(3).max(7),
});

// Validate in controller, BEFORE calling service
const data = CreateSimulationSchema.parse(req.body);
```

## Security Checklist

- [ ] Parameterized queries only (NO string interpolation for SQL)
- [ ] Rate limiting on all public endpoints
- [ ] JWT validation on all protected routes
- [ ] Input sanitization (Zod strips unknown fields)
- [ ] CORS whitelist production domains only
- [ ] Helmet.js for security headers
- [ ] No secrets in code (env vars only)
- [ ] bcrypt cost factor ≥ 12 for passwords

## API Response Standards

```typescript
// Success: return data directly
res.status(200).json({ simulation, tasks });
res.status(201).json(newResource);
res.status(204).send(); // no content (delete)

// Errors: consistent format (via error middleware)
// Never: res.status(500).json({ error: err.message })
```

## Logging

```typescript
// Structured JSON logging
logger.info('Simulation created', { userId, simulationId, petType });
logger.error('Task scheduling failed', { error, taskId, retryCount });

// NEVER log: passwords, tokens, full request bodies with sensitive data
```

## Testing Approach

- Unit tests: every service method, every utility function
- Integration tests: every API endpoint (happy path + error cases)
- Use test factories for mock data
- Test database with transaction rollback per test
- Mock external services (email, push) in tests
