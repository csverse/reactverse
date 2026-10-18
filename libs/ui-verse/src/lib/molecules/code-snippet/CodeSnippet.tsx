import { ActionIcon, Box, CopyButton, Code } from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';

export interface CodeSnippetProps {
  code: string;
  /** What the snippet is, e.g. "command". Used in the accessible names. */
  label?: string;
  hideCopy?: boolean;
  /** Called with the code each time the copy button is pressed. */
  onCopy?: (code: string) => void;
}

export function CodeSnippet({ code, label = 'command', hideCopy = false, onCopy }: CodeSnippetProps) {
  return (
    <Box pos="relative">
      {/* Focusable so keyboard users can scroll long lines. */}
      <Code block tabIndex={0} role="region" aria-label={label} pr={hideCopy ? undefined : 48}>
        {code}
      </Code>
      {!hideCopy && (
        <CopyButton value={code}>
          {({ copied, copy }) => (
            <ActionIcon
              variant="subtle"
              pos="absolute"
              top={8}
              right={8}
              aria-label={copied ? 'Copied' : `Copy ${label}`}
              onClick={() => {
                copy();
                onCopy?.(code);
              }}
            >
              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
            </ActionIcon>
          )}
        </CopyButton>
      )}
    </Box>
  );
}

export default CodeSnippet;
