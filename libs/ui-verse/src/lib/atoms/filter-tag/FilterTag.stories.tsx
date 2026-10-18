import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { FilterTag } from './FilterTag';
import { events } from '../../utils/storybook/events';
import { spy, clear } from '../../utils/storybook/spy';

const meta: Meta<typeof FilterTag> = {
  title: 'Atoms/FilterTag',
  component: FilterTag,
  tags: ['autodocs'],
  argTypes: events({ onRemove: "Called with the tag's label when its remove button is pressed. Passing it shows the button." }),
  args: { label: 'Firefox' },
};
export default meta;
type Story = StoryObj<typeof FilterTag>;

const remove = (c: HTMLElement, label = 'Firefox') => within(c).getByRole('button', { name: `Remove filter ${label}` });

export const ReadOnly: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Firefox')).toBeVisible();
    await expect(within(canvasElement).queryByRole('button')).toBeNull();
  },
};

export const Removable: Story = {
  args: { onRemove: spy('onRemove') },
  play: async ({ canvasElement }) => {
    await expect(remove(canvasElement)).toBeVisible();
  },
};

export const Disabled: Story = {
  args: { onRemove: spy('onRemove'), disabled: true },
  play: async ({ canvasElement }) => {
    // A disabled tag cannot be removed, so it does not offer the button at all.
    await expect(within(canvasElement).queryByRole('button')).toBeNull();
  },
};

export const LongLabel: Story = {
  args: { label: 'feature/redesign-checkout-flow-with-saved-payment-methods', onRemove: spy('onRemove') },
  play: async ({ canvasElement }) => {
    await expect(remove(canvasElement, 'feature/redesign-checkout-flow-with-saved-payment-methods')).toBeVisible();
  },
};

export const Group: Story = {
  args: { onRemove: spy('onRemove') },
  render: (args) => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {['Chrome', 'Firefox', 'Safari', 'dark mode', 'mobile'].map((l) => (
        <FilterTag key={l} label={l} onRemove={args.onRemove} />
      ))}
    </div>
  ),
  play: async ({ canvasElement, args, step }) => {
    clear(args.onRemove);
    await step('every tag has its own, distinguishable remove button', async () => {
      await expect(within(canvasElement).getAllByRole('button')).toHaveLength(5);
    });
    await step('removing one reports only that one', async () => {
      await userEvent.click(remove(canvasElement, 'Safari'));
      await expect(args.onRemove).toHaveBeenCalledTimes(1);
      await expect(args.onRemove).toHaveBeenCalledWith('Safari');
    });
  },
};

// ---- Actions ----

export const RemovedWithMouse: Story = {
  args: { onRemove: spy('onRemove') },
  play: async ({ canvasElement, args }) => {
    clear(args.onRemove);
    await userEvent.click(remove(canvasElement));
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
    await expect(args.onRemove).toHaveBeenCalledWith('Firefox');
  },
};

export const ClickingTheLabelDoesNotRemove: Story = {
  args: { onRemove: spy('onRemove') },
  play: async ({ canvasElement, args }) => {
    clear(args.onRemove);
    await userEvent.click(within(canvasElement).getByText('Firefox'));
    await expect(args.onRemove).not.toHaveBeenCalled();
  },
};

// ---- Keyboard and accessibility ----

export const RemovedWithKeyboard: Story = {
  args: { onRemove: spy('onRemove') },
  play: async ({ canvasElement, args, step }) => {
    clear(args.onRemove);
    await step('Tab reaches the remove button', async () => {
      await userEvent.tab();
      await expect(remove(canvasElement)).toHaveFocus();
    });
    await step('Enter removes the tag', async () => {
      await userEvent.keyboard('{Enter}');
      await expect(args.onRemove).toHaveBeenCalledWith('Firefox');
    });
  },
};

export const RemovedWithSpace: Story = {
  args: { onRemove: spy('onRemove') },
  play: async ({ canvasElement, args }) => {
    clear(args.onRemove);
    remove(canvasElement).focus();
    await userEvent.keyboard(' ');
    await expect(args.onRemove).toHaveBeenCalledWith('Firefox');
  },
};

export const RemoveButtonIsExposedToAssistiveTech: Story = {
  args: { onRemove: spy('onRemove') },
  play: async ({ canvasElement }) => {
    // Mantine hides this button by default; the wrapper must undo that.
    await expect(remove(canvasElement)).not.toHaveAttribute('aria-hidden', 'true');
    await expect(remove(canvasElement)).toHaveAttribute('tabindex', '0');
  },
};
