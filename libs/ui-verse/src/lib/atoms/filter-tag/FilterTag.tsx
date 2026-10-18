import { Pill } from '@mantine/core';

export interface FilterTagProps {
  label: string;
  /** When set, the tag shows a remove button and calls this with its label. */
  onRemove?: (label: string) => void;
  disabled?: boolean;
}

export function FilterTag({ label, onRemove, disabled }: FilterTagProps) {
  return (
    <Pill
      withRemoveButton={Boolean(onRemove) && !disabled}
      onRemove={() => onRemove?.(label)}
      removeButtonProps={{ 'aria-label': `Remove filter ${label}`, tabIndex: 0, 'aria-hidden': false }}
      disabled={disabled}
    >
      {label}
    </Pill>
  );
}

export default FilterTag;
