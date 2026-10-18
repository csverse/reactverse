import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { Timestamp } from './Timestamp';

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
  args: { date: '2026-10-11T09:30:00Z' },
  play: async ({ canvasElement }) => {
    const time = canvasElement.querySelector('time');
    await expect(time).toHaveAttribute('datetime', '2026-10-11T09:30:00.000Z');
    await expect(time).toHaveAttribute('title', '11 Oct 2026, 09:30 UTC');
  },
};

export const AlwaysUTC: Story = {
  args: { format: 'absolute', date: '2026-10-18T23:30:00Z' },
  play: async ({ canvasElement }) => {
    // The same instant reads the same for every viewer, whatever their timezone.
    await text(canvasElement, '18 Oct 2026, 23:30 UTC');
  },
};

export const IsATimeElement: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('time')).toBeInTheDocument();
  },
};
