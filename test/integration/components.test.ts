import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { ComponentRepository } from '../../src/repositories/component.repository.js';
import { NormalizedComponent } from '../../src/types/component.js';
import { ErrorCode } from '../../src/errors/error-codes.js';

describe('Components endpoints integration', () => {
  const dummyComponents: NormalizedComponent[] = [
    {
      id: 'cpu-1',
      category: 'CPU',
      name: 'AMD Ryzen 7 7800X3D',
      manufacturer: 'AMD',
      specifications: { socket: 'AM5', coreCount: 8 },
    },
    {
      id: 'cpu-2',
      category: 'CPU',
      name: 'Intel Core i7-14700K',
      manufacturer: 'Intel',
      specifications: { socket: 'LGA1700', coreCount: 20 },
    },
    {
      id: 'gpu-1',
      category: 'VIDEO_CARD',
      name: 'NVIDIA GeForce RTX 4080',
      manufacturer: 'NVIDIA',
      specifications: { memoryGb: 16 },
    },
  ];

  const mockRepo: ComponentRepository = {
    getCategories: () => ['CPU', 'VIDEO_CARD'],
    findById: (id: string) => dummyComponents.find((c) => c.id === id) ?? null,
    findMany: (query) => {
      let filtered = [...dummyComponents];
      if (query.category) {
        filtered = filtered.filter((c) => c.category === query.category);
      }
      const rawSearch = query.search ?? query.q;
      if (rawSearch) {
        const s = rawSearch.toLowerCase();
        filtered = filtered.filter(
          (c) => c.name.toLowerCase().includes(s) || c.manufacturer?.toLowerCase().includes(s)
        );
      }
      if (query.manufacturer) {
        const m = query.manufacturer.toLowerCase();
        filtered = filtered.filter((c) => c.manufacturer?.toLowerCase() === m);
      }

      const page = query.page ?? 1;
      const pageSize = query.pageSize ?? 50;
      const total = filtered.length;
      const totalPages = Math.ceil(total / pageSize);
      const start = (page - 1) * pageSize;
      const items = filtered.slice(start, start + pageSize);

      return {
        items,
        total,
        page,
        pageSize,
        totalPages,
      };
    },
  };

  const app = createApp(mockRepo);

  describe('GET /api/components', () => {
    it('returns default page 1 and pageSize 50', async () => {
      const res = await request(app).get('/api/components');

      expect(res.status).toBe(200);
      expect(res.body.pagination).toEqual({
        page: 1,
        pageSize: 50,
        total: 3,
        totalPages: 1,
      });
      expect(res.body.data).toHaveLength(3);
    });

    it('filters by category', async () => {
      const res = await request(app).get('/api/components?category=VIDEO_CARD');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].id).toBe('gpu-1');
    });

    it('returns 400 INVALID_CATEGORY when unknown category is requested', async () => {
      const res = await request(app).get('/api/components?category=NOT_A_CATEGORY');

      expect(res.status).toBe(400);
      expect(res.body.error).toEqual(
        expect.objectContaining({
          code: ErrorCode.INVALID_CATEGORY,
        })
      );
    });

    it('filters by search term', async () => {
      const res = await request(app).get('/api/components?search=Ryzen');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toContain('Ryzen');
    });

    it('filters by manufacturer', async () => {
      const res = await request(app).get('/api/components?manufacturer=Intel');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].manufacturer).toBe('Intel');
    });

    it('returns 200 with empty array when no records match filter (total === 0)', async () => {
      const res = await request(app).get('/api/components?search=NonExistentDevice');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.pagination).toEqual({
        page: 1,
        pageSize: 50,
        total: 0,
        totalPages: 0,
      });
    });

    it('returns 404 PAGE_NOT_FOUND when page > totalPages on non-empty results (TD-008)', async () => {
      const res = await request(app).get('/api/components?page=99');

      expect(res.status).toBe(404);
      expect(res.body.error).toEqual(
        expect.objectContaining({
          code: ErrorCode.PAGE_NOT_FOUND,
        })
      );
    });

    it('returns 400 UNSUPPORTED_PARAMETER for unrecognized query parameters', async () => {
      const res = await request(app).get('/api/components?illegalParam=123');

      expect(res.status).toBe(400);
      expect(res.body.error).toEqual(
        expect.objectContaining({
          code: ErrorCode.UNSUPPORTED_PARAMETER,
        })
      );
    });

    it('returns 400 VALIDATION_ERROR for non-whitelisted pageSize', async () => {
      const res = await request(app).get('/api/components?pageSize=25');

      expect(res.status).toBe(400);
      expect(res.body.error).toEqual(
        expect.objectContaining({
          code: ErrorCode.VALIDATION_ERROR,
        })
      );
    });
  });

  describe('GET /api/components/:id', () => {
    it('returns component by ID with 200', async () => {
      const res = await request(app).get('/api/components/cpu-1');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(dummyComponents[0]);
    });

    it('returns 404 COMPONENT_NOT_FOUND for non-existent component', async () => {
      const res = await request(app).get('/api/components/unknown-id-999');

      expect(res.status).toBe(404);
      expect(res.body.error).toEqual(
        expect.objectContaining({
          code: ErrorCode.COMPONENT_NOT_FOUND,
        })
      );
    });
  });
});
