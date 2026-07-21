import { registerAs } from '@nestjs/config';
import { ConnectionOptions } from 'bullmq';

export default registerAs(
  'cache',
  (): ConnectionOptions => ({
    url: process.env.REDIS_URL,
    maxRetriesPerRequest: 3,
    connectTimeout: 5000,
    tls: process.env.REDIS_URL?.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  }),
);
