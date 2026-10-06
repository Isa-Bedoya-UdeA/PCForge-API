import { Request, Response } from 'express';
import { ErrorCode } from '../errors/error-codes.js';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: ErrorCode.NOT_FOUND,
      message: `Route "${req.method} ${req.path}" was not found.`,
    },
  });
}
