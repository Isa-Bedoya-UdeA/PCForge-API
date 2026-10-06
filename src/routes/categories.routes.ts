import { Router } from 'express';
import { CategoriesController } from '../controllers/categories.controller.js';

export function createCategoriesRouter(controller: CategoriesController): Router {
  const router = Router();
  router.get('/categories', controller.getCategories);
  return router;
}
