import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { LoadingIndicator } from './LoadingIndicator';
import { StateGrid, State } from '../../utils/storybook/StateGrid';
import { BEHAVIOUR_ONLY, MATRIX_MODES, MATRIX_RTL_MODES } from '../../utils/storybook/chromatic';

/**
 * LoadingIndicator has no events, so its Actions panel stays empty by design.
 * Its tests are about what a screen reader is told while something loads.
 */
const meta: Meta<typeof LoadingIndicator> = {
  title: 'Atoms/LoadingIndicator',
  component: LoadingIndicator,
  tags: ['autodocs'],
  args: { label: 'Loading builds' },
  // The spinner animates forever; Chromatic freezes infinite animations at their first frame.
  parameters: { chromatic: { delay: 100 } },
};
export default meta;
type Story = StoryObj<typeof LoadingIndicator>;

const status = (c: HTMLElement) => within(c).getByRole('status');

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(status(canvasElement)).toHaveTextContent('Loading builds');
  },
};
export const Small: Story = {
  args: { size: 'sm' },
  play: async ({ canvasElement }) => {
    await expect(status(canvasElement)).toHaveTextContent('Loading builds');
  },
};
export const Large: Story = {
  args: { size: 'lg', label: 'Capturing 126 snapshots' },
  play: async ({ canvasElement }) => {
    await expect(status(canvasElement)).toHaveTextContent('Capturing 126 snapshots');
  },
};
export const LongLabel: Story = {
  args: { label: 'Waiting for Storybook to build, then capturing every story in every mode and browser' },
  play: async ({ canvasElement }) => {
    await expect(status(canvasElement)).toHaveTextContent(/every story in every mode/);
  },
};

export const HiddenLabel: Story = {
  args: { hideLabel: true },
  play: async ({ canvasElement, step }) => {
    await step('the words are still in the status region', async () => {
      await expect(status(canvasElement)).toHaveTextContent('Loading builds');
    });
    await step('but it is visually hidden, so nothing is drawn beside the spinner', async () => {
      // toBeVisible would pass: VisuallyHidden clips the text, it does not use display:none.
      await expect(within(canvasElement).getByText('Loading builds')).toHaveClass('mantine-VisuallyHidden-root');
    });
  },
};

export const IsAPoliteStatus: Story = {
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement }) => {
    await expect(status(canvasElement)).toHaveAttribute('aria-live', 'polite');
  },
};

export const SpinnerIsHiddenFromAssistiveTech: Story = {
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement }) => {
    const spinner = canvasElement.querySelector('.mantine-Loader-root');
    await expect(spinner).toHaveAttribute('aria-hidden', 'true');
  },
};

export const NothingToFocus: Story = {
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement }) => {
    // A loading indicator is not interactive and must not add a tab stop.
    await expect(canvasElement.querySelectorAll('button, a, input, [tabindex]')).toHaveLength(0);
  },
};

export const StatesMatrix: Story = {
  parameters: { chromatic: { delay: 100, modes: MATRIX_MODES } },
  render: () => (
    <StateGrid min={240}>
      <State label="small"><LoadingIndicator size="sm" label="Loading builds" /></State>
      <State label="medium"><LoadingIndicator label="Loading builds" /></State>
      <State label="large"><LoadingIndicator size="lg" label="Capturing 126 snapshots" /></State>
      <State label="hidden label"><LoadingIndicator hideLabel label="Loading builds" /></State>
      <State label="long label"><LoadingIndicator label="Waiting for Storybook to build, then capturing every story in every mode" /></State>
    </StateGrid>
  ),
  play: async ({ canvasElement }) => {
    // One caption per state: if a state disappears from the matrix, this fails.
    await expect(canvasElement.querySelectorAll('[data-state]')).toHaveLength(5);
  },
};
