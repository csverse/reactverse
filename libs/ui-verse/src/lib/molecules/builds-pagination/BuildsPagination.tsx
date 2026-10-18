import { Group, Pagination, Text } from '@mantine/core';
import { useState } from 'react';

export interface BuildsPaginationProps {
  totalItems: number;
  pageSize?: number;
  defaultPage?: number;
  /** Called with the new page number (1-based). */
  onChange?: (page: number) => void;
}

const CONTROL_LABELS = {
  first: 'First page',
  previous: 'Previous page',
  next: 'Next page',
  last: 'Last page',
} as const;

export const rangeText = (page: number, pageSize: number, totalItems: number) => {
  if (totalItems === 0) return 'No builds';
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);
  return `Showing ${from}–${to} of ${totalItems} builds`;
};

export function BuildsPagination({ totalItems, pageSize = 20, defaultPage = 1, onChange }: BuildsPaginationProps) {
  const pages = Math.max(1, Math.ceil(totalItems / pageSize));
  const [page, setPage] = useState(Math.min(defaultPage, pages));

  return (
    <Group justify="space-between" gap="md">
      <Text size="sm" c="dimmed" aria-live="polite">
        {rangeText(page, pageSize, totalItems)}
      </Text>
      {pages > 1 && (
        <nav aria-label="Builds pagination">
          <Pagination
            total={pages}
            value={page}
            withEdges
            siblings={1}
            onChange={(p) => {
              setPage(p);
              onChange?.(p);
            }}
            getControlProps={(control) => ({ 'aria-label': CONTROL_LABELS[control] })}
            getItemProps={(p) => ({ 'aria-label': `Page ${p}` })}
          />
        </nav>
      )}
    </Group>
  );
}

export default BuildsPagination;
