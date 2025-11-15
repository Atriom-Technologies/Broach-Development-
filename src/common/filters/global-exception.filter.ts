import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
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
      message = Array.isArray(res['message'])
        ? res['message'].join(', ')
        : res['message'] || message;
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

    // Log full details for YOU (not the frontend)
    this.logger.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      status,
      exception: exception.message,
      stack: exception.stack,
      body: request.body,
      params: request.params,
      query: request.query,
    }));

    // Clean response to frontend
    response.status(status).json({
      success: false,
      message,
      status,
    });
  }
}
