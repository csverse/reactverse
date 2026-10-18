import { Button, Group, Paper, Text } from '@mantine/core';
import { useState } from 'react';
import { ReviewerAvatar, Reviewer } from '../../avatar/ReviewerAvatar';
import { StatusBadge } from '../../badge/StatusBadge';
import { Timestamp } from '../../atoms/timestamp/Timestamp';

export interface CommentCardProps {
  author: Reviewer;
  body: string;
  createdAt: string;
  /** The moment "now" is measured from. Pass a fixed value for stable snapshots. */
  now?: string;
  resolved?: boolean;
  /** Called with the new resolved state. Passing it shows the Resolve / Reopen button. */
  onResolve?: (resolved: boolean) => void;
}

export function CommentCard({ author, body, createdAt, now, resolved = false, onResolve }: CommentCardProps) {
  const [isResolved, setIsResolved] = useState(resolved);

  const toggle = () => {
    const next = !isResolved;
    setIsResolved(next);
    onResolve?.(next);
  };

  return (
    <Paper withBorder p="md" component="article" aria-label={`Comment by ${author.name}`}>
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xs">
        <Group gap="sm" wrap="nowrap">
          <ReviewerAvatar {...author} size={32} />
          <div>
            <Text fw={600} size="sm" lh={1.3}>
              {author.name}
            </Text>
            <Timestamp date={createdAt} now={now} />
          </div>
        </Group>
        {isResolved && <StatusBadge status="accepted" label="Resolved" size="sm" />}
      </Group>
      <Text size="sm">{body}</Text>
      {onResolve && (
        <Button variant="subtle" size="compact-sm" mt="xs" ml={-8} onClick={toggle}>
          {isResolved ? 'Reopen' : 'Resolve'}
        </Button>
      )}
    </Paper>
  );
}

export default CommentCard;
