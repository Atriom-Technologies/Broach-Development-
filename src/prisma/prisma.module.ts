import { Global, Module } from '@nestjs/common';
import { PrismaService, ExtendedPrismaClient } from './prisma.service';

export const PRISMA_CLIENT = Symbol('PRISMA_CLIENT');

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: PRISMA_CLIENT,
      useFactory: (prisma: PrismaService): ExtendedPrismaClient => prisma.withCacheInvalidation(),
      inject: [PrismaService],
    },
  ],
  exports: [PRISMA_CLIENT],
})
export class PrismaModule {}
