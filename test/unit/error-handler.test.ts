import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { z, ZodError } from 'zod';
import { errorHandler } from '../../src/middleware/error-handler.js';
import { ValidationError } from '../../src/errors/app-error.js';
import { ErrorCode } from '../../src/errors/error-codes.js';

function createMockResponse() {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

describe('errorHandler middleware', () => {
  it('formats AppError instances correctly with their status and code', () => {
    const error = new ValidationError('Invalid input provided', [{ field: 'page', message: 'Must be >= 1' }]);
    const req = {} as Request;
    const res = createMockResponse();
    const next = vi.fn();

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid input provided',
        details: [{ field: 'page', message: 'Must be >= 1' }],
      },
    });
  });

  it('formats ZodError instances with 400 VALIDATION_ERROR and mapped issues', () => {
    const schema = z.object({ age: z.number().min(18) });
    let zodError: ZodError | null = null;

    try {
      schema.parse({ age: 10 });
    } catch (err) {
      zodError = err as ZodError;
    }

    expect(zodError).not.toBeNull();

    const req = {} as Request;
    const res = createMockResponse();
    const next = vi.fn();

    errorHandler(zodError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Validation failed for request parameters.',
        }),
      })
    );
  });

  it('safely catches unknown exceptions and returns generic 500 without leaking stack traces', () => {
    const internalError = new Error('Database password is root! Path: /var/secrets/key');
    const req = {} as Request;
    const res = createMockResponse();
    const next = vi.fn();

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(internalError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'An unexpected internal server error occurred.',
      },
    });

    consoleSpy.mockRestore();
  });
});
