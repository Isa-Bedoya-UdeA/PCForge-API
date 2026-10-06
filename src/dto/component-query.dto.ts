import { z } from 'zod';
import { COMPONENT_CATEGORIES } from '../constants/categories.js';

export const ComponentQuerySchema = z
  .object({
    page: z
      .string()
      .optional()
      .default('1')
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(1, 'page must be greater than or equal to 1')),
    pageSize: z
      .string()
      .optional()
      .default('50')
      .transform((val) => parseInt(val, 10))
      .pipe(
        z
          .number()
          .int()
          .refine(
            (val) => [10, 20, 30, 40, 50].includes(val),
            'pageSize must be one of: 10, 20, 30, 40, 50'
          )
      ),
    category: z.enum(COMPONENT_CATEGORIES).optional(),
    search: z
      .string()
      .trim()
      .max(100, 'search query cannot exceed 100 characters')
      .optional(),
    q: z
      .string()
      .trim()
      .max(100, 'q search query cannot exceed 100 characters')
      .optional(),
    manufacturer: z
      .string()
      .trim()
      .max(100, 'manufacturer filter cannot exceed 100 characters')
      .optional(),
  })
  .strict();

export type ComponentQueryDto = z.infer<typeof ComponentQuerySchema>;
