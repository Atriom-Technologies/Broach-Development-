// src/utils/safe-execute.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AppLogger } from 'src/logger/logger.service';

// Utility service to safely execute functions and handle errors
@Injectable()
export class SafeExecutor {
  // Injecting the custom logger service
  constructor(private readonly logger: AppLogger) {}

  // Generic method to execute a function safely
  // It logs errors and throws an InternalServerErrorException if the function fails
  async run<T>(
    // Function to execute
    fn: () => Promise<T>,
    errorMessage: string,
  ): Promise<T> {
    // Try to execute the function and catch any errors
    // If an error occurs, log it and throw an InternalServerErrorException
    try {
      return await fn();
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`${errorMessage}: ${err.message}`, err.stack);
      throw new InternalServerErrorException(errorMessage);
    }
  }

  // For safely executing synchronous functions
  runSync<T>(fn: () => T, errorMessage: string): T {
    try {
      return fn();
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`${errorMessage}: ${err.message}`, err.stack);
      throw new InternalServerErrorException(errorMessage);
    }
  }

  // Method to execute a function with a fallback value
  // If the function fails, it returns a fallback value and logs a warning
  async runWithFallback<T>(
    // Function to execute
    // Fallback value to return if the function fails
    fn: () => Promise<T>,
    fallback: T,
    warnMessage: string,
  ): Promise<T> {
    // Try to execute the function and catch any errors
    try {
      return await fn();
    } catch (error) {
      // If an error occurs, log a warning and return the fallback value
      const err = error as Error;
      this.logger.error(`${warnMessage}: ${err.message}`, err.stack);
      return fallback;
    }
  }
}

// Example usage in a service:
// const result = await this.safeExecutor.run(() => this.prisma.user.findMany(), 'User fetch failed', 'UserService');
