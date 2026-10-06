import { Router } from 'express';
import { ComponentsController } from '../controllers/components.controller.js';
import { validateQuery, validateParams } from '../middleware/validation.js';
import { ComponentQuerySchema } from '../dto/component-query.dto.js';
import { ComponentIdParamSchema } from '../dto/component-param.dto.js';

export function createComponentsRouter(controller: ComponentsController): Router {
  const router = Router();

  router.get(
    '/components',
    validateQuery(ComponentQuerySchema),
    controller.getComponents
  );

  router.get(
    '/components/:id',
    validateParams(ComponentIdParamSchema),
    controller.getComponentById
  );

  return router;
}
