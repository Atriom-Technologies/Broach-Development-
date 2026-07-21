import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { REDIS_CACHE_CLIENT } from 'src/common/redis/redis-cache.module';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(REDIS_CACHE_CLIENT) private readonly redis: Redis) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
    });
    const adapter = new PrismaPg(pool);

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /** Called once by PrismaModule to produce the single client the whole app uses. */
  withCacheInvalidation() {
    const redis = this.redis;

    return this.$extends({
      query: {
        caseDetails: {
          async update({ args, query }) {
            const result = await query(args);
            const id = typeof args.where?.id === 'string' ? args.where.id : undefined;
            if (id) await redis.del(`case:details:${id}`);
            return result;
          },
          async updateMany({ args, query }) {
            const result = await query(args);
            const id = typeof args.where?.id === 'string' ? args.where.id : undefined;
            if (id) await redis.del(`case:details:${id}`);
            return result;
          },
        },
      },
    });
  }
}

export type ExtendedPrismaClient = ReturnType<PrismaService['withCacheInvalidation']>;
