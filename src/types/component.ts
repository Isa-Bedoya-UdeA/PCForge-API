import { ComponentCategory } from '../constants/categories.js';

export interface NormalizedComponent {
  id: string;
  category: ComponentCategory;
  name: string;
  manufacturer: string | null;
  specifications: Record<string, unknown>;
}

export interface ComponentFilterQuery {
  category?: ComponentCategory;
  search?: string;
  q?: string;
  manufacturer?: string;
  page?: number;
  pageSize?: number;
  [key: string]: unknown;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
