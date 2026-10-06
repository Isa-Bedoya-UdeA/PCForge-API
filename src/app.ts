import express, { Express } from 'express';
import { ComponentRepository } from './repositories/component.repository.js';
import { JsonComponentRepository } from './repositories/json-component.repository.js';
import { ComponentsService } from './services/components.service.js';
import { createApiRouter } from './routes/index.js';
import { corsMiddleware } from './middleware/cors.js';
import { notFoundHandler } from './middleware/not-found.js';
import { errorHandler } from './middleware/error-handler.js';

export function createApp(repository?: ComponentRepository): Express {
  const app = express();

  const repo = repository ?? new JsonComponentRepository();
  const service = new ComponentsService(repo);

  // Security headers & localhost CORS
  app.use(corsMiddleware);

  // JSON body parser
  app.use(express.json());

  // Mount API router
  app.use('/api', createApiRouter(service));

  // 404 handler for unmatched routes
  app.use(notFoundHandler);

  // Centralized error handler
  app.use(errorHandler);

  return app;
}
