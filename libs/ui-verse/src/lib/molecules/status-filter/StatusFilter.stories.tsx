import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { StatusFilter } from './StatusFilter';
import { events } from '../../utils/storybook/events';
import { spy, clear } from '../../utils/storybook/spy';
import { StateGrid, State } from '../../utils/storybook/StateGrid';
import { RtlFrame, directionOf } from '../../utils/storybook/RtlFrame';
import { BEHAVIOUR_ONLY, MATRIX_MODES, MATRIX_RTL_MODES } from '../../utils/storybook/chromatic';

const COUNTS = { all: 126, pending: 14, changed: 3, accepted: 98, denied: 1 };

const meta: Meta<typeof StatusFilter> = {
  title: 'Molecules/StatusFilter',
  component: StatusFilter,
  tags: ['autodocs'],
  argTypes: events({ onChange: 'Called with the chosen status ("all", "pending", "changed", "accepted" or "denied"). Not called when the chosen status is already selected.' }),
  args: { counts: COUNTS, onChange: spy('onChange') },
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
  parameters: BEHAVIOUR_ONLY,
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
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement, args }) => {
    clear(args.onChange);
    for (const [label, value] of [['Changes found', 'changed'], ['Accepted', 'accepted'], ['Denied', 'denied'], ['All', 'all']]) {
      await userEvent.click(within(canvasElement).getByText(label));
      await expect(args.onChange).toHaveBeenLastCalledWith(value);
    }
  },
};

export const ReselectingDoesNotReport: Story = {
  parameters: BEHAVIOUR_ONLY,
  args: { defaultValue: 'pending' },
  play: async ({ canvasElement, args }) => {
    clear(args.onChange);
    await userEvent.click(within(canvasElement).getByText('Needs review'));
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

// ---- Keyboard and accessibility ----

export const ChosenWithKeyboard: Story = {
  parameters: BEHAVIOUR_ONLY,
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
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('radiogroup', { name: 'Filter builds by status' })).toBeInTheDocument();
  },
};

export const CountsAreInTheNames: Story = {
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement }) => {
    // A screen reader hears "Needs review 14", not just the label.
    await expect(radio(canvasElement, 'Needs review 14')).toBeInTheDocument();
  },
};

export const StatesMatrix: Story = {
  parameters: { chromatic: { modes: MATRIX_RTL_MODES } },
  render: (args) => (
    <StateGrid min={480}>
      <State label="all selected"><StatusFilter {...args} /></State>
      <State label="needs review selected"><StatusFilter {...args} defaultValue="pending" /></State>
      <State label="denied selected"><StatusFilter {...args} defaultValue="denied" /></State>
      <State label="without counts"><StatusFilter {...args} counts={{}} /></State>
      <State label="large counts"><StatusFilter {...args} counts={{ all: 12480, pending: 1402, changed: 318, accepted: 10755, denied: 5 }} /></State>
      <State label="zero count"><StatusFilter {...args} counts={{ ...COUNTS, denied: 0 }} /></State>
    </StateGrid>
  ),
  play: async ({ canvasElement }) => {
    // One caption per state: if a state disappears from the matrix, this fails.
    await expect(canvasElement.querySelectorAll('[data-state]')).toHaveLength(6);
  },
};

/** Right to left: the story itself is RTL, so choosing a status is tested, not only photographed. */
export const Rtl: Story = {
  render: (args) => (
    <RtlFrame>
      <StatusFilter {...args} />
    </RtlFrame>
  ),
  play: async ({ canvasElement, args, step }) => {
    clear(args.onChange);
    await step('the group lays out right to left', async () => {
      await expect(directionOf(within(canvasElement).getByRole('radiogroup'))).toBe('rtl');
    });
    await step('choosing a status still selects and reports it', async () => {
      await userEvent.click(within(canvasElement).getByText('Needs review'));
      await expect(radio(canvasElement, /Needs review/)).toBeChecked();
      await expect(args.onChange).toHaveBeenLastCalledWith('pending');
    });
  },
};
