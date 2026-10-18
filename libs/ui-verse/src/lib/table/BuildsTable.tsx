import { useMemo, useState } from 'react';
import { Code, Group, Skeleton, Table, Text, UnstyledButton } from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconSelector } from '@tabler/icons-react';
import { StatusBadge } from '../badge/StatusBadge';
import { Build, formatDuration } from './builds.data';

export type SortKey = 'number' | 'branch' | 'snapshots' | 'changes';
export type SortDir = 'asc' | 'desc';

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: 'number', label: 'Build', numeric: true },
  { key: 'branch', label: 'Branch' },
  { key: 'snapshots', label: 'Snapshots', numeric: true },
  { key: 'changes', label: 'Changes', numeric: true },
];

export interface BuildSort {
  key: SortKey;
  dir: SortDir;
}

export interface BuildsTableProps {
  builds: Build[];
  loading?: boolean;
  initialSort?: BuildSort;
  /** Called with the new column and direction after each header click. */
  onSortChange?: (sort: BuildSort) => void;
}

export function BuildsTable({
  builds,
  loading = false,
  initialSort = { key: 'number', dir: 'desc' },
  onSortChange,
}: BuildsTableProps) {
  const [sort, setSort] = useState(initialSort);

  const rows = useMemo(() => {
    const sign = sort.dir === 'asc' ? 1 : -1;
    return [...builds].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      return (av < bv ? -1 : av > bv ? 1 : 0) * sign;
    });
  }, [builds, sort]);

  const toggle = (key: SortKey) => {
    const next: BuildSort =
      sort.key === key
        ? { key, dir: sort.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' };
    setSort(next);
    onSortChange?.(next);
  };

  const columnSpan = COLUMNS.length + 2;

  return (
    <Table.ScrollContainer minWidth={680}>
      <Table striped highlightOnHover aria-busy={loading}>
        <Table.Thead>
          <Table.Tr>
            {COLUMNS.map((c) => {
              const active = sort.key === c.key;
              const Icon = !active ? IconSelector : sort.dir === 'asc' ? IconChevronUp : IconChevronDown;
              return (
                <Table.Th
                  key={c.key}
                  ta={c.numeric ? 'right' : undefined}
                  aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <UnstyledButton onClick={() => toggle(c.key)}>
                    <Group gap={4} wrap="nowrap" justify={c.numeric ? 'flex-end' : 'flex-start'}>
                      <Text fw={600} size="sm">
                        {c.label}
                      </Text>
                      <Icon size={14} aria-hidden />
                    </Group>
                  </UnstyledButton>
                </Table.Th>
              );
            })}
            <Table.Th>Status</Table.Th>
            <Table.Th ta="right">Time</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {loading &&
            Array.from({ length: 4 }, (_, i) => (
              <Table.Tr key={i}>
                <Table.Td colSpan={columnSpan}>
                  <Skeleton height={18} animate={false} />
                </Table.Td>
              </Table.Tr>
            ))}
          {!loading && rows.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={columnSpan}>
                <Text c="dimmed" ta="center" py="lg">
                  No builds yet. Run <Code>npx chromatic</Code> to create your
                  first baseline.
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
          {!loading &&
            rows.map((b) => (
              <Table.Tr key={b.id}>
                <Table.Td ta="right">#{b.number}</Table.Td>
                <Table.Td maw={280}>
                  <Text size="sm" truncate title={b.branch}>
                    {b.branch}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {b.commit} · {b.author}
                  </Text>
                </Table.Td>
                <Table.Td ta="right">{b.snapshots}</Table.Td>
                <Table.Td ta="right">{b.changes}</Table.Td>
                <Table.Td>
                  <StatusBadge status={b.status} size="sm" />
                </Table.Td>
                <Table.Td ta="right">{formatDuration(b.duration)}</Table.Td>
              </Table.Tr>
            ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

export default BuildsTable;
