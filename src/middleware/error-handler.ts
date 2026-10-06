import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/app-error.js';
import { ErrorCode } from '../errors/error-codes.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));

    res.status(400).json({
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed for request parameters.',
        details,
      },
    });
    return;
  }

  // Safe internal fallback: never leak stack traces, operating system paths, or internal exceptions
  console.error('[UNHANDLED ERROR]', err);

  res.status(500).json({
    error: {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: 'An unexpected internal server error occurred.',
    },
  });
}
