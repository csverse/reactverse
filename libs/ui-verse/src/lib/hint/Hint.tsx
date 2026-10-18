import { Button, Popover, Text, Tooltip } from '@mantine/core';
import type { ReactNode } from 'react';

export interface HintTooltipProps {
  label: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Controlled open state. Leave undefined for normal hover/focus behaviour. */
  opened?: boolean;
}

/** Short, non-interactive explanation shown on hover or keyboard focus. */
export function HintTooltip({
  label,
  children,
  position = 'top',
  opened,
}: HintTooltipProps) {
  return (
    <Tooltip
      label={label}
      position={position}
      opened={opened}
      withArrow
      multiline
      w={240}
      transitionProps={{ duration: 0 }}
    >
      <Text
        span
        tabIndex={0}
        td="underline"
        style={{ textDecorationStyle: 'dotted', cursor: 'help' }}
      >
        {children}
      </Text>
    </Tooltip>
  );
}

export interface HintPopoverProps {
  trigger: string;
  title: string;
  children: ReactNode;
  opened?: boolean;
  onChange?: (opened: boolean) => void;
}

/** Longer explanation the reader opens on purpose; may hold links. */
export function HintPopover({
  trigger,
  title,
  children,
  opened,
  onChange,
}: HintPopoverProps) {
  return (
    <Popover
      opened={opened}
      onChange={onChange}
      width={280}
      position="bottom-start"
      withArrow
      shadow="md"
      transitionProps={{ duration: 0 }}
    >
      <Popover.Target>
        <Button
          variant="default"
          onClick={() => onChange?.(!opened)}
          // Mantine only closes on Escape from inside the dropdown. Focus stays on the trigger
          // here, so without this a keyboard user could not dismiss the popover.
          onKeyDown={(e) => {
            if (e.key === 'Escape' && opened) onChange?.(false);
          }}
        >
          {trigger}
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Text fw={600} size="sm" mb={4}>
          {title}
        </Text>
        <Text size="sm" c="dimmed">
          {children}
        </Text>
      </Popover.Dropdown>
    </Popover>
  );
}
