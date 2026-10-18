import { Group, Progress, Text } from '@mantine/core';

export interface SnapshotProgressProps {
  done: number;
  total: number;
  /** Snapshots that errored. Turns the bar red when above zero. */
  failed?: number;
}

export const percentOf = (done: number, total: number) =>
  total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;

export function SnapshotProgress({ done, total, failed = 0 }: SnapshotProgressProps) {
  const pct = percentOf(done, total);
  const color = failed > 0 ? 'red' : pct === 100 ? 'green' : 'blue';
  return (
    <div>
      <Group justify="space-between" mb={4}>
        <Text size="sm" fw={500}>
          Snapshots
        </Text>
        <Text size="sm" c="dimmed">
          {done} of {total}
          {failed > 0 ? `, ${failed} failed` : ''}
        </Text>
      </Group>
      <Progress.Root>
        <Progress.Section value={pct} color={color} aria-label="Snapshot progress" />
      </Progress.Root>
    </div>
  );
}

export default SnapshotProgress;
