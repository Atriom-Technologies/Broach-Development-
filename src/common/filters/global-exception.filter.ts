import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { AppLogger } from 'src/logger/logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong. Please try again.';

    // If NestJS HTTP exception → pull status + message
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const resBody = res as { message?: string | string[] };
        message = Array.isArray(resBody.message) ? resBody.message.join(', ') : resBody.message || message;
      } else if (typeof res === 'string') {
        message = res;
      }
    }

    // Prisma unique constraint
    if (exception.code === 'P2002') {
      status = HttpStatus.BAD_REQUEST;
      message = 'This value already exists. Please use another.';
    }

    // Prisma record missing
    if (exception.code === 'P2025') {
      status = HttpStatus.NOT_FOUND;
      message = 'Record not found.';
    }
    const logPayload = {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      status,
      exception: exception.message || exception,
      body: request.body,
    };

    if (status >= 500) {
      // CRITICAL INFRASTRUCTURE FAILURE (Database down, syntax crashes, null pointers)
      // Log full details along with the stack trace for engineering alerts
      this.logger.error(
        `[CRITICAL FAILURE] ${request.method} ${request.url} - Status: ${status}`,
        JSON.stringify({ ...logPayload, stack: exception.stack }),
      );
    } else {
      //  NORMAL CLIENT VARIANCE (Wrong password, missing profile, validation error)
      // Log as a light warning without a heavy stack trace to keep logs clean
      this.logger.warn(`[CLIENT WARN] ${request.method} ${request.url} - Status: ${status} - Msg: ${message}`);
    }

    // Clean response to frontend
    response.status(status).json({
      success: false,
      message,
      status,
    });
  }
}
