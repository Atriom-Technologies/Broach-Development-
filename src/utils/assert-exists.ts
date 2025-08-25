import { NotFoundException } from '@nestjs/common';

// Utility function to assert that a value exists
export function assertExists<T>(
  value: T | null | undefined,
  message: string,
): T {
  if (value === null || value === undefined) {
    throw new NotFoundException(message);
  }
  return value;
}
