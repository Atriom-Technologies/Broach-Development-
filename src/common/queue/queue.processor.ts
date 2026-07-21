import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationService } from 'src/broach/notification/notification.service';
import { ServiceRequestService } from 'src/broach/service-request/service-request.service';

@Processor('notification-queue')
export class AppProcessor extends WorkerHost {
  private readonly logger = new Logger(AppProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly serviceRequestService: ServiceRequestService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.log(`[Background Worker] Processing job: "${job.name}"`);

    switch (job.name) {
      case 'process-case-report': {
        const { caseId, userId } = job.data;
        const caseDetails = await this.prisma.caseDetails.findUnique({ where: { id: caseId } });
        if (!caseDetails) {
          this.logger.warn(`Case ${caseId} not found — skipping notification.`);
          break;
        }
        await this.notificationService.notifyNewCase(caseDetails, userId);
        break;
      }

      // case 'process-service-request': {
      //   const { requestId } = job.data;
      //   await this.serviceRequestService.handleBackgroundRequest(requestId);
      //   break;
      // }

      default:
        this.logger.warn(`Unhandled job name: ${job.name}`);
    }
  }
}
