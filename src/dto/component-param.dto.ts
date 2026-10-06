import { z } from 'zod';

export const ComponentIdParamSchema = z
  .object({
    id: z
      .string()
      .trim()
      .min(1, 'Component id is required')
      .max(100, 'Component id is too long')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Component id contains invalid characters'),
  })
  .strict();

export type ComponentIdParamDto = z.infer<typeof ComponentIdParamSchema>;
