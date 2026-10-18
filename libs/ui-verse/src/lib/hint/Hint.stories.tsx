import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, waitFor } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { HintTooltip, HintPopover } from './Hint';
import { events } from '../utils/storybook/events';
import { figma } from '../utils/storybook/chromatic';
import { spy, clear } from '../utils/storybook/spy';

const meta: Meta<typeof HintTooltip> = {
  title: 'Review Desk/Hint',
  component: HintTooltip,
  tags: ['autodocs'],
  args: {
    label: 'Pixel differences below this threshold are ignored. 0.063 is the default.',
    children: 'diffThreshold',
  },
  decorators: [
    // Room around the target so floating UI is never clipped in the snapshot.
    (Story) => (
      <div style={{ padding: '6rem 2rem' }}>
        <Story />
      </div>
    ),
  ],
  parameters: figma('7:2'),
};
export default meta;
type Story = StoryObj<typeof HintTooltip>;

const tooltip = () => within(document.body).findByRole('tooltip');
const noTooltip = () =>
  waitFor(() => expect(within(document.body).queryByRole('tooltip')).toBeNull());

export const TooltipClosed: Story = {
  play: async () => {
    await expect(within(document.body).queryByRole('tooltip')).toBeNull();
  },
};
/** Forced open so the visual snapshot contains the tooltip. */
export const TooltipOpen: Story = { args: { opened: true } };
export const TooltipBottom: Story = { args: { opened: true, position: 'bottom' } };
export const TooltipLeft: Story = { args: { opened: true, position: 'left' } };

export const TooltipOnHover: Story = {
  play: async ({ canvasElement, step }) => {
    const target = within(canvasElement).getByText('diffThreshold');
    await step('hovering shows the tooltip', async () => {
      await userEvent.hover(target);
      await expect(await tooltip()).toBeVisible();
    });
    await step('the target is described by the tooltip for screen readers', async () => {
      await expect(target.getAttribute('aria-describedby')).toBe((await tooltip()).id);
    });
    await step('moving away hides it', async () => {
      await userEvent.unhover(target);
      await noTooltip();
    });
  },
};

export const TooltipOnKeyboardFocus: Story = {
  play: async ({ canvasElement, step }) => {
    const target = within(canvasElement).getByText('diffThreshold');
    await step('Tab focuses the target and shows the tooltip', async () => {
      await userEvent.tab();
      await expect(target).toHaveFocus();
      await expect(await tooltip()).toBeVisible();
    });
    await step('Escape dismisses it without moving focus', async () => {
      await userEvent.keyboard('{Escape}');
      await noTooltip();
      await expect(target).toHaveFocus();
    });
  },
};

const PopoverDemo = ({ onChange }: { onChange: (open: boolean) => void }) => {
  const [opened, setOpened] = useState(false);
  return (
    <HintPopover
      trigger="What is a mode?"
      title="Modes"
      opened={opened}
      onChange={(next) => {
        setOpened(next);
        onChange(next);
      }}
    >
      A mode is a combination of globals such as theme and viewport. Each mode
      you list on a story creates its own snapshot.
    </HintPopover>
  );
};

type PopoverStory = StoryObj<typeof HintPopover>;
const popoverArgs = { onChange: spy('onChange') };
const popoverArgTypes = events({
  onChange: 'Called with true when the popover opens and false when it closes.',
});

export const PopoverClosed: PopoverStory = {
  args: popoverArgs,
  argTypes: popoverArgTypes,
  render: (args) => <PopoverDemo onChange={args.onChange as (o: boolean) => void} />,
};

export const PopoverOpenedByClick: PopoverStory = {
  args: popoverArgs,
  argTypes: popoverArgTypes,
  render: (args) => <PopoverDemo onChange={args.onChange as (o: boolean) => void} />,
  play: async ({ canvasElement, args, step }) => {
    clear(args.onChange);
    const trigger = within(canvasElement).getByRole('button', { name: 'What is a mode?' });
    await step('click opens the popover and reports true', async () => {
      await userEvent.click(trigger);
      await expect(await within(document.body).findByText('Modes')).toBeVisible();
      await expect(args.onChange).toHaveBeenLastCalledWith(true);
    });
    await step('the trigger tells assistive tech it controls a popup', async () => {
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
  },
};

export const PopoverClosedWithEscape: PopoverStory = {
  args: popoverArgs,
  argTypes: popoverArgTypes,
  render: (args) => <PopoverDemo onChange={args.onChange as (o: boolean) => void} />,
  play: async ({ canvasElement, args }) => {
    clear(args.onChange);
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'What is a mode?' }));
    await within(document.body).findByText('Modes');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(document.body).queryByText('Modes')).toBeNull());
    await expect(args.onChange).toHaveBeenLastCalledWith(false);
  },
};
