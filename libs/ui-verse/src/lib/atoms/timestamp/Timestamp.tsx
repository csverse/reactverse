import { Text } from '@mantine/core';

export interface TimestampProps {
  date: string | Date;
  /** The moment "now" is measured from. Pass a fixed value for stable snapshots. */
  now?: string | Date;
  format?: 'relative' | 'absolute';
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
];

export const relativeLabel = (date: Date, now: Date) => {
  const diff = date.getTime() - now.getTime();
  if (Math.abs(diff) < 60_000) return 'just now';
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  for (const [unit, ms] of UNITS) {
    if (Math.abs(diff) >= ms) return rtf.format(Math.trunc(diff / ms), unit);
  }
  return 'just now';
};

const absoluteLabel = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(date) + ' UTC';

/** A <time> element: readable text for people, an ISO value for machines, the full date on hover. */
export function Timestamp({ date, now = new Date(), format = 'relative' }: TimestampProps) {
  const d = new Date(date);
  const n = new Date(now);
  return (
    <Text component="time" size="sm" c="dimmed" dateTime={d.toISOString()} title={absoluteLabel(d)}>
      {format === 'relative' ? relativeLabel(d, n) : absoluteLabel(d)}
    </Text>
  );
}

export default Timestamp;
