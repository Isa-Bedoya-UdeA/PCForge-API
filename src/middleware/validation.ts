import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { InvalidCategoryError, UnsupportedParameterError, ValidationError } from '../errors/app-error.js';

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.query);
      if (res && res.locals) {
        res.locals.query = parsed;
      }
      Object.defineProperty(req, 'query', {
        value: parsed,
        writable: true,
        configurable: true,
        enumerable: true,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        // Check if the issue is unrecognized keys
        const unrecognizedIssue = err.issues.find(
          (issue) => issue.code === 'unrecognized_keys'
        );

        if (unrecognizedIssue && 'keys' in unrecognizedIssue) {
          const keys = (unrecognizedIssue as { keys: string[] }).keys;
          next(
            new UnsupportedParameterError(
              `Query parameter "${keys.join(', ')}" is not supported by this endpoint.`
            )
          );
          return;
        }

        // Check if category is invalid
        const categoryIssue = err.issues.find((issue) => issue.path.includes('category'));
        if (categoryIssue) {
          const rawCategory = (req.query as Record<string, unknown> | undefined)?.category;
          next(new InvalidCategoryError(String(rawCategory ?? '')));
          return;
        }

        const details = err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }));

        next(new ValidationError('Validation failed for query parameters', details));
        return;
      }
      next(err);
    }
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.params);
      if (res && res.locals) {
        res.locals.params = parsed;
      }
      Object.defineProperty(req, 'params', {
        value: parsed,
        writable: true,
        configurable: true,
        enumerable: true,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }));
        next(new ValidationError('Validation failed for route parameters', details));
        return;
      }
      next(err);
    }
  };
}
