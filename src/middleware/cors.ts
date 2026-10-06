import { Request, Response, NextFunction } from 'express';
import { ForbiddenOriginError } from '../errors/app-error.js';

const LOCALHOST_ORIGIN_REGEX = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;

  // Requests without Origin header (native mobile apps, curl, server-to-server) are permitted
  if (!origin) {
    next();
    return;
  }

  // Strictly allow localhost and 127.0.0.1 origins
  if (LOCALHOST_ORIGIN_REGEX.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
    return;
  }

  // Reject foreign origins with 403 Forbidden
  next(new ForbiddenOriginError(`Origin "${origin}" is not allowed by CORS policy.`));
}
