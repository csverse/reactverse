import { ActionIcon, Tooltip } from '@mantine/core';
import type { ComponentType } from 'react';

export interface IconButtonProps {
  /** A Tabler icon component, e.g. `IconTrash`. */
  icon: ComponentType<{ size?: number | string }>;
  /** Names the button for screen readers and shows as its tooltip. Required: an icon alone has no name. */
  label: string;
  variant?: 'subtle' | 'default' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

const ICON_SIZE = { sm: 14, md: 18, lg: 22 } as const;

export function IconButton({
  icon: Icon,
  label,
  variant = 'subtle',
  size = 'md',
  disabled,
  loading,
  onClick,
}: IconButtonProps) {
  return (
    <Tooltip label={label} withArrow>
      <ActionIcon
        aria-label={label}
        variant={variant}
        size={size}
        disabled={disabled}
        loading={loading}
        onClick={onClick}
      >
        <Icon size={ICON_SIZE[size]} />
      </ActionIcon>
    </Tooltip>
  );
}

export default IconButton;
