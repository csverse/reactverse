import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { BuildsTable } from './BuildsTable';
import { SAMPLE_BUILDS } from './builds.data';
import { events } from '../utils/storybook/events';
import { figma, RESPONSIVE_MODES } from '../utils/storybook/chromatic';
import { spy, clear } from '../utils/storybook/spy';

const meta: Meta<typeof BuildsTable> = {
  title: 'Review Desk/BuildsTable',
  component: BuildsTable,
  tags: ['autodocs'],
  argTypes: events({
      onSortChange: 'Called with the new column and direction after each header click.',
  }),
  args: { builds: SAMPLE_BUILDS, onSortChange: spy('onSortChange') },
  parameters: {
    ...figma('9:2'),
    // Narrow widths exercise the horizontal scroller; wide ones the full layout.
    chromatic: { modes: RESPONSIVE_MODES, diffThreshold: 0.2 },
  },
};
export default meta;
type Story = StoryObj<typeof BuildsTable>;

const firstColumn = (root: HTMLElement) =>
  Array.from(root.querySelectorAll('tbody tr td:first-child')).map((td) => td.textContent);

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('table')).toBeVisible();
    await expect(canvas.getAllByRole('row')).toHaveLength(SAMPLE_BUILDS.length + 1);
  },
};
export const SortedByChanges: Story = {
  args: { initialSort: { key: 'changes', dir: 'desc' } },
};
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    // Assistive tech is told the table content is still loading.
    await expect(within(canvasElement).getByRole('table')).toHaveAttribute('aria-busy', 'true');
  },
};
export const Empty: Story = {
  args: { builds: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/No builds yet/)).toBeVisible();
  },
};
export const SingleBuild: Story = { args: { builds: SAMPLE_BUILDS.slice(0, 1) } };
export const ManyRows: Story = {
  args: {
    builds: Array.from({ length: 4 }, (_, i) =>
      SAMPLE_BUILDS.map((b) => ({ ...b, id: `${b.id}-${i}`, number: b.number - i * 6 }))
    ).flat(),
  },
};

export const SortStateIsExposed: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('columnheader', { name: /Build/ })).toHaveAttribute('aria-sort', 'descending');
    await expect(canvas.getByRole('columnheader', { name: /Branch/ })).toHaveAttribute('aria-sort', 'none');
  },
};

export const SortByBranch: Story = {
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    clear(args.onSortChange);
    const header = () => canvas.getByRole('columnheader', { name: /Branch/ });
    await step('first click sorts ascending', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /Branch/ }));
      await expect(header()).toHaveAttribute('aria-sort', 'ascending');
      await expect(args.onSortChange).toHaveBeenLastCalledWith({ key: 'branch', dir: 'asc' });
    });
    await step('second click sorts descending', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /Branch/ }));
      await expect(header()).toHaveAttribute('aria-sort', 'descending');
      await expect(args.onSortChange).toHaveBeenLastCalledWith({ key: 'branch', dir: 'desc' });
    });
    await step('only one column is sorted at a time', async () => {
      await expect(canvas.getByRole('columnheader', { name: /Build/ })).toHaveAttribute('aria-sort', 'none');
    });
  },
};

export const SortReordersRows: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('newest build is first by default', async () => {
      await expect(firstColumn(canvasElement)[0]).toBe('#482');
    });
    await step('clicking Build reverses the order', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /Build/ }));
      await expect(firstColumn(canvasElement)[0]).toBe('#477');
    });
  },
};

export const SortedWithKeyboard: Story = {
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    clear(args.onSortChange);
    await step('Tab reaches a sort button', async () => {
      const sortButton = canvas.getByRole('button', { name: /Build/ });
      // The scroll container may take a tab stop first; tab until the button has focus.
      for (let i = 0; i < 5 && document.activeElement !== sortButton; i++) {
        await userEvent.tab();
      }
      await expect(sortButton).toHaveFocus();
    });
    await step('Enter sorts', async () => {
      await userEvent.keyboard('{Enter}');
      await expect(args.onSortChange).toHaveBeenLastCalledWith({ key: 'number', dir: 'asc' });
    });
  },
};

/** Ignore regions: dynamic content is excluded from the diff. */
export const WithIgnoredRegion: Story = {
  render: (args) => (
    <div>
      <p data-chromatic="ignore" style={{ fontFamily: 'monospace' }}>
        Last synced: {new Date().toISOString()}
      </p>
      <BuildsTable {...args} />
    </div>
  ),
};

/** Excluded from snapshots entirely; still runs under the test-runner. */
export const NoSnapshot: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
};
