import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.printf(({ level, message, timestamp }) => {
        return `[${String(timestamp)}] ${String(level).toUpperCase()}: ${String(message)}`;
      }),
    ),
    transports: [
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.simple(),
          format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          format.printf(({ level, message, timestamp }) => {
            return `[${String(timestamp)}] ${String(level).toUpperCase()}: ${String(message)}`;
          }),
        ),
      }),

      ...(process.env.NODE_ENV === 'production'
        ? [
            new transports.File({ filename: 'logs/error.log', level: 'error' }),
            new transports.File({ filename: 'logs/combined.log' }),
          ]
        : []),
    ],
  });

  // Log methods
  log(message: string) {
    this.logger.info(message);
  }

  // Error log method
  error(message: string, trace?: string) {
    this.logger.error(message, { stack: trace });
  }

  // Warn log method
  warn(message: string) {
    this.logger.warn(message);
  }

  // Debug log method
  debug(message: string) {
    this.logger.debug(message);
  }

  // Verbose log method
  verbose(message: string) {
    this.logger.verbose(message);
  }

  // Custom log method
  custom(message: string, level: string) {
    if (this.logger.levels[level]) {
      this.logger.log(level, message);
    } else {
      this.logger.info(message); // Fallback to info if level is invalid
    }
  }
}
