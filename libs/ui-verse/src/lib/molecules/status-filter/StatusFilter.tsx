import { Box, SegmentedControl, Text } from '@mantine/core';
import { useState } from 'react';

export type StatusFilterValue = 'all' | 'pending' | 'changed' | 'accepted' | 'denied';

const OPTIONS: { value: StatusFilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Needs review' },
  { value: 'changed', label: 'Changes found' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'denied', label: 'Denied' },
];

export interface StatusFilterProps {
  /** How many builds are in each state. Shown beside each label. */
  counts?: Partial<Record<StatusFilterValue, number>>;
  value?: StatusFilterValue;
  defaultValue?: StatusFilterValue;
  onChange?: (value: StatusFilterValue) => void;
}

export function StatusFilter({ counts, value, defaultValue = 'all', onChange }: StatusFilterProps) {
  const [inner, setInner] = useState<StatusFilterValue>(defaultValue);
  const current = value ?? inner;

  return (
    // Scrolls sideways on a narrow screen instead of squeezing the labels.
    <Box style={{ overflowX: 'auto' }} pb={4}>
      <SegmentedControl
        aria-label="Filter builds by status"
        value={current}
        onChange={(v) => {
          setInner(v as StatusFilterValue);
          onChange?.(v as StatusFilterValue);
        }}
        data={OPTIONS.map((o) => ({
          value: o.value,
          label: (
            <span style={{ whiteSpace: 'nowrap' }}>
              {o.label}
              {counts?.[o.value] !== undefined && (
                <Text span size="xs" c="dimmed" ml={6}>
                  {counts[o.value]}
                </Text>
              )}
            </span>
          ),
        }))}
      />
    </Box>
  );
}

export default StatusFilter;
