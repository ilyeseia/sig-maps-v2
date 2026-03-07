// @ts-nocheck
import { z } from 'zod';

// Define environment variables schema
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3002'),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_URL: z.string().url().default('redis://redis:6379'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),

  // Frontend
  FRONTEND_URL: z.string().url(),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
});

// Validate environment variables
const validateEnv = () => {
  try {
    const env = envSchema.parse(process.env);
    return {
      success: true,
      data: env,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment variables validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error('❌ Unexpected error validating environment variables:', error);
    }
    process.exit(1);
  }
};

// Export validated environment variables
const validatedEnv = validateEnv();

export const env = validatedEnv.success
  ? validatedEnv.data
  : {
      NODE_ENV: 'development',
      PORT: 3002,
      DATABASE_URL: '',
      REDIS_URL: 'redis://redis:6379',
      JWT_SECRET: '',
      FRONTEND_URL: '',
      LOG_LEVEL: 'info' as const,
    };
