---
name: error-handling-patterns
description: Error handling and user-friendly error messaging patterns. Use when implementing any error path, API response, or user-facing error state.
---

# Error Handling Patterns

## Philosophy

Errors happen. The user should NEVER feel:
- Lost ("what just happened?")
- Blamed ("you did something wrong")
- Helpless ("now what?")

Every error message answers THREE questions:
1. **What** happened?
2. **Why** it happened?
3. **What to do** about it?

## User-Facing Error Messages

### Rules

| Rule | Bad | Good |
|------|-----|------|
| Be specific | "Error occurred" | "Your email format looks wrong — try name@example.com" |
| Use plain language | "ECONNREFUSED" | "We can't reach the server right now" |
| Offer a fix | "Invalid input" | "Password needs at least 8 characters" |
| Don't blame | "You entered wrong data" | "That email isn't registered — want to sign up?" |
| Preserve input | Clear form on error | Keep all fields filled, highlight the problem |
| Be human | "Error 422" | "Almost there — just fix the highlighted field" |

### Form Validation Messages

```typescript
const errorMessages = {
  email: {
    required: 'We need your email to save your progress',
    invalid: 'That doesn\'t look like an email — try name@example.com',
    taken: 'This email already has an account — want to sign in instead?',
  },
  password: {
    required: 'Choose a password to secure your account',
    tooShort: 'Needs at least 8 characters — try adding a number or symbol',
    tooWeak: 'Try mixing uppercase, lowercase, and numbers',
  },
  simulation: {
    alreadyActive: 'You already have a simulation running — finish it first or start fresh',
    assessmentRequired: 'Complete the lifestyle quiz first so we can personalize your simulation',
  },
};
```

### Empty States (not errors, but feel like them)

```typescript
const emptyStates = {
  noSimulations: {
    title: 'No simulations yet',
    message: 'Take the lifestyle quiz to start your first pet ownership simulation',
    action: { label: 'Start Quiz', href: '/quiz' },
  },
  noResults: {
    title: 'Results loading...',
    message: 'Complete your simulation to see your readiness score',
    action: null,
  },
};
```

## Backend Error Hierarchy

```typescript
// Base error (all custom errors extend this)
abstract class AppError extends Error {
  abstract statusCode: number;
  abstract code: string;
  
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
      }
    };
  }
}

// Specific errors
class ValidationError extends AppError {
  statusCode = 400;
  code = 'VALIDATION_ERROR';
  constructor(public details: Record<string, string>) {
    super('Please fix the highlighted fields');
  }
}

class NotFoundError extends AppError {
  statusCode = 404;
  code = 'NOT_FOUND';
  constructor(resource: string) {
    super(`${resource} not found`);
  }
}

class UnauthorizedError extends AppError {
  statusCode = 401;
  code = 'UNAUTHORIZED';
  constructor() {
    super('Please sign in to continue');
  }
}

class ConflictError extends AppError {
  statusCode = 409;
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

class RateLimitError extends AppError {
  statusCode = 429;
  code = 'RATE_LIMITED';
  constructor() {
    super('Too many requests — please wait a moment');
  }
}
```

## Centralized Error Middleware

```typescript
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  // Known application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Please fix the following fields',
        details: err.errors.reduce((acc, e) => {
          acc[e.path.join('.')] = e.message;
          return acc;
        }, {}),
      }
    });
  }

  // Unknown errors — log full details, return generic message
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.userId,
  });

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something unexpected happened — please try again',
    }
  });
}
```

## Frontend Error Handling

### React Error Boundary

```tsx
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className="p-6 text-center">
      <h2 className="text-lg font-semibold text-gray-900">Something went wrong</h2>
      <p className="mt-2 text-gray-600">{error.message}</p>
      <button onClick={resetErrorBoundary} className="mt-4 btn-primary">
        Try again
      </button>
    </div>
  );
}
```

### API Error Handling Hook

```typescript
function useApiError() {
  return (error: unknown) => {
    if (error instanceof Response) {
      const data = await error.json();
      toast.error(data.error.message);
    } else {
      toast.error('Connection lost — check your internet');
    }
  };
}
```

## Network Error States

| State | User Sees | Recovery |
|-------|-----------|----------|
| Offline | "You're offline — we'll retry when connected" | Auto-retry on reconnect |
| Timeout | "Taking longer than usual — hang tight" | Auto-retry with backoff |
| 500 | "Something went wrong on our end — try again" | Retry button |
| 404 | "Page not found — let's get you back on track" | Link to dashboard |
| 403 | "You don't have access to this — sign in?" | Login link |
