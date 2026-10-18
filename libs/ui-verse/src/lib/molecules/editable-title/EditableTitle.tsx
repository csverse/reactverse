import { Button, Group, TextInput, Title } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { IconButton } from '../../atoms/icon-button/IconButton';

export interface EditableTitleProps {
  value: string;
  startEditing?: boolean;
  /** Called with the trimmed new title when it is saved. */
  onSave?: (value: string) => void;
}

export function EditableTitle({ value, startEditing = false, onSave }: EditableTitleProps) {
  const [saved, setSaved] = useState(value);
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(startEditing);
  const [error, setError] = useState<string>();
  const root = useRef<HTMLDivElement>(null);
  const returnFocus = useRef(false);

  // When editing ends, put focus back on the Edit button so keyboard users keep their place.
  useEffect(() => {
    if (!editing && returnFocus.current) {
      root.current?.querySelector<HTMLButtonElement>('button[aria-label="Edit title"]')?.focus();
      returnFocus.current = false;
    }
  }, [editing]);

  const begin = () => {
    setDraft(saved);
    setError(undefined);
    setEditing(true);
  };

  const cancel = () => {
    returnFocus.current = true;
    setEditing(false);
  };

  const save = (e: FormEvent) => {
    e.preventDefault();
    const next = draft.trim();
    if (!next) {
      setError("Title can't be empty.");
      return;
    }
    setSaved(next);
    onSave?.(next);
    returnFocus.current = true;
    setEditing(false);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') cancel();
  };

  return (
    <div ref={root}>
      {editing ? (
        <form onSubmit={save} onKeyDown={onKeyDown} noValidate>
          <Group align="flex-start" gap="xs">
            <TextInput
              aria-label="Build title"
              autoFocus
              value={draft}
              error={error}
              onChange={(e) => {
                setDraft(e.currentTarget.value);
                setError(undefined);
              }}
              style={{ flex: 1, minWidth: 200 }}
            />
            <Button type="submit">Save</Button>
            <Button variant="default" onClick={cancel}>
              Cancel
            </Button>
          </Group>
        </form>
      ) : (
        <Group gap="xs" wrap="nowrap">
          <Title order={3}>{saved}</Title>
          <IconButton icon={IconPencil} label="Edit title" onClick={begin} />
        </Group>
      )}
    </div>
  );
}

export default EditableTitle;
