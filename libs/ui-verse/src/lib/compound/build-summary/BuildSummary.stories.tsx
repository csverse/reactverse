import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { BuildSummary } from './BuildSummary';
import { parts } from '../../utils/storybook/parts';
import { events } from '../../utils/storybook/events';
import { spy, clear } from '../../utils/storybook/spy';
import { StateGrid, State } from '../../utils/storybook/StateGrid';
import { RtlFrame } from '../../utils/storybook/RtlFrame';
import { BEHAVIOUR_ONLY, MATRIX_MODES, MATRIX_RTL_MODES } from '../../utils/storybook/chromatic';

const meta: Meta<typeof BuildSummary> = {
  title: 'Compound/BuildSummary',
  component: BuildSummary,
  subcomponents: parts({ Heading: BuildSummary.Heading, Stats: BuildSummary.Stats, Stat: BuildSummary.Stat, Progress: BuildSummary.Progress }),
  tags: ['autodocs'],
  argTypes: events({ onView: 'On `BuildSummary.Heading`: called with the build number when View build is pressed. The button only shows when it is passed.' }),
  args: { status: 'pending', number: 481, branch: 'feature/tabs-keyboard-nav' },
};
export default meta;
type Story = StoryObj<typeof BuildSummary>;

const onView = spy('onView');

const Full = ({
  done = 126,
  failed = 0,
  changes = 14,
  ...args
}: React.ComponentProps<typeof BuildSummary> & { done?: number; failed?: number; changes?: number }) => (
  <BuildSummary {...args}>
    <BuildSummary.Heading onView={onView} />
    <BuildSummary.Stats>
      <BuildSummary.Stat label="Stories" value={98} />
      <BuildSummary.Stat label="Snapshots" value={434} delta={308} deltaLabel="vs last build" />
      <BuildSummary.Stat label="Changes" value={changes} delta={changes ? changes - 3 : -3} goodWhen="down" />
      <BuildSummary.Stat label="Build time" value={247} unit="seconds" delta={-31} goodWhen="down" />
    </BuildSummary.Stats>
    <BuildSummary.Progress done={done} total={126} failed={failed} />
  </BuildSummary>
);

const section = (c: HTMLElement, number = 481) => within(c).getByRole('region', { name: `Build ${number} summary` });

// ---- States ----

export const NeedsReview: Story = {
  render: (args) => <Full {...args} />,
  play: async ({ canvasElement }) => {
    await expect(within(section(canvasElement)).getByText('Needs review')).toBeVisible();
    await expect(within(section(canvasElement)).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  },
};
export const Accepted: Story = {
  render: (args) => <Full {...args} status="accepted" number={482} branch="main" changes={0} />,
  play: async ({ canvasElement }) => {
    await expect(within(section(canvasElement, 482)).getByText('Accepted')).toBeVisible();
    await expect(within(section(canvasElement, 482)).getByRole('heading', { name: /Build #482/ })).toBeVisible();
  },
};
export const Failed: Story = {
  render: (args) => <Full {...args} status="broken" number={477} branch="main" done={90} failed={36} changes={0} />,
  play: async ({ canvasElement }) => {
    // The failure is in the status text and in the numbers, not only in colour.
    await expect(within(section(canvasElement, 477)).getByText('Build failed')).toBeVisible();
    await expect(within(section(canvasElement, 477)).getByText('90 of 126, 36 failed')).toBeVisible();
  },
};
export const InProgress: Story = {
  render: (args) => <Full {...args} status="building" number={483} branch="fix/modal-focus-trap" done={31} changes={0} />,
  play: async ({ canvasElement }) => {
    await expect(within(section(canvasElement, 483)).getByText('In progress')).toBeVisible();
    await expect(within(section(canvasElement, 483)).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
  },
};
export const LongBranchName: Story = {
  render: (args) => <Full {...args} branch="feature/redesign-checkout-flow-with-saved-payment-methods-and-one-tap-reorder" />,
  play: async ({ canvasElement }) => {
    await expect(within(section(canvasElement)).getByText(/feature\/redesign-checkout-flow/)).toBeVisible();
  },
};
export const MinimalComposition: Story = {
  render: (args) => (
    <BuildSummary {...args}>
      <BuildSummary.Heading />
      <BuildSummary.Progress done={63} total={126} />
    </BuildSummary>
  ),
  play: async ({ canvasElement }) => {
    // Parts are optional: no stats, no View button.
    await expect(within(canvasElement).queryByRole('button', { name: 'View build' })).toBeNull();
    await expect(within(canvasElement).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
  },
};
export const StatsOnly: Story = {
  render: (args) => (
    <BuildSummary {...args}>
      <BuildSummary.Stats>
        <BuildSummary.Stat label="Stories" value={98} />
        <BuildSummary.Stat label="Snapshots" value={434} />
      </BuildSummary.Stats>
    </BuildSummary>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('434')).toBeVisible();
    await expect(within(canvasElement).queryByRole('heading')).toBeNull();
  },
};

// ---- Actions ----

export const ViewPressed: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => <Full {...args} />,
  play: async ({ canvasElement }) => {
    clear(onView);
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'View build' }));
    await expect(onView).toHaveBeenCalledTimes(1);
    await expect(onView).toHaveBeenCalledWith(481);
  },
};

export const ViewReportsTheRightBuild: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => <Full {...args} number={999} />,
  play: async ({ canvasElement }) => {
    clear(onView);
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'View build' }));
    await expect(onView).toHaveBeenCalledWith(999);
  },
};

export const ViewPressedWithKeyboard: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => <Full {...args} />,
  play: async ({ canvasElement }) => {
    clear(onView);
    await userEvent.tab();
    await expect(within(canvasElement).getByRole('button', { name: 'View build' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(onView).toHaveBeenCalledWith(481);
  },
};

export const NoViewButtonWithoutAHandler: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => (
    <BuildSummary {...args}>
      <BuildSummary.Heading />
    </BuildSummary>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button', { name: 'View build' })).toBeNull();
  },
};

// ---- Accessibility ----

export const SectionIsNamedAfterTheBuild: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => <Full {...args} />,
  play: async ({ canvasElement }) => {
    await expect(within(section(canvasElement)).getByRole('heading', { name: /Build #481/ })).toBeInTheDocument();
    await expect(within(section(canvasElement)).getByRole('progressbar')).toBeInTheDocument();
  },
};

export const HeadingIsLevelThree: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => <Full {...args} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('heading', { level: 3 })).toBeInTheDocument();
  },
};

export const StatChangesAreSpokenInWords: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => <Full {...args} />,
  play: async ({ canvasElement }) => {
    // Up/Down is written out, so the arrows and colours are optional extras.
    await expect(within(canvasElement).getAllByText(/Down/).length).toBeGreaterThan(0);
    await expect(within(canvasElement).getAllByText(/Up/).length).toBeGreaterThan(0);
  },
};

export const StatesMatrix: Story = {
  parameters: { chromatic: { modes: MATRIX_RTL_MODES } },
  render: (args) => (
    <StateGrid min={460}>
      <State label="needs review"><Full {...args} /></State>
      <State label="accepted"><Full {...args} status="accepted" number={482} branch="main" changes={0} /></State>
      <State label="failed"><Full {...args} status="broken" number={477} branch="main" done={90} failed={36} changes={0} /></State>
      <State label="in progress"><Full {...args} status="building" number={483} branch="fix/modal-focus-trap" done={31} changes={0} /></State>
      <State label="minimal">
        <BuildSummary {...args} number={484}>
          <BuildSummary.Heading />
          <BuildSummary.Progress done={63} total={126} />
        </BuildSummary>
      </State>
    </StateGrid>
  ),
  play: async ({ canvasElement }) => {
    // One caption per state: if a state disappears from the matrix, this fails.
    await expect(canvasElement.querySelectorAll('[data-state]')).toHaveLength(5);
  },
};
