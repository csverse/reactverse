import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { ShortcutKey } from './ShortcutKey';

/** ShortcutKey has no events, so its Actions panel stays empty by design. */
const meta: Meta<typeof ShortcutKey> = {
  title: 'Atoms/ShortcutKey',
  component: ShortcutKey,
  tags: ['autodocs'],
  args: { keys: ['↵'] },
};
export default meta;
type Story = StoryObj<typeof ShortcutKey>;

const group = (c: HTMLElement, name: string) => within(c).getByRole('group', { name });

export const SingleKey: Story = {
  play: async ({ canvasElement }) => {
    await expect(group(canvasElement, 'Shortcut: Enter')).toBeInTheDocument();
  },
};
export const Combination: Story = {
  args: { keys: ['⌘', 'K'] },
  play: async ({ canvasElement }) => {
    await expect(group(canvasElement, 'Shortcut: Command plus K')).toBeInTheDocument();
  },
};
export const ThreeKeys: Story = {
  args: { keys: ['⌘', '⇧', 'A'] },
  play: async ({ canvasElement }) => {
    await expect(group(canvasElement, 'Shortcut: Command plus Shift plus A')).toBeInTheDocument();
  },
};
export const WordKeys: Story = {
  args: { keys: ['Ctrl', 'Alt', 'Delete'] },
  play: async ({ canvasElement }) => {
    await expect(group(canvasElement, 'Shortcut: Ctrl plus Alt plus Delete')).toBeInTheDocument();
  },
};
export const Escape: Story = {
  args: { keys: ['⎋'] },
  play: async ({ canvasElement }) => {
    await expect(group(canvasElement, 'Shortcut: Escape')).toBeInTheDocument();
  },
};

export const InASentence: Story = {
  render: (args) => (
    <p>
      Press <ShortcutKey {...args} keys={['A']} /> to accept the focused change, or <ShortcutKey {...args} keys={['D']} /> to deny it.
    </p>
  ),
  play: async ({ canvasElement }) => {
    await expect(group(canvasElement, 'Shortcut: A')).toBeInTheDocument();
    await expect(group(canvasElement, 'Shortcut: D')).toBeInTheDocument();
  },
};


export const SymbolsAreNotReadTwice: Story = {
  args: { keys: ['⌘', 'K'] },
  play: async ({ canvasElement }) => {
    // The drawn key caps are hidden from assistive tech; the group's name carries the meaning.
    for (const cap of Array.from(canvasElement.querySelectorAll('kbd'))) {
      await expect(cap).toHaveAttribute('aria-hidden', 'true');
    }
  },
};

export const NothingToFocus: Story = {
  play: async ({ canvasElement }) => {
    // A shortcut hint is documentation, not a control, so it adds no tab stop.
    await expect(canvasElement.querySelectorAll('button, a, input, [tabindex]')).toHaveLength(0);
  },
};
