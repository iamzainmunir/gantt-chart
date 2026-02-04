/**
 * Map a date within a range to a horizontal pixel position (0..width).
 */
export function dateToX(
  date: Date,
  rangeStart: Date,
  rangeEnd: Date,
  width: number
): number {
  const start = rangeStart.getTime();
  const end = rangeEnd.getTime();
  const t = date.getTime();
  if (t <= start) return 0;
  if (t >= end) return width;
  return ((t - start) / (end - start)) * width;
}

/**
 * Map a horizontal pixel position to a date within the range.
 */
export function xToDate(
  x: number,
  rangeStart: Date,
  rangeEnd: Date,
  width: number
): Date {
  if (width <= 0) return new Date(rangeStart);
  const p = Math.max(0, Math.min(1, x / width));
  return new Date(
    rangeStart.getTime() + p * (rangeEnd.getTime() - rangeStart.getTime())
  );
}

export function getSprintDateRange(
  start: Date,
  end: Date
): { start: Date; end: Date } {
  const s = new Date(start);
  const e = new Date(end);
  return { start: s, end: e };
}
