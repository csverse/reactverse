import { Accordion, Group, Text } from '@mantine/core';
import { StatusBadge, BuildStatus } from '../badge/StatusBadge';

export interface BrowserResult {
  browser: string;
  version: string;
  status: BuildStatus;
  snapshots: number;
  notes?: string;
}

export interface BrowserMatrixProps {
  results: BrowserResult[];
  defaultOpen?: string[];
  /** Called with the browsers whose panels are open after each toggle. */
  onChange?: (open: string[]) => void;
  /** Panel animation in ms. Set 0 for tests that must not wait. */
  transitionDuration?: number;
}

export function BrowserMatrix({
  results,
  defaultOpen = [],
  onChange,
  transitionDuration = 200,
}: BrowserMatrixProps) {
  return (
    <Accordion
      multiple
      defaultValue={defaultOpen}
      onChange={onChange}
      transitionDuration={transitionDuration}
      maw={560}
    >
      {results.map((r) => (
        <Accordion.Item key={r.browser} value={r.browser}>
          <Accordion.Control>
            <Group gap="sm" wrap="nowrap">
              <Text fw={600} w={80}>
                {r.browser}
              </Text>
              <Text c="dimmed" size="sm" w={48}>
                {r.version}
              </Text>
              <StatusBadge status={r.status} size="sm" />
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Text size="sm">
              {r.snapshots} snapshots captured.{' '}
              {r.notes ?? 'No differences from the baseline.'}
            </Text>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

export default BrowserMatrix;
