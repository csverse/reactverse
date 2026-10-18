import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { BaselineAlert, BaselineAlertProps } from './BaselineAlert';
import { events } from '../utils/storybook/events';
import { figma, RESPONSIVE_MODES } from '../utils/storybook/chromatic';
import { spy, clear } from '../utils/storybook/spy';

const meta: Meta<typeof BaselineAlert> = {
  title: 'Review Desk/BaselineAlert',
  component: BaselineAlert,
  tags: ['autodocs'],
  argTypes: events({
      onClose: 'Called when the close button is used. Passing it shows the close button.',
  }),
  args: {
    title: 'Baseline updated',
    children: 'Build 482 on main became the new baseline for 126 snapshots.',
  },
  parameters: figma('3:2'),
};
export default meta;
type Story = StoryObj<typeof BaselineAlert>;

export const Info: Story = {
  play: async ({ canvasElement }) => {
    // Mantine's Alert always exposes role="alert", so a screen reader announces it.
    await expect(within(canvasElement).getByRole('alert')).toBeVisible();
  },
};
export const Success: Story = { args: { tone: 'success' } };
export const Warning: Story = {
  args: {
    tone: 'warning',
    title: '14 snapshots need review',
    children: 'Changes were found in Tabs and BuildsTable. Review before merging.',
  },
};
export const ErrorTone: Story = {
  args: {
    tone: 'error',
    title: 'Build failed',
    children: 'Storybook could not start: Module not found "./BuildsTable".',
  },
  play: async ({ canvasElement }) => {
    const alert = within(canvasElement).getByRole('alert');
    await expect(alert).toHaveTextContent('Build failed');
  },
};
export const LongContent: Story = {
  args: {
    tone: 'warning',
    children:
      'This alert carries a long body so wrapping and line length can be checked at every width. '.repeat(
        4
      ),
  },
  parameters: { chromatic: { modes: RESPONSIVE_MODES } },
};

const Dismissible = ({ onClose, ...rest }: BaselineAlertProps) => {
  const [open, setOpen] = useState(true);
  return open ? (
    <BaselineAlert
      {...rest}
      onClose={() => {
        setOpen(false);
        onClose?.();
      }}
    />
  ) : (
    <p>Dismissed.</p>
  );
};

const dismissibleArgs = {
  tone: 'info' as const,
  title: 'TurboSnap is on',
  children: 'Only stories affected by your diff will be snapshotted.',
  onClose: spy('onClose'),
};

/** The close button only exists when `onClose` is passed. */
export const WithCloseButton: Story = {
  render: (args) => <Dismissible {...args} />,
  args: dismissibleArgs,
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Dismiss message' })
    ).toBeVisible();
  },
};

export const DismissedWithMouse: Story = {
  render: (args) => <Dismissible {...args} />,
  args: dismissibleArgs,
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    clear(args.onClose);
    await step('click the close button', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Dismiss message' }));
    });
    await step('the message is gone and onClose fired once', async () => {
      await expect(canvas.getByText('Dismissed.')).toBeVisible();
      await expect(args.onClose).toHaveBeenCalledTimes(1);
    });
  },
};

export const DismissedWithKeyboard: Story = {
  render: (args) => <Dismissible {...args} />,
  args: dismissibleArgs,
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    clear(args.onClose);
    await step('Tab reaches the close button', async () => {
      await userEvent.tab();
      await expect(canvas.getByRole('button', { name: 'Dismiss message' })).toHaveFocus();
    });
    await step('Enter dismisses it', async () => {
      await userEvent.keyboard('{Enter}');
      await expect(canvas.getByText('Dismissed.')).toBeVisible();
      await expect(args.onClose).toHaveBeenCalledTimes(1);
    });
  },
};
