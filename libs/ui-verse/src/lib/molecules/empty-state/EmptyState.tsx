import { Button, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconAlertTriangle, IconInbox } from '@tabler/icons-react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  tone?: 'neutral' | 'error';
  actionLabel?: string;
  /** Called when the action button is pressed. Needs `actionLabel` to show. */
  onAction?: () => void;
}

export function EmptyState({ title, description, tone = 'neutral', actionLabel, onAction }: EmptyStateProps) {
  const Icon = tone === 'error' ? IconAlertTriangle : IconInbox;
  return (
    <Stack align="center" gap="xs" py="xl" ta="center" maw={420} mx="auto">
      <ThemeIcon size={56} radius="xl" variant="light" color={tone === 'error' ? 'red' : 'gray'}>
        <Icon size={28} aria-hidden />
      </ThemeIcon>
      <Title order={4}>{title}</Title>
      {description && (
        <Text size="sm" c="dimmed">
          {description}
        </Text>
      )}
      {actionLabel && (
        <Button mt="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Stack>
  );
}

export default EmptyState;
