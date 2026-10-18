import { Checkbox, Stack, Text } from '@mantine/core';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

interface ListContext {
  ids: string[];
  selected: string[];
  disabledIds: string[];
  toggle: (id: string) => void;
  setAll: (on: boolean) => void;
}

const Ctx = createContext<ListContext | null>(null);

const useList = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('SelectableList parts must be rendered inside <SelectableList>.');
  return ctx;
};

export interface SelectableListProps {
  /** Every item id, in order. The list needs them to know what "all" means. */
  ids: string[];
  /** Items that cannot be changed, and that Select all skips. */
  disabledIds?: string[];
  defaultSelected?: string[];
  /** Accessible name of the group. */
  label?: string;
  /** Called with the selected ids, in list order, after every change. */
  onSelectionChange?: (selected: string[]) => void;
  children: ReactNode;
}

function Root({ ids, disabledIds = [], defaultSelected = [], label = 'Items', onSelectionChange, children }: SelectableListProps) {
  const [selected, setSelected] = useState(defaultSelected);

  const commit = (next: string[]) => {
    const ordered = ids.filter((id) => next.includes(id));
    setSelected(ordered);
    onSelectionChange?.(ordered);
  };

  const toggle = (id: string) => commit(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  const setAll = (on: boolean) => {
    const locked = selected.filter((id) => disabledIds.includes(id));
    commit(on ? [...locked, ...ids.filter((id) => !disabledIds.includes(id))] : locked);
  };

  return (
    <Ctx.Provider value={{ ids, selected, disabledIds, toggle, setAll }}>
      <Stack role="group" aria-label={label} gap="sm">
        {children}
      </Stack>
    </Ctx.Provider>
  );
}

function SelectAll() {
  const { ids, selected, disabledIds, setAll } = useList();
  const selectable = ids.filter((id) => !disabledIds.includes(id));
  const chosen = selectable.filter((id) => selected.includes(id));
  const all = selectable.length > 0 && chosen.length === selectable.length;
  const mixed = chosen.length > 0 && !all;
  const input = useRef<HTMLInputElement>(null);

  // The native property is what exposes "partly selected" to assistive tech.
  // Mantine only draws the dash, and axe rejects aria-checked="mixed" on a native checkbox.
  useEffect(() => {
    if (input.current) input.current.indeterminate = mixed;
  }, [mixed]);

  return (
    <Checkbox
      ref={input}
      label="Select all"
      fw={600}
      checked={all}
      indeterminate={mixed}
      disabled={selectable.length === 0}
      onChange={(e) => setAll(e.currentTarget.checked)}
    />
  );
}

function Summary() {
  const { ids, selected } = useList();
  return (
    <Text size="sm" c="dimmed" aria-live="polite">
      {selected.length} of {ids.length} selected
    </Text>
  );
}

export interface ItemProps {
  id: string;
  label: string;
  description?: string;
}

function Item({ id, label, description }: ItemProps) {
  const { selected, disabledIds, toggle } = useList();
  const locked = disabledIds.includes(id);
  return (
    <Checkbox
      label={label}
      description={description}
      checked={selected.includes(id)}
      disabled={locked}
      // The disabled attribute already blocks this in a browser; the guard keeps a locked item
      // locked even if a change event reaches it some other way.
      onChange={() => !locked && toggle(id)}
    />
  );
}

export const SelectableList = Object.assign(Root, { SelectAll, Summary, Item });

export default SelectableList;
