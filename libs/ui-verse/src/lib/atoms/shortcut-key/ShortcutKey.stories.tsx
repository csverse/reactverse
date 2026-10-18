import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { ShortcutKey } from './ShortcutKey';
import { StateGrid, State } from '../../utils/storybook/StateGrid';
import { BEHAVIOUR_ONLY, MATRIX_MODES, MATRIX_RTL_MODES } from '../../utils/storybook/chromatic';

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
  parameters: BEHAVIOUR_ONLY,
  args: { keys: ['⌘', 'K'] },
  play: async ({ canvasElement }) => {
    // The drawn key caps are hidden from assistive tech; the group's name carries the meaning.
    for (const cap of Array.from(canvasElement.querySelectorAll('kbd'))) {
      await expect(cap).toHaveAttribute('aria-hidden', 'true');
    }
  },
};

export const NothingToFocus: Story = {
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement }) => {
    // A shortcut hint is documentation, not a control, so it adds no tab stop.
    await expect(canvasElement.querySelectorAll('button, a, input, [tabindex]')).toHaveLength(0);
  },
};

export const StatesMatrix: Story = {
  parameters: { chromatic: { modes: MATRIX_MODES } },
  render: () => (
    <StateGrid min={200}>
      <State label="single key"><ShortcutKey keys={['↵']} /></State>
      <State label="combination"><ShortcutKey keys={['⌘', 'K']} /></State>
      <State label="three keys"><ShortcutKey keys={['⌘', '⇧', 'A']} /></State>
      <State label="word keys"><ShortcutKey keys={['Ctrl', 'Alt', 'Delete']} /></State>
      <State label="in a sentence"><p style={{ margin: 0 }}>Press <ShortcutKey keys={['A']} /> to accept.</p></State>
    </StateGrid>
  ),
  play: async ({ canvasElement }) => {
    // One caption per state: if a state disappears from the matrix, this fails.
    await expect(canvasElement.querySelectorAll('[data-state]')).toHaveLength(5);
  },
};
