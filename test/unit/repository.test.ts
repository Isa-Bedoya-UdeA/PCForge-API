import { describe, it, expect, beforeAll } from 'vitest';
import { JsonComponentRepository } from '../../src/repositories/json-component.repository.js';
import { loadCatalogSnapshot, CatalogSnapshot } from '../../src/data/loader.js';
import { COMPONENT_CATEGORIES } from '../../src/constants/categories.js';

describe('JsonComponentRepository (src/repositories/json-component.repository.ts)', () => {
  let repository: JsonComponentRepository;
  let snapshot: CatalogSnapshot;

  beforeAll(() => {
    // Load a small sample (10 items per category) for speedy unit tests
    snapshot = loadCatalogSnapshot({ maxPerCategory: 10, validateSchemas: false });
    repository = new JsonComponentRepository(snapshot);
  });

  it('getCategories() returns all 8 canonical categories', () => {
    const categories = repository.getCategories();
    expect(categories).toEqual(COMPONENT_CATEGORIES);
    expect(categories.length).toBe(8);
  });

  it('findById() returns the normalized component when valid ID is provided', () => {
    const firstItem = snapshot.components[0];
    const found = repository.findById(firstItem.id);

    expect(found).not.toBeNull();
    expect(found?.id).toBe(firstItem.id);
    expect(found?.name).toBe(firstItem.name);
    expect(found?.category).toBe(firstItem.category);
  });

  it('findById() returns null for unknown ID or empty string', () => {
    expect(repository.findById('non-existent-id')).toBeNull();
    expect(repository.findById('')).toBeNull();
  });

  it('findMany() returns paginated list of all items by default', () => {
    const result = repository.findMany({ page: 1, pageSize: 10 });

    expect(result.items.length).toBe(10);
    expect(result.total).toBe(80); // 8 categories * 10 items
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(result.totalPages).toBe(8);
  });

  it('findMany() filters strictly by canonical category', () => {
    const result = repository.findMany({ category: 'CPU', page: 1, pageSize: 50 });

    expect(result.items.length).toBe(10);
    expect(result.total).toBe(10);
    expect(result.items.every((item) => item.category === 'CPU')).toBe(true);
  });

  it('findMany() performs case-insensitive text search on name or manufacturer', () => {
    const sample = snapshot.components[0];
    const searchTerm = sample.name.slice(0, 4);

    const result = repository.findMany({ q: searchTerm });
    expect(result.total).toBeGreaterThan(0);
    expect(
      result.items.every(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ).toBe(true);
  });

  it('findMany() applies custom specification filter', () => {
    const cpuSample = snapshot.byCategory.get('CPU')?.[0];
    expect(cpuSample).toBeDefined();

    const socketVal = cpuSample?.specifications.socket;
    if (socketVal) {
      const result = repository.findMany({ category: 'CPU', socket: socketVal });
      expect(result.total).toBeGreaterThan(0);
      expect(result.items.every((item) => item.specifications.socket === socketVal)).toBe(true);
    }
  });

  it('findMany() preserves deterministic sort order (category then id)', () => {
    const result = repository.findMany({ page: 1, pageSize: 80 });

    for (let i = 0; i < result.items.length - 1; i++) {
      const current = result.items[i];
      const next = result.items[i + 1];

      const catComparison = current.category.localeCompare(next.category);
      if (catComparison === 0) {
        expect(current.id.localeCompare(next.id)).toBeLessThanOrEqual(0);
      }
    }
  });

  it('handles empty results and calculates totalPages = 0', () => {
    const result = repository.findMany({ q: 'unmatched-search-term-xyz-123' });
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });
});
