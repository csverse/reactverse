import { Group, Text, VisuallyHidden } from '@mantine/core';
import { IconArrowDownRight, IconArrowUpRight, IconMinus } from '@tabler/icons-react';

export interface StatValueProps {
  label: string;
  value: number;
  /** Change since the comparison point. Positive, negative or zero. */
  delta?: number;
  /** Text after the delta, e.g. "vs last week". */
  deltaLabel?: string;
  /** Which direction counts as good. Failures dropping is good news. */
  goodWhen?: 'up' | 'down';
  unit?: 'count' | 'percent' | 'seconds';
}

export const formatValue = (value: number, unit: StatValueProps['unit'] = 'count') => {
  if (unit === 'percent') return `${value}%`;
  if (unit === 'seconds') {
    const m = Math.floor(value / 60);
    const s = value % 60;
    return m > 0 ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`;
  }
  return new Intl.NumberFormat('en-US').format(value);
};

export function StatValue({
  label,
  value,
  delta,
  deltaLabel,
  goodWhen = 'up',
  unit = 'count',
}: StatValueProps) {
  const direction = delta === undefined || delta === 0 ? 'flat' : delta > 0 ? 'up' : 'down';
  const good = direction === 'flat' ? undefined : direction === goodWhen;
  const color = good === undefined ? 'dimmed' : good ? 'green' : 'red';
  const Icon = direction === 'up' ? IconArrowUpRight : direction === 'down' ? IconArrowDownRight : IconMinus;
  const spoken = direction === 'up' ? 'Up' : direction === 'down' ? 'Down' : 'No change';

  return (
    <div>
      <Text size="xs" tt="uppercase" fw={600} c="dimmed" lts="0.04em">
        {label}
      </Text>
      <Text fz={28} fw={700} lh={1.2}>
        {formatValue(value, unit)}
      </Text>
      {delta !== undefined && (
        <Group gap={4} wrap="nowrap" c={color}>
          <Icon size={16} aria-hidden />
          <Text size="sm" fw={500} c="inherit">
            <VisuallyHidden>{spoken} </VisuallyHidden>
            {delta > 0 ? '+' : ''}
            {formatValue(delta, unit)}
            {deltaLabel ? ` ${deltaLabel}` : ''}
          </Text>
        </Group>
      )}
    </div>
  );
}

export default StatValue;
