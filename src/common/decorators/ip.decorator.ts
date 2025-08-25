import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Custom decorator to extract the client's IP address from the request.
 * It checks common sources like 'x-forwarded-for', request.ip, and connection.remoteAddress.
 * Ensures a safe fallback and returns a string in all cases.
 */
export const Ip = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    // Get the typed Express request object
    const request = ctx.switchToHttp().getRequest<Request>();

    // Get the IP address from 'x-forwarded-for' header (can be string or array)
    const forwarded = request.headers['x-forwarded-for'];

    // Determine client IP using multiple fallback options
    const ip =
      typeof forwarded === 'string' // Single proxy IP
        ? forwarded
        : Array.isArray(forwarded) // Multiple proxy IPs
          ? forwarded[0]
          : (request.ip ?? // Express's built-in IP
            request.connection?.remoteAddress ?? // Low-level Node.js IP
            ''); // Final fallback to empty string

    return ip;
  },
);
