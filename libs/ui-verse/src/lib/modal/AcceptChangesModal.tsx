import { Button, Code, Group, Modal, Text } from '@mantine/core';

export interface AcceptChangesModalProps {
  opened: boolean;
  changeCount: number;
  branch?: string;
  onConfirm: () => void;
  onClose: () => void;
  /** Set to 0 to skip the open animation (used for snapshots). */
  transitionDuration?: number;
}

export function AcceptChangesModal({
  opened,
  changeCount,
  branch = 'main',
  onConfirm,
  onClose,
  transitionDuration = 150,
}: AcceptChangesModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Accept ${changeCount} ${changeCount === 1 ? 'change' : 'changes'}?`}
      centered
      transitionProps={{ duration: transitionDuration }}
    >
      <Text size="sm">
        Accepted snapshots become the baseline for <Code>{branch}</Code>. Later
        builds will be compared against them.
      </Text>
      <Group justify="flex-end" mt="lg">
        <Button variant="default" onClick={onClose}>
          Keep reviewing
        </Button>
        <Button onClick={onConfirm}>Accept all</Button>
      </Group>
    </Modal>
  );
}

export default AcceptChangesModal;
