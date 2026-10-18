import { Group, Kbd, Text } from '@mantine/core';
import { Fragment } from 'react';

export interface ShortcutKeyProps {
  /** Keys in the order they are pressed, e.g. `['⌘', 'K']`. */
  keys: string[];
}

const SPOKEN: Record<string, string> = {
  '⌘': 'Command',
  '⌥': 'Option',
  '⇧': 'Shift',
  '⌃': 'Control',
  '↵': 'Enter',
  '⎋': 'Escape',
};

/** A keyboard shortcut. Screen readers hear the words, not the symbols. */
export function ShortcutKey({ keys }: ShortcutKeyProps) {
  const spoken = keys.map((k) => SPOKEN[k] ?? k).join(' plus ');
  return (
    <Group gap={4} component="span" display="inline-flex" role="group" aria-label={`Shortcut: ${spoken}`}>
      {keys.map((k, i) => (
        <Fragment key={`${k}-${i}`}>
          {i > 0 && (
            <Text span size="xs" c="dimmed" aria-hidden>
              +
            </Text>
          )}
          <Kbd aria-hidden>{k}</Kbd>
        </Fragment>
      ))}
    </Group>
  );
}

export default ShortcutKey;
