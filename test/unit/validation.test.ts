import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { validateQuery, validateParams } from '../../src/middleware/validation.js';
import { ComponentQuerySchema } from '../../src/dto/component-query.dto.js';
import { ComponentIdParamSchema } from '../../src/dto/component-param.dto.js';
import { UnsupportedParameterError, ValidationError } from '../../src/errors/app-error.js';
import { ErrorCode } from '../../src/errors/error-codes.js';

describe('validation middleware', () => {
  describe('validateQuery', () => {
    it('accepts valid query parameters and calls next', () => {
      const middleware = validateQuery(ComponentQuerySchema);
      const req = {
        query: {
          category: 'CPU',
          page: '2',
          pageSize: '20',
          search: 'Ryzen',
        },
      } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.query).toEqual({
        category: 'CPU',
        page: 2,
        pageSize: 20,
        search: 'Ryzen',
      });
    });

    it('rejects unsupported query parameters with UnsupportedParameterError', () => {
      const middleware = validateQuery(ComponentQuerySchema);
      const req = {
        query: {
          category: 'CPU',
          unknownFilter: 'malicious',
        },
      } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(UnsupportedParameterError);
      expect((error as UnsupportedParameterError).code).toBe(ErrorCode.UNSUPPORTED_PARAMETER);
    });

    it('rejects invalid page size with ValidationError', () => {
      const middleware = validateQuery(ComponentQuerySchema);
      const req = {
        query: {
          pageSize: '15', // only 10, 20, 30, 40, 50 allowed
        },
      } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).code).toBe(ErrorCode.VALIDATION_ERROR);
    });
  });

  describe('validateParams', () => {
    it('accepts valid id and calls next', () => {
      const middleware = validateParams(ComponentIdParamSchema);
      const req = {
        params: {
          id: 'test-uuid-1234',
        },
      } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.params).toEqual({
        id: 'test-uuid-1234',
      });
    });

    it('rejects empty id or invalid characters with ValidationError', () => {
      const middleware = validateParams(ComponentIdParamSchema);
      const req = {
        params: {
          id: '../../etc/passwd',
        },
      } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
