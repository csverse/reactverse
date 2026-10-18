import { Button, Group, Paper, Stack, Text, Textarea } from '@mantine/core';
import { createContext, ReactNode, useContext, useRef, useState } from 'react';
import { CommentCard, CommentCardProps } from '../../molecules/comment-card/CommentCard';

interface ThreadContext {
  resolved: boolean;
  setResolved: (next: boolean) => void;
  onReply?: (text: string) => void;
}

const Ctx = createContext<ThreadContext | null>(null);

const useThread = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('ReviewThread parts must be rendered inside <ReviewThread>.');
  return ctx;
};

export interface ReviewThreadProps {
  defaultResolved?: boolean;
  /** Called with the reply text when Send reply is pressed. */
  onReply?: (text: string) => void;
  /** Called with the new resolved state when the thread is resolved or reopened. */
  onResolveChange?: (resolved: boolean) => void;
  children: ReactNode;
}

function Root({ defaultResolved = false, onReply, onResolveChange, children }: ReviewThreadProps) {
  const [resolved, setResolvedState] = useState(defaultResolved);
  const setResolved = (next: boolean) => {
    setResolvedState(next);
    onResolveChange?.(next);
  };
  return (
    <Ctx.Provider value={{ resolved, setResolved, onReply }}>
      <Paper withBorder p="md" component="section" aria-label="Review thread">
        <Stack gap="md">{children}</Stack>
      </Paper>
    </Ctx.Provider>
  );
}

function Header({ count }: { count: number }) {
  const { resolved, setResolved } = useThread();
  return (
    <Group justify="space-between">
      <Text fw={600}>
        {count} {count === 1 ? 'comment' : 'comments'}
        {resolved && (
          <Text span c="dimmed" fw={400}>
            {' '}
            · resolved
          </Text>
        )}
      </Text>
      <Button variant="default" size="compact-sm" onClick={() => setResolved(!resolved)}>
        {resolved ? 'Reopen thread' : 'Resolve thread'}
      </Button>
    </Group>
  );
}

/** A comment in the thread. Resolving happens on the thread, so the card has no button of its own. */
function Comment(props: Omit<CommentCardProps, 'onResolve' | 'resolved'>) {
  return <CommentCard {...props} />;
}

function Reply() {
  const { resolved, onReply } = useThread();
  const [text, setText] = useState('');
  const field = useRef<HTMLTextAreaElement>(null);

  if (resolved) {
    return (
      <Text size="sm" c="dimmed">
        This thread is resolved. Reopen it to reply.
      </Text>
    );
  }

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onReply?.(trimmed);
    setText('');
    field.current?.focus();
  };

  return (
    <Stack gap="xs">
      <Textarea
        ref={field}
        label="Reply"
        placeholder="Write a reply"
        autosize
        minRows={2}
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
      />
      <Group justify="flex-end">
        <Button onClick={send} disabled={!text.trim()}>
          Send reply
        </Button>
      </Group>
    </Stack>
  );
}

export const ReviewThread = Object.assign(Root, { Header, Comment, Reply });

export default ReviewThread;
