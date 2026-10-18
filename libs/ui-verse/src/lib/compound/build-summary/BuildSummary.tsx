import { Button, Code, Group, Paper, SimpleGrid, Stack, Title } from '@mantine/core';
import { createContext, ReactNode, useContext } from 'react';
import { SnapshotProgress, SnapshotProgressProps } from '../../atoms/snapshot-progress/SnapshotProgress';
import { StatValue, StatValueProps } from '../../atoms/stat-value/StatValue';
import { BuildStatus, StatusBadge } from '../../badge/StatusBadge';

interface SummaryContext {
  status: BuildStatus;
  number: number;
  branch: string;
}

const Ctx = createContext<SummaryContext | null>(null);

const useSummary = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('BuildSummary parts must be rendered inside <BuildSummary>.');
  return ctx;
};

export interface BuildSummaryProps extends SummaryContext {
  children: ReactNode;
}

function Root({ status, number, branch, children }: BuildSummaryProps) {
  return (
    <Ctx.Provider value={{ status, number, branch }}>
      <Paper withBorder p="lg" component="section" aria-label={`Build ${number} summary`}>
        <Stack gap="lg">{children}</Stack>
      </Paper>
    </Ctx.Provider>
  );
}

function Heading({ onView }: { /** Called with the build number when View build is pressed. */ onView?: (number: number) => void }) {
  const { status, number, branch } = useSummary();
  return (
    <Group justify="space-between" align="flex-start" gap="sm">
      <Stack gap={6}>
        <Group gap="sm">
          <Title order={3}>Build #{number}</Title>
          <StatusBadge status={status} />
        </Group>
        <Code>{branch}</Code>
      </Stack>
      {onView && (
        <Button variant="default" onClick={() => onView(number)}>
          View build
        </Button>
      )}
    </Group>
  );
}

function Stats({ children }: { children: ReactNode }) {
  return (
    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
      {children}
    </SimpleGrid>
  );
}

function Stat(props: StatValueProps) {
  return <StatValue {...props} />;
}

function Progress(props: SnapshotProgressProps) {
  return <SnapshotProgress {...props} />;
}

export const BuildSummary = Object.assign(Root, { Heading, Stats, Stat, Progress });

export default BuildSummary;
