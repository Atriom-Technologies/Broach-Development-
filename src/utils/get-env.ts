import { ConfigService } from '@nestjs/config';

export function getEnvOrThrow<T>(
  config: ConfigService,
  key: string,
  fallback?: T,
): T {
  const value = config.get<T>(key);

  if (value === undefined || value === null) {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required env variable: ${key}`);
  }

  return value;
}
