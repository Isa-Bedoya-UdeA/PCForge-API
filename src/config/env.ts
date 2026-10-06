/// <reference types="node" />
import process from 'node:process';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z
    .string()
    .optional()
    .default('3000')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(65535)),
  HOST: z.string().optional().default('0.0.0.0'),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .optional()
    .default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  throw new Error('Environment configuration validation failed.');
}

export const env = parsed.data;
