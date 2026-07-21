import { Injectable, Inject } from '@nestjs/common';
import { REDIS_CACHE_CLIENT } from 'src/common/redis/redis-cache.module';
import { PrismaService } from 'src/prisma/prisma.service';
import Redis from 'ioredis';
import * as PrismaClient from '@prisma/client';
import { humanize, parseEnum } from 'src/utils/formatString';
import { AppLogger } from 'src/logger/logger.service';

// 1. Map your allowed model keys strictly to their exact Prisma Client Delegate keys
type LookupModelKeys = 'sector' | 'caseType' | 'serviceType' | 'vulnerabilityStatus';

// This tells TypeScript: "Whatever object we access possesses a findMany method that yields an id and name."
interface GenericPrismaDelegate {
  findMany(args?: { select?: { id?: boolean; name?: boolean } }): Promise<Array<{ id: string; name: string }>>;
}

// 2. Define a strict shape for what your frontend metadata collections return
export interface LookupItem {
  id: string;
  name: string;
}

@Injectable()
export class LookupService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CACHE_CLIENT) private readonly redis: Redis,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(LookupService.name);
  }

  /**
   * PURE CODE ENUMS (Type-Safe via Prisma Types)
   */
  getStaticEnums(): Record<string, { value: string; label: string }[]> {
    const enums = {
      userType: PrismaClient.UserType,
      gender: PrismaClient.Gender,
      organizationSize: PrismaClient.OrgSize,
      whoIsReporting: PrismaClient.WhoIsReporting,
      location: PrismaClient.Location,
      caseStatus: PrismaClient.CaseStatus,
      ageRange: PrismaClient.AgeRange,
      employmentStatus: PrismaClient.EmploymentStatus,
      noOfAssailants: PrismaClient.NoOfAssailants,
      maritalStatus: PrismaClient.MaritalStatus,
    };

    const formatted: Record<string, { value: string; label: string }[]> = {};
    for (const [key, enumObj] of Object.entries(enums)) {
      formatted[key] = parseEnum(enumObj, key);
    }
    return formatted;
  }

  /**
   * CACHED DATABASE TABLES
   * Type-safe by querying Prisma's internal client delegates through mapped index access
   */
  async getDatabaseCollections(modelName: LookupModelKeys): Promise<LookupItem[]> {
    const cacheKey = `lookup:${modelName}`;
    // Try to read from cache safely
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        try {
          return JSON.parse(cached) as LookupItem[];
        } catch {
          // Corrupted/malformed data — clear it out asynchronously
          this.redis.del(cacheKey).catch(() => {});
        }
      }
    } catch (redisError) {
      // Redis connection is down. Bypass to DB so the app stays up.
      if (typeof this.logger !== 'undefined') {
        const error = redisError instanceof Error ? redisError.stack : String(redisError);
        this.logger.error(`[LookupService] Redis read failed for key ${cacheKey}`, error);
      }
    }

    // Cast the model bracket retrieval directly to our structural interface.
    // Explicitly grab the exact model delegate from Prisma using mapped type indexing
    const delegate = this.prisma[modelName] as unknown as GenericPrismaDelegate;

    // Querying the model delegate is completely type-safe now
    const data = await delegate.findMany({
      select: { id: true, name: true },
    });

    const formatted: LookupItem[] = data.map((row) => ({
      id: row.id,
      name: humanize(row.name),
    }));

    if (formatted.length > 0) {
      this.redis.set(cacheKey, JSON.stringify(formatted), 'EX', 86400);
    }
    return formatted;
  }

  /**
   * SINGLE ROW RESOLVER (Type-Safe item matching)
   */
  async findById(modelName: LookupModelKeys, id: string): Promise<LookupItem | null> {
    const list = await this.getDatabaseCollections(modelName);
    return list.find((item) => item.id === id) || null;
  }
}
