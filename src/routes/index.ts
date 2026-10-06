import { Router } from 'express';
import { ComponentsService } from '../services/components.service.js';
import { CategoriesController } from '../controllers/categories.controller.js';
import { ComponentsController } from '../controllers/components.controller.js';
import { createHealthRouter } from './health.routes.js';
import { createCategoriesRouter } from './categories.routes.js';
import { createComponentsRouter } from './components.routes.js';

export function createApiRouter(service: ComponentsService): Router {
  const router = Router();

  const categoriesController = new CategoriesController(service);
  const componentsController = new ComponentsController(service);

  router.use(createHealthRouter());
  router.use(createCategoriesRouter(categoriesController));
  router.use(createComponentsRouter(componentsController));

  return router;
}
