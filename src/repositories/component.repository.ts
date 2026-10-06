import { ComponentCategory } from '../constants/categories.js';
import {
  NormalizedComponent,
  ComponentFilterQuery,
  PaginatedResult,
} from '../types/component.js';

export interface ComponentRepository {
  getCategories(): ComponentCategory[];
  findById(id: string): NormalizedComponent | null;
  findMany(query: ComponentFilterQuery): PaginatedResult<NormalizedComponent>;
}
