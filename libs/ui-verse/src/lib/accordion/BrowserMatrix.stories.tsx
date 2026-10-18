import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { BrowserMatrix, BrowserResult } from './BrowserMatrix';
import { events } from '../utils/storybook/events';
import { figma, RESPONSIVE_MODES } from '../utils/storybook/chromatic';
import { spy, clear } from '../utils/storybook/spy';

const RESULTS: BrowserResult[] = [
  { browser: 'Chrome', version: '125', status: 'accepted', snapshots: 126 },
  {
    browser: 'Firefox',
    version: '126',
    status: 'changed',
    snapshots: 126,
    notes: '3 snapshots differ: font hinting on Tabs and BuildsTable.',
  },
  {
    browser: 'Safari',
    version: '17',
    status: 'pending',
    snapshots: 126,
    notes: 'Waiting on a reviewer to approve 2 changes.',
  },
  { browser: 'Edge', version: '125', status: 'accepted', snapshots: 126 },
];

const meta: Meta<typeof BrowserMatrix> = {
  title: 'Review Desk/BrowserMatrix',
  component: BrowserMatrix,
  tags: ['autodocs'],
  argTypes: events({
      onChange: 'Called with the browsers whose panels are open after each toggle.',
  }),
  args: { results: RESULTS, transitionDuration: 0, onChange: spy('onChange') },
  parameters: {
    ...figma('8:2'),
    chromatic: { modes: RESPONSIVE_MODES },
  },
};
export default meta;
type Story = StoryObj<typeof BrowserMatrix>;

export const AllCollapsed: Story = {
  play: async ({ canvasElement }) => {
    for (const b of within(canvasElement).getAllByRole('button')) {
      await expect(b).toHaveAttribute('aria-expanded', 'false');
    }
  },
};
export const FirstOpen: Story = { args: { defaultOpen: ['Chrome'] } };
export const AllOpen: Story = {
  args: { defaultOpen: RESULTS.map((r) => r.browser) },
};
export const Broken: Story = {
  args: {
    results: [
      { browser: 'Chrome', version: '125', status: 'broken', snapshots: 0, notes: 'Storybook failed to load.' },
    ],
    defaultOpen: ['Chrome'],
  },
};

/**
 * Real 200ms animation. `pauseAnimationAtEnd` (set globally) lets Chromatic
 * capture the final frame instead of a mid-transition one.
 */
export const AnimatedExpand: Story = {
  args: { transitionDuration: 200 },
  parameters: { chromatic: { pauseAnimationAtEnd: true, delay: 300 } },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /Firefox/ }));
    await expect(await within(canvasElement).findByText(/3 snapshots differ/)).toBeVisible();
  },
};

export const ExpandAndCollapse: Story = {
  play: async ({ canvasElement, args, step }) => {
    const control = within(canvasElement).getByRole('button', { name: /Safari/ });
    clear(args.onChange);
    await step('click expands the row and reports it', async () => {
      await userEvent.click(control);
      await expect(control).toHaveAttribute('aria-expanded', 'true');
      await expect(args.onChange).toHaveBeenLastCalledWith(['Safari']);
    });
    await step('click again collapses it', async () => {
      await userEvent.click(control);
      await expect(control).toHaveAttribute('aria-expanded', 'false');
      await expect(args.onChange).toHaveBeenLastCalledWith([]);
    });
  },
};

export const SeveralRowsOpenAtOnce: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    clear(args.onChange);
    await userEvent.click(canvas.getByRole('button', { name: /Chrome/ }));
    await userEvent.click(canvas.getByRole('button', { name: /Edge/ }));
    await expect(args.onChange).toHaveBeenLastCalledWith(['Chrome', 'Edge']);
  },
};

export const KeyboardOperation: Story = {
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    clear(args.onChange);
    await step('Tab focuses the first row', async () => {
      await userEvent.tab();
      await expect(canvas.getByRole('button', { name: /Chrome/ })).toHaveFocus();
    });
    await step('ArrowDown moves to the next row', async () => {
      await userEvent.keyboard('{ArrowDown}');
      await expect(canvas.getByRole('button', { name: /Firefox/ })).toHaveFocus();
    });
    await step('Enter opens it, Space closes it', async () => {
      await userEvent.keyboard('{Enter}');
      await expect(canvas.getByRole('button', { name: /Firefox/ })).toHaveAttribute('aria-expanded', 'true');
      await userEvent.keyboard(' ');
      await expect(canvas.getByRole('button', { name: /Firefox/ })).toHaveAttribute('aria-expanded', 'false');
    });
  },
};

/** An open panel is a labelled region, so screen readers can jump to it. */
export const OpenPanelIsALabelledRegion: Story = {
  args: { defaultOpen: ['Firefox'] },
  play: async ({ canvasElement }) => {
    const region = within(canvasElement).getByRole('region', { name: /Firefox/ });
    await expect(region).toHaveTextContent('3 snapshots differ');
  },
};
