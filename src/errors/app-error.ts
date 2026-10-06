import { ErrorCode, ErrorCodeType } from './error-codes.js';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCodeType;
  public readonly details?: unknown[];

  constructor(statusCode: number, code: ErrorCodeType, message: string, details?: unknown[]) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed for request parameters', details?: unknown[]) {
    super(400, ErrorCode.VALIDATION_ERROR, message, details);
    this.name = 'ValidationError';
  }
}

export class UnsupportedParameterError extends AppError {
  constructor(message: string, details?: unknown[]) {
    super(400, ErrorCode.UNSUPPORTED_PARAMETER, message, details);
    this.name = 'UnsupportedParameterError';
  }
}

export class InvalidCategoryError extends AppError {
  constructor(category: string) {
    super(400, ErrorCode.INVALID_CATEGORY, `Category "${category}" is not supported.`);
    this.name = 'InvalidCategoryError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code: ErrorCodeType = ErrorCode.NOT_FOUND) {
    super(404, code, message);
    this.name = 'NotFoundError';
  }
}

export class PageNotFoundError extends AppError {
  constructor(page: number, totalPages: number) {
    super(
      404,
      ErrorCode.PAGE_NOT_FOUND,
      `Requested page ${page} is beyond available total pages (${totalPages}).`
    );
    this.name = 'PageNotFoundError';
  }
}

export class ComponentNotFoundError extends AppError {
  constructor(id: string) {
    super(404, ErrorCode.COMPONENT_NOT_FOUND, `Component with id "${id}" was not found.`);
    this.name = 'ComponentNotFoundError';
  }
}

export class ForbiddenOriginError extends AppError {
  constructor(message = 'Origin not allowed by CORS policy') {
    super(403, ErrorCode.FORBIDDEN_ORIGIN, message);
    this.name = 'ForbiddenOriginError';
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'An unexpected server error occurred') {
    super(500, ErrorCode.INTERNAL_SERVER_ERROR, message);
    this.name = 'InternalServerError';
  }
}
