import { Badge, Text } from '@mantine/core';

export type BuildStatus =
  | 'accepted'
  | 'changed'
  | 'denied'
  | 'building'
  | 'pending'
  | 'broken';

const COPY: Record<BuildStatus, { label: string; color: string }> = {
  accepted: { label: 'Accepted', color: 'green' },
  changed: { label: 'Changes found', color: 'yellow' },
  denied: { label: 'Denied', color: 'red' },
  building: { label: 'In progress', color: 'blue' },
  pending: { label: 'Needs review', color: 'orange' },
  broken: { label: 'Build failed', color: 'gray' },
};

export interface StatusBadgeProps {
  status: BuildStatus;
  /** Overrides the default label for the status. */
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Number of snapshots in this state, shown after the label. */
  count?: number;
  /** When set, the badge becomes a button, e.g. to filter builds by this status. */
  onClick?: (status: BuildStatus) => void;
}

export function StatusBadge({
  status,
  label,
  size = 'md',
  count,
  onClick,
}: StatusBadgeProps) {
  const { label: defaultLabel, color } = COPY[status];
  return (
    <Badge
      color={color}
      size={size}
      variant="light"
      {...(onClick && {
        component: 'button' as const,
        type: 'button' as const,
        onClick: () => onClick(status),
        style: { cursor: 'pointer' },
      })}
    >
      {label ?? defaultLabel}
      {count !== undefined && (
        <Text span inherit fw={700} ml={6}>
          {count}
        </Text>
      )}
    </Badge>
  );
}

export default StatusBadge;
