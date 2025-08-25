import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // Automatically cconnects to database when app starts to avoid early connection errors
  async onModuleInit() {
    await this.$connect();
  }

  // Automatically closes database preventing memory leaks, hannging processes, unwanted connections
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
