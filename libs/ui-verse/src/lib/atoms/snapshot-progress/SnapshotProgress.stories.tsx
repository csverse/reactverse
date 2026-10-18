import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { SnapshotProgress } from './SnapshotProgress';

/** SnapshotProgress has no events, so its Actions panel stays empty by design. */
const meta: Meta<typeof SnapshotProgress> = {
  title: 'Atoms/SnapshotProgress',
  component: SnapshotProgress,
  tags: ['autodocs'],
  args: { done: 98, total: 126 },
  decorators: [(Story) => <div style={{ maxWidth: 420 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof SnapshotProgress>;

const bar = (c: HTMLElement) => within(c).getByRole('progressbar', { name: 'Snapshot progress' });

export const InProgress: Story = {
  play: async ({ canvasElement, step }) => {
    await step('the bar reports 78%', async () => {
      await expect(bar(canvasElement)).toHaveAttribute('aria-valuenow', '78');
      await expect(bar(canvasElement)).toHaveAttribute('aria-valuetext', '78%');
    });
    await step('the counts are also written out', async () => {
      await expect(within(canvasElement).getByText('98 of 126')).toBeInTheDocument();
    });
  },
};
export const NotStarted: Story = {
  args: { done: 0 },
  play: async ({ canvasElement }) => {
    await expect(bar(canvasElement)).toHaveAttribute('aria-valuenow', '0');
  },
};
export const Complete: Story = {
  args: { done: 126 },
  play: async ({ canvasElement }) => {
    await expect(bar(canvasElement)).toHaveAttribute('aria-valuenow', '100');
  },
};
export const WithFailures: Story = {
  args: { done: 120, failed: 6 },
  play: async ({ canvasElement }) => {
    // Failure is stated in words as well as shown in red.
    await expect(within(canvasElement).getByText('120 of 126, 6 failed')).toBeInTheDocument();
  },
};
export const NoSnapshotsYet: Story = {
  args: { done: 0, total: 0 },
  play: async ({ canvasElement }) => {
    await expect(bar(canvasElement)).toHaveAttribute('aria-valuenow', '0');
    await expect(within(canvasElement).queryByText(/NaN/)).toBeNull();
  },
};
export const Overcounted: Story = {
  args: { done: 130, total: 126 },
  play: async ({ canvasElement }) => {
    await expect(bar(canvasElement)).toHaveAttribute('aria-valuenow', '100');
  },
};
export const RoundsToTheNearestPercent: Story = {
  args: { done: 2, total: 3 },
  play: async ({ canvasElement }) => {
    await expect(bar(canvasElement)).toHaveAttribute('aria-valuenow', '67');
  },
};
export const AlmostThere: Story = {
  args: { done: 125, total: 126 },
  play: async ({ canvasElement }) => {
    // 99.2% rounds to 99, not 100, so the bar never claims to be done early.
    await expect(bar(canvasElement)).toHaveAttribute('aria-valuenow', '99');
  },
};
