import { Button, Group, Paper, Stack, Text } from '@mantine/core';
import { createContext, ReactNode, useContext, useState } from 'react';
import { StatusBadge } from '../../badge/StatusBadge';

export type Decision = 'pending' | 'approved' | 'denied';

interface CardContext {
  id: string;
  title: string;
  decision: Decision;
  decide: (next: Decision) => void;
}

const Ctx = createContext<CardContext | null>(null);

const useCard = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('ChangeReviewCard parts must be rendered inside <ChangeReviewCard>.');
  return ctx;
};

export interface ChangeReviewCardProps {
  id: string;
  /** The story the change belongs to. Used in the card's name and in its button labels. */
  title: string;
  defaultDecision?: Decision;
  /** Called with the card id and the new decision each time one is made or undone. */
  onDecision?: (id: string, decision: Decision) => void;
  children: ReactNode;
}

function Root({ id, title, defaultDecision = 'pending', onDecision, children }: ChangeReviewCardProps) {
  const [decision, setDecision] = useState<Decision>(defaultDecision);
  const decide = (next: Decision) => {
    setDecision(next);
    onDecision?.(id, next);
  };
  return (
    <Ctx.Provider value={{ id, title, decision, decide }}>
      <Paper withBorder p="md" component="article" aria-label={`Change in ${title}`}>
        <Stack gap="sm">{children}</Stack>
      </Paper>
    </Ctx.Provider>
  );
}

const BARS = [30, 50, 40];

export interface ChangeReviewPreviewProps {
  /** How the change differs from the baseline. */
  variant?: 'identical' | 'shifted' | 'recolored';
}

function Preview({ variant = 'shifted' }: ChangeReviewPreviewProps) {
  const after = variant === 'shifted' ? [30, 62, 40] : BARS;
  const fill = variant === 'recolored' ? 'var(--mantine-color-red-6)' : 'var(--mantine-color-blue-6)';
  const panel = (caption: string, heights: number[], color: string) => (
    <figure style={{ margin: 0, flex: 1 }}>
      <Paper withBorder p="xs">
        <svg viewBox="0 0 120 72" width="100%" role="img" aria-label={`${caption} snapshot`}>
          {heights.map((h, i) => (
            <rect key={i} x={16 + i * 36} y={64 - h} width={20} height={h} fill={color} />
          ))}
        </svg>
      </Paper>
      <Text component="figcaption" size="xs" c="dimmed" ta="center" mt={4}>
        {caption}
      </Text>
    </figure>
  );
  return (
    <Group gap="sm" wrap="nowrap" align="flex-start">
      {panel('Baseline', BARS, 'var(--mantine-color-blue-6)')}
      {panel('Change', after, fill)}
    </Group>
  );
}

function Meta({ children }: { children?: ReactNode }) {
  const { title, decision } = useCard();
  const badge =
    decision === 'approved' ? (
      <StatusBadge status="accepted" label="Approved" size="sm" />
    ) : decision === 'denied' ? (
      <StatusBadge status="denied" size="sm" />
    ) : (
      <StatusBadge status="pending" size="sm" />
    );
  return (
    <Group justify="space-between" align="flex-start" wrap="nowrap">
      <div>
        <Text fw={600}>{title}</Text>
        {children && (
          <Text size="sm" c="dimmed">
            {children}
          </Text>
        )}
      </div>
      {badge}
    </Group>
  );
}

function Actions() {
  const { title, decision, decide } = useCard();
  if (decision !== 'pending') {
    return (
      <Group>
        <Button variant="subtle" size="compact-sm" onClick={() => decide('pending')}>
          Undo decision
        </Button>
      </Group>
    );
  }
  return (
    <Group gap="xs">
      <Button color="green" size="compact-md" onClick={() => decide('approved')} aria-label={`Approve ${title}`}>
        Approve
      </Button>
      <Button color="red" variant="light" size="compact-md" onClick={() => decide('denied')} aria-label={`Deny ${title}`}>
        Deny
      </Button>
    </Group>
  );
}

export const ChangeReviewCard = Object.assign(Root, { Preview, Meta, Actions });

export default ChangeReviewCard;
