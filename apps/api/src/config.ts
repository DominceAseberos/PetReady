/**
 * Application configuration with environment variable validation.
 * Crashes immediately at startup if required variables are missing.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.error(`[config] FATAL: Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

export const config = {
  port: parseInt(optionalEnv('PORT', '3001'), 10),
  nodeEnv: optionalEnv('NODE_ENV', 'development'),
  database: {
    url: requireEnv('DATABASE_URL'),
  },
  jwt: {
    secret: requireEnv('JWT_SECRET'),
    expiresIn: '7d',
  },
  cors: {
    origin: optionalEnv('CORS_ORIGIN', 'http://localhost:3000'),
  },
  redis: {
    url: optionalEnv('REDIS_URL', 'redis://localhost:6379'),
  },
} as const;
