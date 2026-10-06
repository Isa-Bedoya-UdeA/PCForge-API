import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { ComponentRepository } from '../../src/repositories/component.repository.js';
import { ErrorCode } from '../../src/errors/error-codes.js';

describe('Error handling integration', () => {
  it('returns 404 NOT_FOUND for unknown routes', async () => {
    const mockRepo: ComponentRepository = {
      getCategories: () => [],
      findById: () => null,
      findMany: () => ({ items: [], total: 0, page: 1, pageSize: 50, totalPages: 0 }),
    };
    const app = createApp(mockRepo);

    const res = await request(app).get('/api/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: {
        code: ErrorCode.NOT_FOUND,
        message: 'Route "GET /api/does-not-exist" was not found.',
      },
    });
  });

  it('returns safe 500 INTERNAL_SERVER_ERROR without leaking stack traces on unexpected repository failures', async () => {
    const failingRepo: ComponentRepository = {
      getCategories: () => {
        throw new Error('Database connection string leak: postgres://root:secret@10.0.0.1/db');
      },
      findById: () => null,
      findMany: () => ({ items: [], total: 0, page: 1, pageSize: 50, totalPages: 0 }),
    };
    const app = createApp(failingRepo);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app).get('/api/categories');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'An unexpected internal server error occurred.',
      },
    });
    // Ensure no stack trace or sensitive info in response
    expect(JSON.stringify(res.body)).not.toContain('Database connection string leak');
    expect(JSON.stringify(res.body)).not.toContain('postgres://');
    expect(JSON.stringify(res.body)).not.toContain('stack');

    consoleSpy.mockRestore();
  });
});
