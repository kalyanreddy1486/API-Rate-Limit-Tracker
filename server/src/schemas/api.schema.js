const z = require('zod');

const createAPISchema = z.object({
  serviceName: z.string().min(1, 'Service name is required'),
  apiKey: z.string().min(1, 'API key is required'),
  rateLimit: z.number().int().positive('Rate limit must be positive'),
  rateLimitPeriod: z.enum(['minute', 'hour', 'day', 'month']),
});

const updateAPISchema = z.object({
  serviceName: z.string().min(1).optional(),
  apiKey: z.string().min(1).optional(),
  rateLimit: z.number().int().positive().optional(),
  rateLimitPeriod: z.enum(['minute', 'hour', 'day', 'month']).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

module.exports = { createAPISchema, updateAPISchema };
