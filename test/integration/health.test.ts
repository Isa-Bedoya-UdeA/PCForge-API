import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { ComponentRepository } from '../../src/repositories/component.repository.js';

describe('GET /api/health', () => {
  const mockRepo: ComponentRepository = {
    getCategories: () => [],
    findById: () => null,
    findMany: () => ({ items: [], total: 0, page: 1, pageSize: 50, totalPages: 0 }),
  };
  const app = createApp(mockRepo);

  it('returns 200 with service health status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'ok',
      timestamp: expect.any(String),
      service: 'pcforge-api',
      version: '1.0.0',
    });
  });
});
