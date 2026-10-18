import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { StatValue } from './StatValue';
import { StateGrid, State } from '../../utils/storybook/StateGrid';
import { BEHAVIOUR_ONLY, MATRIX_MODES, MATRIX_RTL_MODES } from '../../utils/storybook/chromatic';

/** StatValue has no events, so its Actions panel stays empty by design. */
const meta: Meta<typeof StatValue> = {
  title: 'Atoms/StatValue',
  component: StatValue,
  tags: ['autodocs'],
  args: { label: 'Snapshots', value: 12480 },
};
export default meta;
type Story = StoryObj<typeof StatValue>;

export const Plain: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('12,480')).toBeInTheDocument();
    await expect(within(canvasElement).queryByText(/Up|Down|No change/)).toBeNull();
  },
};
export const Increase: Story = {
  args: { delta: 320, deltaLabel: 'vs last week' },
  play: async ({ canvasElement }) => {
    // The direction is in the text, so it does not depend on the arrow or the colour.
    await expect(within(canvasElement).getByText(/Up/)).toBeInTheDocument();
    await expect(within(canvasElement).getByText(/\+320 vs last week/)).toBeInTheDocument();
  },
};
export const DropIsGood: Story = {
  args: { label: 'Failed builds', value: 3, delta: -5, goodWhen: 'down', deltaLabel: 'vs last week' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/Down/)).toBeInTheDocument();
    await expect(within(canvasElement).getByText(/-5 vs last week/)).toBeInTheDocument();
  },
};
export const DropIsBad: Story = {
  args: { label: 'Accepted snapshots', value: 98, delta: -12, deltaLabel: 'vs last build' },
  play: async ({ canvasElement }) => {
    // Same words as DropIsGood: the colour differs, the information does not.
    await expect(within(canvasElement).getByText(/Down/)).toBeInTheDocument();
  },
};
export const RiseIsBad: Story = {
  args: { label: 'Failed builds', value: 9, delta: 6, goodWhen: 'down', deltaLabel: 'vs last week' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/Up/)).toBeInTheDocument();
  },
};
export const NoChange: Story = {
  args: { delta: 0, deltaLabel: 'vs last week' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/No change/)).toBeInTheDocument();
  },
};
export const Percent: Story = {
  args: { label: 'Accepted', value: 78, unit: 'percent', delta: 4, deltaLabel: 'pts' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('78%')).toBeInTheDocument();
    await expect(within(canvasElement).getByText(/\+4% pts/)).toBeInTheDocument();
  },
};
export const Duration: Story = {
  args: { label: 'Build time', value: 247, unit: 'seconds', delta: -31, goodWhen: 'down' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('4m 07s')).toBeInTheDocument();
    await expect(within(canvasElement).getByText(/-31s/)).toBeInTheDocument();
  },
};
export const VeryLargeNumber: Story = {
  args: { value: 12345678 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('12,345,678')).toBeInTheDocument();
  },
};
export const ArrowIsDecorative: Story = {
  parameters: BEHAVIOUR_ONLY,
  args: { delta: 4 },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  },
};

export const StatesMatrix: Story = {
  parameters: { chromatic: { modes: MATRIX_MODES } },
  render: () => (
    <StateGrid min={200}>
      <State label="plain"><StatValue label="Snapshots" value={12480} /></State>
      <State label="increase"><StatValue label="Snapshots" value={12480} delta={320} deltaLabel="vs last week" /></State>
      <State label="drop is good"><StatValue label="Failed builds" value={3} delta={-5} goodWhen="down" deltaLabel="vs last week" /></State>
      <State label="drop is bad"><StatValue label="Accepted" value={98} delta={-12} deltaLabel="vs last build" /></State>
      <State label="rise is bad"><StatValue label="Failed builds" value={9} delta={6} goodWhen="down" /></State>
      <State label="no change"><StatValue label="Snapshots" value={12480} delta={0} /></State>
      <State label="percent"><StatValue label="Accepted" value={78} unit="percent" delta={4} /></State>
      <State label="duration"><StatValue label="Build time" value={247} unit="seconds" delta={-31} goodWhen="down" /></State>
    </StateGrid>
  ),
  play: async ({ canvasElement }) => {
    // One caption per state: if a state disappears from the matrix, this fails.
    await expect(canvasElement.querySelectorAll('[data-state]')).toHaveLength(8);
  },
};
