import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { ComponentRepository } from '../../src/repositories/component.repository.js';
import { ErrorCode } from '../../src/errors/error-codes.js';

describe('CORS policy integration', () => {
  const mockRepo: ComponentRepository = {
    getCategories: () => [],
    findById: () => null,
    findMany: () => ({ items: [], total: 0, page: 1, pageSize: 50, totalPages: 0 }),
  };
  const app = createApp(mockRepo);

  it('allows requests without Origin header (mobile apps)', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('allows requests from localhost web origin with CORS headers', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5562');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5562');
  });

  it('allows requests from 127.0.0.1 web origin with CORS headers', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://127.0.0.1:3000');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://127.0.0.1:3000');
  });

  it('handles OPTIONS preflight for allowed localhost origin', async () => {
    const res = await request(app)
      .options('/api/health')
      .set('Origin', 'http://localhost:5562');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5562');
    expect(res.headers['access-control-allow-methods']).toBe('GET, OPTIONS');
  });

  it('rejects external/untrusted web origin with 403 FORBIDDEN_ORIGIN', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://attacker.example.com');

    expect(res.status).toBe(403);
    expect(res.body.error).toEqual(
      expect.objectContaining({
        code: ErrorCode.FORBIDDEN_ORIGIN,
      })
    );
  });
});
