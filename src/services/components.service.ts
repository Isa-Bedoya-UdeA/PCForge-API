import { ComponentRepository } from '../repositories/component.repository.js';
import { ComponentQueryDto } from '../dto/component-query.dto.js';
import { ComponentNotFoundError, PageNotFoundError } from '../errors/app-error.js';
import { NormalizedComponent } from '../types/component.js';
import { ComponentCategory } from '../constants/categories.js';

export interface ComponentListResponse {
  data: NormalizedComponent[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ComponentDetailResponse {
  data: NormalizedComponent;
}

export interface CategoriesResponse {
  data: ComponentCategory[];
  total: number;
}

export class ComponentsService {
  constructor(private readonly repository: ComponentRepository) {}

  public getCategories(): CategoriesResponse {
    const categories = this.repository.getCategories();
    return {
      data: categories,
      total: categories.length,
    };
  }

  public getComponentById(id: string): ComponentDetailResponse {
    const component = this.repository.findById(id);
    if (!component) {
      throw new ComponentNotFoundError(id);
    }
    return {
      data: component,
    };
  }

  public getComponents(query: ComponentQueryDto): ComponentListResponse {
    const result = this.repository.findMany(query);

    // If there are records and the requested page is beyond totalPages, return 404 (TD-008)
    if (result.total > 0 && result.page > result.totalPages) {
      throw new PageNotFoundError(result.page, result.totalPages);
    }

    return {
      data: result.items,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }
}
