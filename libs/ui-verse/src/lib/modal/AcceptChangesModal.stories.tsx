import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, waitFor } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { Button } from '@mantine/core';
import { AcceptChangesModal } from './AcceptChangesModal';
import { events } from '../utils/storybook/events';
import { figma, RESPONSIVE_MODES } from '../utils/storybook/chromatic';
import { spy, clear } from '../utils/storybook/spy';

const meta: Meta<typeof AcceptChangesModal> = {
  title: 'Review Desk/AcceptChangesModal',
  component: AcceptChangesModal,
  tags: ['autodocs'],
  argTypes: events({
      onClose: 'Called when the dialog is dismissed: Keep reviewing, the close button, Escape, or a click outside.',
      onConfirm: 'Called when Accept all is pressed.',
  }),
  args: {
    opened: true,
    changeCount: 14,
    transitionDuration: 0,
    onClose: spy('onClose'),
    onConfirm: spy('onConfirm'),
  },
  parameters: {
    ...figma('6:2'),
    chromatic: { modes: RESPONSIVE_MODES },
  },
};
export default meta;
type Story = StoryObj<typeof AcceptChangesModal>;

const dialog = () => within(document.body).findByRole('dialog');

export const Open: Story = {
  play: async ({ step }) => {
    const modal = await dialog();
    await step('the dialog is named by its title', async () => {
      await expect(modal).toHaveAccessibleName('Accept 14 changes?');
    });
    await step('focus moves into the dialog when it opens', async () => {
      await waitFor(() => expect(modal.contains(document.activeElement)).toBe(true));
    });
    await step('Tab keeps focus trapped inside the dialog', async () => {
      for (let i = 0; i < 6; i++) await userEvent.tab();
      await expect(modal.contains(document.activeElement)).toBe(true);
    });
  },
};
export const SingleChange: Story = {
  args: { changeCount: 1 },
  play: async () => {
    await expect(await dialog()).toHaveAccessibleName('Accept 1 change?');
  },
};
export const LongBranchName: Story = {
  args: { branch: 'feature/redesign-checkout-flow-with-saved-payment-methods' },
};
export const Closed: Story = {
  args: { opened: false },
  play: async () => {
    await expect(within(document.body).queryByRole('dialog')).toBeNull();
  },
};

/** Real trigger button, so open/close state and focus return can be tested. */
const WithTrigger = (args: React.ComponentProps<typeof AcceptChangesModal>) => {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Button onClick={() => setOpened(true)}>Review {args.changeCount} changes</Button>
      <AcceptChangesModal
        {...args}
        opened={opened}
        onClose={() => {
          setOpened(false);
          args.onClose();
        }}
        onConfirm={() => {
          setOpened(false);
          args.onConfirm();
        }}
      />
    </>
  );
};

const gone = () =>
  waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull());

export const OpenedViaTrigger: Story = {
  args: { opened: false },
  render: (args) => <WithTrigger {...args} />,
  play: async ({ canvasElement, step }) => {
    await step('click the trigger', async () => {
      await userEvent.click(within(canvasElement).getByRole('button'));
    });
    await step('a dialog opens and focus moves into it', async () => {
      const modal = await dialog();
      await expect(modal).toBeVisible();
      await waitFor(() => expect(modal.contains(document.activeElement)).toBe(true));
    });
  },
};

export const ConfirmedWithButton: Story = {
  args: { opened: false },
  render: (args) => <WithTrigger {...args} />,
  play: async ({ canvasElement, args, step }) => {
    clear(args.onConfirm, args.onClose);
    await userEvent.click(within(canvasElement).getByRole('button'));
    const modal = await dialog();
    await step('Accept all fires onConfirm once and closes the dialog', async () => {
      await userEvent.click(within(modal).getByRole('button', { name: 'Accept all' }));
      await expect(args.onConfirm).toHaveBeenCalledTimes(1);
      await gone();
    });
  },
};

export const DismissedWithKeepReviewing: Story = {
  args: { opened: false },
  render: (args) => <WithTrigger {...args} />,
  play: async ({ canvasElement, args }) => {
    clear(args.onConfirm, args.onClose);
    await userEvent.click(within(canvasElement).getByRole('button'));
    const modal = await dialog();
    await userEvent.click(within(modal).getByRole('button', { name: 'Keep reviewing' }));
    await expect(args.onClose).toHaveBeenCalledTimes(1);
    await expect(args.onConfirm).not.toHaveBeenCalled();
    await gone();
  },
};

export const ClosedWithEscape: Story = {
  args: { opened: false },
  render: (args) => <WithTrigger {...args} />,
  play: async ({ canvasElement, args, step }) => {
    clear(args.onConfirm, args.onClose);
    const trigger = within(canvasElement).getByRole('button');
    await userEvent.click(trigger);
    await dialog();
    await step('Escape closes the dialog without confirming', async () => {
      await userEvent.keyboard('{Escape}');
      await gone();
      await expect(args.onClose).toHaveBeenCalledTimes(1);
      await expect(args.onConfirm).not.toHaveBeenCalled();
    });
    await step('focus returns to the button that opened it', async () => {
      await waitFor(() => expect(trigger).toHaveFocus());
    });
  },
};
