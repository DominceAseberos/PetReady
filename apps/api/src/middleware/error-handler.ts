import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', 404, `${resource} not found`);
  }
}

export class ValidationError extends AppError {
  public details: Record<string, string>;
  constructor(details: Record<string, string>) {
    super('VALIDATION_ERROR', 400, 'Please fix the highlighted fields');
    this.details = details;
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super('UNAUTHORIZED', 401, 'Please sign in to continue');
  }
}

export class ConflictError extends AppError {
  constructor(code: string, message: string) {
    super(code, 409, message);
  }
}

export class RateLimitError extends AppError {
  constructor() {
    super('RATE_LIMITED', 429, 'Too many requests — please wait a moment');
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  // Known application errors
  if (err instanceof AppError) {
    const response: Record<string, unknown> = {
      error: { code: err.code, message: err.message },
    };
    if (err instanceof ValidationError) {
      (response.error as Record<string, unknown>).details = err.details;
    }
    return res.status(err.statusCode).json(response);
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    const details = err.errors.reduce(
      (acc, e) => {
        acc[e.path.join('.')] = e.message;
        return acc;
      },
      {} as Record<string, string>,
    );
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Please fix the following fields', details },
    });
  }

  // Unknown errors — log full details, return generic message
  console.error('[error]', err.message, err.stack);
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something unexpected happened — please try again' },
  });
}
