import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { EmptyState } from './EmptyState';
import { events } from '../../utils/storybook/events';
import { spy, clear } from '../../utils/storybook/spy';
import { StateGrid, State } from '../../utils/storybook/StateGrid';
import { BEHAVIOUR_ONLY, MATRIX_MODES, MATRIX_RTL_MODES } from '../../utils/storybook/chromatic';

const meta: Meta<typeof EmptyState> = {
  title: 'Molecules/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  argTypes: events({ onAction: 'Called when the action button is pressed. The button only shows when `actionLabel` is set.' }),
  args: {
    title: 'No builds yet',
    description: 'Run Chromatic once to create your first baseline. Later builds are compared against it.',
    onAction: spy('onAction'),
  },
};
export default meta;
type Story = StoryObj<typeof EmptyState>;

const heading = (c: HTMLElement, name: string) => within(c).getByRole('heading', { level: 4, name });

// ---- States ----

export const NoBuilds: Story = {
  args: { actionLabel: 'Copy the command' },
  play: async ({ canvasElement }) => {
    await expect(heading(canvasElement, 'No builds yet')).toBeVisible();
    await expect(within(canvasElement).getByRole('button', { name: 'Copy the command' })).toBeVisible();
  },
};
export const NoSearchResults: Story = {
  args: { title: 'No builds match "tabs"', description: 'Try a different branch name, author or commit.' },
  play: async ({ canvasElement }) => {
    await expect(heading(canvasElement, 'No builds match "tabs"')).toBeVisible();
    await expect(within(canvasElement).queryByRole('button')).toBeNull();
  },
};
export const ErrorTone: Story = {
  args: {
    tone: 'error',
    title: 'Builds could not be loaded',
    description: 'The request to Chromatic timed out.',
    actionLabel: 'Try again',
  },
  play: async ({ canvasElement }) => {
    await expect(heading(canvasElement, 'Builds could not be loaded')).toBeVisible();
    await expect(within(canvasElement).getByRole('button', { name: 'Try again' })).toBeVisible();
  },
};
// Rendered directly: an `undefined` arg does not reliably cancel the description set in meta.
export const TitleOnly: Story = {
  render: () => <EmptyState title="Nothing to review" />,
  play: async ({ canvasElement }) => {
    await expect(heading(canvasElement, 'Nothing to review')).toBeVisible();
    await expect(canvasElement.querySelectorAll('p')).toHaveLength(0);
  },
};
export const LongCopy: Story = {
  args: { description: 'This project has no builds on any branch. '.repeat(6), actionLabel: 'Copy the command' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Copy the command' })).toBeVisible();
  },
};

// ---- Actions ----

export const ActionPressed: Story = {
  parameters: BEHAVIOUR_ONLY,
  args: { actionLabel: 'Copy the command' },
  play: async ({ canvasElement, args }) => {
    clear(args.onAction);
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Copy the command' }));
    await expect(args.onAction).toHaveBeenCalledTimes(1);
  },
};

export const ActionLabelWithoutHandlerStillRenders: Story = {
  parameters: BEHAVIOUR_ONLY,
  args: { actionLabel: 'Try again', onAction: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Try again' })).toBeVisible();
  },
};

export const HandlerWithoutLabelShowsNoButton: Story = {
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement }) => {
    // `onAction` is set in meta but there is no `actionLabel`, so there is nothing to press.
    await expect(within(canvasElement).queryByRole('button')).toBeNull();
  },
};

// ---- Keyboard and accessibility ----

export const ActionPressedWithKeyboard: Story = {
  parameters: BEHAVIOUR_ONLY,
  args: { actionLabel: 'Copy the command' },
  play: async ({ canvasElement, args, step }) => {
    clear(args.onAction);
    await step('Tab lands on the action', async () => {
      await userEvent.tab();
      await expect(within(canvasElement).getByRole('button', { name: 'Copy the command' })).toHaveFocus();
    });
    await step('Enter and Space each press it', async () => {
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard(' ');
      await expect(args.onAction).toHaveBeenCalledTimes(2);
    });
  },
};

export const HasAHeading: Story = {
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement }) => {
    await expect(heading(canvasElement, 'No builds yet')).toBeInTheDocument();
  },
};

export const IconIsDecorative: Story = {
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  },
};

export const ReadOnlyHasNoTabStops: Story = {
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('button, a, input, [tabindex]')).toHaveLength(0);
  },
};

export const StatesMatrix: Story = {
  parameters: { chromatic: { modes: MATRIX_MODES } },
  render: () => (
    <StateGrid min={340}>
      <State label="no builds, with action"><EmptyState title="No builds yet" description="Run Chromatic once to create your first baseline." actionLabel="Copy the command" /></State>
      <State label="no search results"><EmptyState title={'No builds match "tabs"'} description="Try a different branch name, author or commit." /></State>
      <State label="error"><EmptyState tone="error" title="Builds could not be loaded" description="The request to Chromatic timed out." actionLabel="Try again" /></State>
      <State label="title only"><EmptyState title="Nothing to review" /></State>
      <State label="long copy"><EmptyState title="No builds" description={'This project has no builds on any branch. '.repeat(5)} actionLabel="Copy the command" /></State>
    </StateGrid>
  ),
  play: async ({ canvasElement }) => {
    // One caption per state: if a state disappears from the matrix, this fails.
    await expect(canvasElement.querySelectorAll('[data-state]')).toHaveLength(5);
  },
};
