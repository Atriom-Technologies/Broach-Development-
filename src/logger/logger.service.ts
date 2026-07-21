import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * App-wide logger, wraps Winston behind Nest's LoggerService interface.
 *
 * Production note: file transports below assume persistent disk. If you're deploying to anything ephemeral (containers, k8s, most PaaS), the files
 * disappear on every restart/redeploy and are useless for debugging.
 * In that case, delete the File transports and rely on stdout/stderr only —
 * platform's log aggregator (CloudWatch, Datadog, etc.) captures that.
 */
@Injectable({ scope: Scope.TRANSIENT }) // TRANSIENT so `context` is per-consumer, see setContext below
export class AppLogger implements LoggerService {
  private context?: string;
  private readonly logger: WinstonLogger;

  constructor() {
    this.logger = createLogger({
      level: isProduction ? 'warn' : 'debug',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }), // makes Winston pull .stack off Error objects automatically
        isProduction ? format.json() : this.devFormat(),
      ),
      transports: [
        new transports.Console({
          format: isProduction ? undefined : format.combine(format.colorize(), this.devFormat()),
        }),
        ...(isProduction
          ? [new transports.File({ filename: 'logs/error.log', level: 'error' }), new transports.File({ filename: 'logs/combined.log' })]
          : []),
      ],
    });
  }

  /** Called by Nest when injected via new AppLogger().setContext('CaseService'),
   *  or set manually: this.logger.setContext(CaseService.name) in a constructor. */
  setContext(context: string) {
    this.context = context;
    return this;
  }

  private devFormat() {
    return format.printf(({ level, message, timestamp, context, stack }) => {
      const ctx = (context as string) ?? this.context;
      const ctxLabel = ctx ? `[${ctx}] ` : '';
      const base = `[${String(timestamp)}] ${String(level).toUpperCase()}: ${ctxLabel}${String(message)}`;
      return stack ? `${base}\n${String(stack)}` : base;
    });
  }

  /** Normalizes `Error` objects vs plain strings/objects into a consistent
   *  { message, stack } shape so callers can do `logger.error(err)` or
   *  `logger.error('msg', err.stack)` interchangeably. */
  private normalize(message: unknown, trace?: string) {
    if (message instanceof Error) {
      return { msg: message.message, stack: trace ?? message.stack };
    }
    return { msg: typeof message === 'string' ? message : JSON.stringify(message), stack: trace };
  }

  log(message: unknown, context?: string) {
    this.logger.info(this.normalize(message).msg, { context: context ?? this.context });
  }

  error(message: unknown, trace?: string, context?: string) {
    const { msg, stack } = this.normalize(message, trace);
    this.logger.error(msg, { stack, context: context ?? this.context });
  }

  warn(message: unknown, context?: string) {
    this.logger.warn(this.normalize(message).msg, { context: context ?? this.context });
  }

  debug(message: unknown, context?: string) {
    this.logger.debug(this.normalize(message).msg, { context: context ?? this.context });
  }

  verbose(message: unknown, context?: string) {
    this.logger.verbose(this.normalize(message).msg, { context: context ?? this.context });
  }
}
