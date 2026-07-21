import { registerAs } from '@nestjs/config';
import { ConnectionOptions } from 'bullmq';

export default registerAs(
  'bull',
  (): ConnectionOptions => ({
    url: process.env.REDIS_URL,
    maxRetriesPerRequest: null,
    tls: process.env.REDIS_URL?.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
  }),
);
