import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { COMPONENT_CATEGORIES } from '../../src/constants/categories.js';
import { ComponentRepository } from '../../src/repositories/component.repository.js';

describe('GET /api/categories', () => {
  const mockRepo: ComponentRepository = {
    getCategories: () => [...COMPONENT_CATEGORIES],
    findById: () => null,
    findMany: () => ({ items: [], total: 0, page: 1, pageSize: 50, totalPages: 0 }),
  };
  const app = createApp(mockRepo);

  it('returns 200 with list of canonical categories and total count', async () => {
    const res = await request(app).get('/api/categories');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: COMPONENT_CATEGORIES,
      total: COMPONENT_CATEGORIES.length,
    });
  });
});
