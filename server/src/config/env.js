const z = require('zod');

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ENCRYPTION_KEY: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('Invalid environment variables:', env.error.format());
  process.exit(1);
}

module.exports = env.data;
