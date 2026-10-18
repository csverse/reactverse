import { Group, Loader, Text, VisuallyHidden } from '@mantine/core';

export interface LoadingIndicatorProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Keep the label for screen readers but do not draw it. */
  hideLabel?: boolean;
}

/** A spinner that announces itself: the status region is polite, so it does not interrupt. */
export function LoadingIndicator({
  label = 'Loading',
  size = 'md',
  hideLabel = false,
}: LoadingIndicatorProps) {
  return (
    <Group gap="xs" role="status" aria-live="polite" wrap="nowrap">
      <Loader size={size} aria-hidden />
      {hideLabel ? (
        <VisuallyHidden>{label}</VisuallyHidden>
      ) : (
        <Text size={size === 'lg' ? 'md' : 'sm'} c="dimmed">
          {label}
        </Text>
      )}
    </Group>
  );
}

export default LoadingIndicator;
