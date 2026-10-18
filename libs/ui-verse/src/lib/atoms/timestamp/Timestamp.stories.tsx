import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { Timestamp } from './Timestamp';
import { StateGrid, State } from '../../utils/storybook/StateGrid';
import { BEHAVIOUR_ONLY, MATRIX_MODES, MATRIX_RTL_MODES } from '../../utils/storybook/chromatic';

// A fixed "now" keeps snapshots identical on every run.
const NOW = '2026-10-18T12:00:00Z';

/** Timestamp has no events, so its Actions panel stays empty by design. */
const meta: Meta<typeof Timestamp> = {
  title: 'Atoms/Timestamp',
  component: Timestamp,
  tags: ['autodocs'],
  args: { date: '2026-10-18T11:59:40Z', now: NOW },
};
export default meta;
type Story = StoryObj<typeof Timestamp>;

const text = (c: HTMLElement, t: string) => expect(within(c).getByText(t)).toBeInTheDocument();

export const JustNow: Story = { play: async ({ canvasElement }) => text(canvasElement, 'just now') };
export const MinutesAgo: Story = {
  args: { date: '2026-10-18T11:42:00Z' },
  play: async ({ canvasElement }) => text(canvasElement, '18 minutes ago'),
};
export const HoursAgo: Story = {
  args: { date: '2026-10-18T07:00:00Z' },
  play: async ({ canvasElement }) => text(canvasElement, '5 hours ago'),
};
export const Yesterday: Story = {
  args: { date: '2026-10-17T12:00:00Z' },
  play: async ({ canvasElement }) => text(canvasElement, 'yesterday'),
};
export const DaysAgo: Story = {
  args: { date: '2026-10-11T09:00:00Z' },
  play: async ({ canvasElement }) => text(canvasElement, '7 days ago'),
};
export const InTheFuture: Story = {
  args: { date: '2026-10-18T14:00:00Z' },
  play: async ({ canvasElement }) => text(canvasElement, 'in 2 hours'),
};
export const Tomorrow: Story = {
  args: { date: '2026-10-19T12:00:00Z' },
  play: async ({ canvasElement }) => text(canvasElement, 'tomorrow'),
};
export const Absolute: Story = {
  args: { format: 'absolute', date: '2026-10-11T09:30:00Z' },
  play: async ({ canvasElement }) => text(canvasElement, '11 Oct 2026, 09:30 UTC'),
};

export const MachineReadable: Story = {
  parameters: BEHAVIOUR_ONLY,
  args: { date: '2026-10-11T09:30:00Z' },
  play: async ({ canvasElement }) => {
    const time = canvasElement.querySelector('time');
    await expect(time).toHaveAttribute('datetime', '2026-10-11T09:30:00.000Z');
    await expect(time).toHaveAttribute('title', '11 Oct 2026, 09:30 UTC');
  },
};

export const AlwaysUTC: Story = {
  parameters: BEHAVIOUR_ONLY,
  args: { format: 'absolute', date: '2026-10-18T23:30:00Z' },
  play: async ({ canvasElement }) => {
    // The same instant reads the same for every viewer, whatever their timezone.
    await text(canvasElement, '18 Oct 2026, 23:30 UTC');
  },
};

export const IsATimeElement: Story = {
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('time')).toBeInTheDocument();
  },
};

export const StatesMatrix: Story = {
  parameters: { chromatic: { modes: MATRIX_MODES } },
  render: () => (
    <StateGrid min={200}>
      {[
        ['just now', '2026-10-18T11:59:40Z'],
        ['minutes ago', '2026-10-18T11:42:00Z'],
        ['hours ago', '2026-10-18T07:00:00Z'],
        ['yesterday', '2026-10-17T12:00:00Z'],
        ['days ago', '2026-10-11T09:00:00Z'],
        ['in the future', '2026-10-18T14:00:00Z'],
      ].map(([label, date]) => (
        <State key={label} label={label}><Timestamp date={date} now={NOW} /></State>
      ))}
      <State label="absolute"><Timestamp date="2026-10-11T09:30:00Z" now={NOW} format="absolute" /></State>
    </StateGrid>
  ),
  play: async ({ canvasElement }) => {
    // One caption per state: if a state disappears from the matrix, this fails.
    await expect(canvasElement.querySelectorAll('[data-state]')).toHaveLength(7);
  },
};
