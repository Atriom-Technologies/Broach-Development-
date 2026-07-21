import { Module, Global, Provider, OnApplicationBootstrap, OnApplicationShutdown, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';
import { AppLogger } from 'src/logger/logger.service';

export const REDIS_CACHE_CLIENT = 'REDIS_CACHE_CLIENT';

const RedisCacheProvider: Provider = {
  provide: REDIS_CACHE_CLIENT,
  inject: [ConfigService, AppLogger],
  useFactory: (configService: ConfigService, logger: AppLogger) => {
    logger.setContext('RedisCacheProvider');
    const cacheOptions = configService.get<{ url: string } & RedisOptions>('cache')!;

    if (!cacheOptions || !cacheOptions.url) {
      throw new Error('Redis configuration url is missing');
    }

    const { url, ...options } = cacheOptions;

    // Returns instantly. NestJS will not block or pause application boot.
    const client = new Redis(url, options);

    //  CRITICAL BACKGROUND LISTENER:
    // This catches 'EAI_AGAIN' network errors safely in the background so Node.js never crashes.
    client.on('error', (err) => {
      logger.error(`[Redis Cache Background Error]: ${err.message}`);
    });

    return client;
  },
};

@Global()
@Module({
  providers: [RedisCacheProvider, AppLogger],
  exports: [REDIS_CACHE_CLIENT],
})
export class RedisCacheModule implements OnApplicationBootstrap, OnApplicationShutdown {
  // Inject the client directly into the module class to handle lifecycles cleanly
  constructor(
    @Inject(REDIS_CACHE_CLIENT) private readonly redisClient: Redis,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(RedisCacheModule.name);
  }

  onApplicationBootstrap() {
    this.redisClient.on('ready', () => {
      this.logger.log('[Redis Cache] Connected and fully operational in background.');
    });
  }

  async onApplicationShutdown() {
    this.logger.log('[Redis Cache] Closing connection safely...');
    await this.redisClient.quit();
  }
}
