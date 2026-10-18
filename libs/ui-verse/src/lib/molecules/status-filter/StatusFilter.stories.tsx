import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { StatusFilter } from './StatusFilter';
import { RESPONSIVE_MODES } from '../../utils/storybook/chromatic';
import { events } from '../../utils/storybook/events';
import { spy, clear } from '../../utils/storybook/spy';

const COUNTS = { all: 126, pending: 14, changed: 3, accepted: 98, denied: 1 };

const meta: Meta<typeof StatusFilter> = {
  title: 'Molecules/StatusFilter',
  component: StatusFilter,
  tags: ['autodocs'],
  argTypes: events({ onChange: 'Called with the chosen status ("all", "pending", "changed", "accepted" or "denied"). Not called when the chosen status is already selected.' }),
  args: { counts: COUNTS, onChange: spy('onChange') },
  parameters: { chromatic: { modes: RESPONSIVE_MODES } },
};
export default meta;
type Story = StoryObj<typeof StatusFilter>;

const radio = (c: HTMLElement, name: string | RegExp) => within(c).getByRole('radio', { name });

// ---- States ----

export const AllSelected: Story = {
  play: async ({ canvasElement }) => {
    await expect(radio(canvasElement, /^All/)).toBeChecked();
    await expect(within(canvasElement).getAllByRole('radio').filter((r) => (r as HTMLInputElement).checked)).toHaveLength(1);
  },
};
export const NeedsReviewSelected: Story = {
  args: { defaultValue: 'pending' },
  play: async ({ canvasElement }) => {
    await expect(radio(canvasElement, /Needs review/)).toBeChecked();
    await expect(radio(canvasElement, /^All/)).not.toBeChecked();
  },
};
export const WithoutCounts: Story = {
  args: { counts: {} },
  play: async ({ canvasElement }) => {
    await expect(radio(canvasElement, 'Accepted')).toBeInTheDocument();
  },
};
export const LargeCounts: Story = {
  args: { counts: { all: 12480, pending: 1402, changed: 318, accepted: 10755, denied: 5 } },
  play: async ({ canvasElement }) => {
    await expect(radio(canvasElement, 'All 12480')).toBeInTheDocument();
  },
};
export const ZeroCount: Story = {
  args: { counts: { ...COUNTS, denied: 0 } },
  play: async ({ canvasElement }) => {
    // Zero is information too, and must not be dropped.
    await expect(radio(canvasElement, 'Denied 0')).toBeInTheDocument();
  },
};

// ---- Actions ----

export const ChosenByClick: Story = {
  play: async ({ canvasElement, args, step }) => {
    clear(args.onChange);
    await step('click a status', async () => {
      await userEvent.click(within(canvasElement).getByText('Needs review'));
    });
    await step('it becomes checked, the old one clears, and the choice is reported once', async () => {
      await expect(radio(canvasElement, /Needs review/)).toBeChecked();
      await expect(radio(canvasElement, /^All/)).not.toBeChecked();
      await expect(args.onChange).toHaveBeenCalledTimes(1);
      await expect(args.onChange).toHaveBeenLastCalledWith('pending');
    });
  },
};

export const EveryStatusIsReported: Story = {
  play: async ({ canvasElement, args }) => {
    clear(args.onChange);
    for (const [label, value] of [['Changes found', 'changed'], ['Accepted', 'accepted'], ['Denied', 'denied'], ['All', 'all']]) {
      await userEvent.click(within(canvasElement).getByText(label));
      await expect(args.onChange).toHaveBeenLastCalledWith(value);
    }
  },
};

export const ReselectingDoesNotReport: Story = {
  args: { defaultValue: 'pending' },
  play: async ({ canvasElement, args }) => {
    clear(args.onChange);
    await userEvent.click(within(canvasElement).getByText('Needs review'));
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

// ---- Keyboard and accessibility ----

export const ChosenWithKeyboard: Story = {
  play: async ({ canvasElement, args, step }) => {
    clear(args.onChange);
    await step('Tab lands on the selected status only', async () => {
      await userEvent.tab();
      await expect(radio(canvasElement, /^All/)).toHaveFocus();
    });
    await step('Arrow keys move the selection and report it', async () => {
      await userEvent.keyboard('{ArrowRight}');
      await expect(args.onChange).toHaveBeenCalled();
      await expect(radio(canvasElement, /^All/)).not.toBeChecked();
    });
  },
};

export const GroupIsNamed: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('radiogroup', { name: 'Filter builds by status' })).toBeInTheDocument();
  },
};

export const CountsAreInTheNames: Story = {
  play: async ({ canvasElement }) => {
    // A screen reader hears "Needs review 14", not just the label.
    await expect(radio(canvasElement, 'Needs review 14')).toBeInTheDocument();
  },
};
