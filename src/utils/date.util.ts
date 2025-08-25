/**
 * Calculates a future Date by adding the given number of days to the current date.
 * Falls back to 30 days if input is invalid.
 *
 * @param rawDays - Number of days to add to the current date
 * @returns A Date object representing the future expiry date
 */
export function calculateExpiry(rawDays: number = 30): Date {
  const days = Number(rawDays);
  const safeDays = Number.isFinite(days) && days > 0 ? days : 30;

  const expires = new Date();
  expires.setDate(expires.getDate() + safeDays);
  return expires;
}
