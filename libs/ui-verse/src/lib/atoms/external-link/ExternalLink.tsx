import { Anchor, VisuallyHidden } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import type { ReactNode } from 'react';

export interface ExternalLinkProps {
  href: string;
  children: ReactNode;
  showIcon?: boolean;
  /** Called with the href when the link is activated. Useful for analytics. The link still opens. */
  onNavigate?: (href: string) => void;
}

/** Opens in a new tab, says so to screen readers, and does not leak the opener. */
export function ExternalLink({ href, children, showIcon = true, onNavigate }: ExternalLinkProps) {
  return (
    <Anchor href={href} target="_blank" rel="noopener noreferrer" onClick={() => onNavigate?.(href)}>
      {children}
      {showIcon && <IconExternalLink size={14} aria-hidden style={{ marginLeft: 4, verticalAlign: '-2px' }} />}
      <VisuallyHidden> (opens in a new tab)</VisuallyHidden>
    </Anchor>
  );
}

export default ExternalLink;
