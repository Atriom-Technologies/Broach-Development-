export const NOTIFICATION_QUEUE = 'notification-queue';
export const CASE_REPORT_JOB = 'process-case-report';
export const SERVICE_REQUEST_JOB = 'service-request-job';
export const NOTIFICATION_JOB_OPTS = {
  attempts: 5,
  backoff: { type: 'exponential' as const, delay: 2000 },
};
