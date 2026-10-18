import { Alert } from '@mantine/core';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';

const TONES = {
  info: { color: 'blue', Icon: IconInfoCircle },
  success: { color: 'green', Icon: IconCircleCheck },
  warning: { color: 'yellow', Icon: IconAlertTriangle },
  error: { color: 'red', Icon: IconAlertCircle },
} as const;

export interface BaselineAlertProps {
  tone?: AlertTone;
  title: string;
  children?: ReactNode;
  /** When set, a close button is shown and this runs on dismiss. */
  onClose?: () => void;
}

export function BaselineAlert({
  tone = 'info',
  title,
  children,
  onClose,
}: BaselineAlertProps) {
  const { color, Icon } = TONES[tone];
  return (
    <Alert
      variant="light"
      color={color}
      title={title}
      icon={<Icon size={18} />}
      withCloseButton={Boolean(onClose)}
      closeButtonLabel="Dismiss message"
      onClose={onClose}
    >
      {children}
    </Alert>
  );
}

export default BaselineAlert;
