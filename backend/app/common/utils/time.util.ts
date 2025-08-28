/**
 * Converts a time string "HH:mm" to the total number of minutes from midnight.
 * @param timeStr - The time string to convert.
 * @returns The number of minutes from midnight.
 */
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Adds minutes to a given Date object.
 * @param date - The starting date.
 * @param minutes - The number of minutes to add.
 * @returns A new Date object with the added minutes.
 */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}
