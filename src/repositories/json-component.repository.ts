import { COMPONENT_CATEGORIES, ComponentCategory } from '../constants/categories.js';
import { CatalogSnapshot, loadCatalogSnapshot } from '../data/loader.js';
import {
  NormalizedComponent,
  ComponentFilterQuery,
  PaginatedResult,
} from '../types/component.js';
import { ComponentRepository } from './component.repository.js';

export class JsonComponentRepository implements ComponentRepository {
  private readonly snapshot: CatalogSnapshot;

  constructor(snapshot?: CatalogSnapshot) {
    this.snapshot = snapshot ?? loadCatalogSnapshot();
  }

  public getCategories(): ComponentCategory[] {
    return [...COMPONENT_CATEGORIES];
  }

  public findById(id: string): NormalizedComponent | null {
    if (!id || typeof id !== 'string') {
      return null;
    }
    return this.snapshot.byId.get(id) ?? null;
  }

  public findMany(query: ComponentFilterQuery): PaginatedResult<NormalizedComponent> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.max(1, query.pageSize ?? 50);

    let candidates: NormalizedComponent[];

    if (query.category) {
      candidates = this.snapshot.byCategory.get(query.category) ?? [];
    } else {
      candidates = this.snapshot.components;
    }

    let filtered = candidates;

    // Apply text search on name or manufacturer
    const rawSearch = query.search ?? query.q;
    if (rawSearch && typeof rawSearch === 'string' && rawSearch.trim() !== '') {
      const searchTerm = rawSearch.trim().toLowerCase();
      filtered = filtered.filter((item) => {
        const nameMatch = item.name.toLowerCase().includes(searchTerm);
        const manufacturerMatch = item.manufacturer?.toLowerCase().includes(searchTerm) ?? false;
        return nameMatch || manufacturerMatch;
      });
    }

    // Apply manufacturer exact/case-insensitive filter if provided
    if (query.manufacturer && typeof query.manufacturer === 'string' && query.manufacturer.trim() !== '') {
      const targetManufacturer = query.manufacturer.trim().toLowerCase();
      filtered = filtered.filter(
        (item) => item.manufacturer?.toLowerCase() === targetManufacturer
      );
    }

    // Apply explicit specification filters
    const reservedKeys = new Set(['category', 'search', 'q', 'manufacturer', 'page', 'pageSize']);
    const customFilterKeys = Object.keys(query).filter((k) => !reservedKeys.has(k) && query[k] !== undefined);

    if (customFilterKeys.length > 0) {
      filtered = filtered.filter((item) => {
        for (const key of customFilterKeys) {
          const expectedVal = query[key];
          const actualVal = item.specifications[key];

          if (actualVal === undefined) {
            return false;
          }

          if (typeof expectedVal === 'string' && typeof actualVal === 'string') {
            if (expectedVal.toLowerCase() !== actualVal.toLowerCase()) {
              return false;
            }
          } else if (String(expectedVal) !== String(actualVal)) {
            return false;
          }
        }
        return true;
      });
    }

    const total = filtered.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

    const startIndex = (page - 1) * pageSize;
    const items = filtered.slice(startIndex, startIndex + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  }
}
