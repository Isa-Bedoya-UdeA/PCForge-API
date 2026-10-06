import { Request, Response, NextFunction } from 'express';
import { ComponentsService } from '../services/components.service.js';
import { ComponentQueryDto } from '../dto/component-query.dto.js';

export class ComponentsController {
  constructor(private readonly service: ComponentsService) {}

  public getComponents = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const query = (res.locals.query ?? req.query) as unknown as ComponentQueryDto;
      const response = this.service.getComponents(query);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getComponentById = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const params = res.locals.params as { id?: string } | undefined;
      const id = params?.id ?? (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
      const response = this.service.getComponentById(id);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
