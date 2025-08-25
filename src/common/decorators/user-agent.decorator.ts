import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Custom decorator to extract the User-Agent string from the request headers.
 * Falls back to 'unknown' if not available or not a string.
 */
export const UserAgent = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();

    const userAgent = request.headers['user-agent'];

    // Ensure returned value is a string; fallback to 'unknown'
    return typeof userAgent === 'string' ? userAgent : 'unknown';
  },
);
