import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { NotificationModule } from 'src/broach/notification/notification.module';
import { ServiceRequestModule } from 'src/broach/service-request/service-request.module';
import { NOTIFICATION_QUEUE } from 'src/shared/constant/case.constants';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: NOTIFICATION_QUEUE,
    }),
    NotificationModule,
    ServiceRequestModule,
  ],
  exports: [BullModule],
})
export class QueueMOdule {}
