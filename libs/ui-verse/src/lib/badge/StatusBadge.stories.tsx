import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { StatusBadge, BuildStatus } from './StatusBadge';
import { events } from '../utils/storybook/events';
import { figma, RESPONSIVE_MODES } from '../utils/storybook/chromatic';
import { spy, clear } from '../utils/storybook/spy';

/**
 * `onClick` is optional. Only the `Clickable` story fires it, so the Actions
 * panel fills in there; plain visual stories have nothing to log.
 * The tests also check that status is carried by text, not by colour alone.
 */
const meta: Meta<typeof StatusBadge> = {
  title: 'Review Desk/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  argTypes: events({
      onClick: 'Called with the status when the badge is clicked. Passing it turns the badge into a button.',
  }),
  args: { status: 'accepted' },
  parameters: figma('1:2'),
};
export default meta;
type Story = StoryObj<typeof StatusBadge>;

const LABELS: Record<BuildStatus, string> = {
  accepted: 'Accepted',
  changed: 'Changes found',
  denied: 'Denied',
  building: 'In progress',
  pending: 'Needs review',
  broken: 'Build failed',
};
const ALL = Object.keys(LABELS) as BuildStatus[];

export const Accepted: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Accepted')).toBeVisible();
  },
};
export const ChangesFound: Story = {
  args: { status: 'changed', count: 12 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Changes found')).toBeVisible();
    await expect(canvas.getByText('12')).toBeVisible();
  },
};
export const Denied: Story = { args: { status: 'denied' } };
export const InProgress: Story = { args: { status: 'building' } };
export const CustomLabel: Story = {
  args: { status: 'pending', label: 'Awaiting Priya' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Awaiting Priya')).toBeVisible();
    await expect(canvas.queryByText('Needs review')).toBeNull();
  },
};

/** A clickable badge, e.g. to filter the builds table by status. */
export const Clickable: Story = {
  args: { status: 'changed', count: 12, onClick: spy('onClick') },
  play: async ({ canvasElement, args, step }) => {
    const badge = within(canvasElement).getByRole('button', { name: /Changes found/ });
    clear(args.onClick);
    await step('click reports the status', async () => {
      await userEvent.click(badge);
      await expect(args.onClick).toHaveBeenCalledWith('changed');
    });
    await step('Enter and Space also activate it', async () => {
      badge.focus();
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard(' ');
      await expect(args.onClick).toHaveBeenCalledTimes(3);
    });
  },
};

/** Every status and size side by side: one snapshot covers the whole matrix. */
export const Matrix: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {ALL.map((s) => (
            <StatusBadge key={s} status={s} size={size} />
          ))}
        </div>
      ))}
    </div>
  ),
  parameters: { chromatic: { modes: RESPONSIVE_MODES } },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    for (const status of ALL) {
      await step(`${status} is readable as text in all three sizes`, async () => {
        await expect(canvas.getAllByText(LABELS[status])).toHaveLength(3);
      });
    }
  },
};
