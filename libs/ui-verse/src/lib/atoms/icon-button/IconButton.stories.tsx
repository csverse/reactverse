import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, waitFor } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { IconBell, IconCheck, IconTrash, IconX } from '@tabler/icons-react';
import { IconButton } from './IconButton';
import { events } from '../../utils/storybook/events';
import { spy, clear } from '../../utils/storybook/spy';

const meta: Meta<typeof IconButton> = {
  title: 'Atoms/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  argTypes: events({ onClick: 'Called when the button is pressed with mouse, Enter or Space. Not called when disabled or loading.' }),
  args: { icon: IconTrash, label: 'Delete comment', onClick: spy('onClick') },
  decorators: [(Story) => <div style={{ padding: '40px 24px' }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof IconButton>;

const button = (c: HTMLElement, name = 'Delete comment') => within(c).getByRole('button', { name });

// ---- Visual states, each with the facts that make it that state ----

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(button(canvasElement)).toBeEnabled();
    // The label is the name; nothing else is announced.
    await expect(button(canvasElement)).toHaveAttribute('aria-label', 'Delete comment');
  },
};

export const Filled: Story = {
  args: { icon: IconCheck, label: 'Approve change', variant: 'filled' },
  play: async ({ canvasElement }) => {
    await expect(button(canvasElement, 'Approve change')).toBeVisible();
  },
};

export const Outlined: Story = {
  args: { icon: IconX, label: 'Deny change', variant: 'default' },
  play: async ({ canvasElement }) => {
    await expect(button(canvasElement, 'Deny change')).toBeVisible();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await expect(button(canvasElement)).toBeDisabled();
  },
};

export const Loading: Story = {
  args: { icon: IconBell, label: 'Refresh notifications', loading: true },
  play: async ({ canvasElement }) => {
    await expect(button(canvasElement, 'Refresh notifications')).toBeDisabled();
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <IconButton key={size} {...args} size={size} label={`Delete (${size})`} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const size of ['sm', 'md', 'lg']) {
      await expect(button(canvasElement, `Delete (${size})`)).toBeVisible();
    }
  },
};

// ---- Actions ----

export const PressedWithMouse: Story = {
  play: async ({ canvasElement, args }) => {
    clear(args.onClick);
    await userEvent.click(button(canvasElement));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const PressedTwice: Story = {
  play: async ({ canvasElement, args }) => {
    clear(args.onClick);
    await userEvent.dblClick(button(canvasElement));
    // A double click is two presses. The component must not swallow or merge them.
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const DisabledDoesNotFire: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args, step }) => {
    clear(args.onClick);
    await step('clicking does nothing', async () => {
      await userEvent.click(button(canvasElement));
      await expect(args.onClick).not.toHaveBeenCalled();
    });
    await step('Tab skips it', async () => {
      await userEvent.tab();
      await expect(button(canvasElement)).not.toHaveFocus();
    });
  },
};

export const LoadingDoesNotFire: Story = {
  args: { loading: true },
  play: async ({ canvasElement, args }) => {
    clear(args.onClick);
    await userEvent.click(button(canvasElement));
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

// ---- Keyboard ----

export const PressedWithKeyboard: Story = {
  play: async ({ canvasElement, args, step }) => {
    clear(args.onClick);
    await step('Tab focuses it', async () => {
      await userEvent.tab();
      await expect(button(canvasElement)).toHaveFocus();
    });
    await step('Enter and Space each press it once', async () => {
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard(' ');
      await expect(args.onClick).toHaveBeenCalledTimes(2);
    });
  },
};

export const FocusStaysAfterPress: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    // Pressing must not move focus away, or keyboard users lose their place.
    await expect(button(canvasElement)).toHaveFocus();
  },
};

// ---- Accessibility: the tooltip repeats the name for sighted keyboard users ----

export const LabelShownOnFocus: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(button(canvasElement)).toHaveFocus();
    await expect(await within(document.body).findByRole('tooltip')).toHaveTextContent('Delete comment');
  },
};

export const LabelShownOnHover: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(button(canvasElement));
    await expect(await within(document.body).findByRole('tooltip')).toHaveTextContent('Delete comment');
  },
};

export const TooltipDismissedWithEscape: Story = {
  play: async ({ canvasElement, step }) => {
    await userEvent.tab();
    await within(document.body).findByRole('tooltip');
    await step('Escape hides the tooltip', async () => {
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(within(document.body).queryByRole('tooltip')).toBeNull());
    });
    await step('focus stays on the button', async () => {
      await expect(button(canvasElement)).toHaveFocus();
    });
  },
};
