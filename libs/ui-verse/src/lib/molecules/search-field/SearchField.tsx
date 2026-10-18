import { CloseButton, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { KeyboardEvent, useRef, useState } from 'react';

export interface SearchFieldProps {
  /** Accessible name. There is no visible label, so keep it descriptive. */
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  disabled?: boolean;
  /** Called on every keystroke and when the field is cleared. */
  onChange?: (value: string) => void;
  /** Called with the current text when Enter is pressed. */
  onSubmit?: (value: string) => void;
}

export function SearchField({
  label = 'Search builds',
  placeholder = 'Branch, author or commit',
  defaultValue = '',
  disabled,
  onChange,
  onSubmit,
}: SearchFieldProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  const update = (next: string) => {
    setValue(next);
    onChange?.(next);
  };

  const clear = () => {
    update('');
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSubmit?.(value);
    if (e.key === 'Escape' && value) {
      e.preventDefault();
      clear();
    }
  };

  return (
    <TextInput
      ref={inputRef}
      role="searchbox"
      aria-label={label}
      placeholder={placeholder}
      value={value}
      disabled={disabled}
      leftSection={<IconSearch size={16} aria-hidden />}
      rightSection={value && !disabled ? <CloseButton aria-label="Clear search" size="sm" onClick={clear} /> : undefined}
      onChange={(e) => update(e.currentTarget.value)}
      onKeyDown={onKeyDown}
    />
  );
}

export default SearchField;
