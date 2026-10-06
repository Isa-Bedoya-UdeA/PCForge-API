import { Request, Response, NextFunction } from 'express';
import { ComponentsService } from '../services/components.service.js';

export class CategoriesController {
  constructor(private readonly service: ComponentsService) {}

  public getCategories = (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const response = this.service.getCategories();
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
