import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { BuildTabs, BuildTab } from './BuildTabs';
import { events } from '../utils/storybook/events';
import { figma, RESPONSIVE_MODES } from '../utils/storybook/chromatic';
import { spy, clear } from '../utils/storybook/spy';

const TABS: BuildTab[] = [
  {
    value: 'builds',
    label: 'Builds',
    count: 482,
    content: 'Every push to a branch creates a build. Builds are compared to the baseline of the same story on the target branch.',
  },
  {
    value: 'snapshots',
    label: 'Snapshots',
    count: 126,
    content: 'One snapshot per story, per browser, per mode. A story with two modes in two browsers makes four.',
  },
  {
    value: 'reviewers',
    label: 'Reviewers',
    count: 3,
    content: 'Reviewers approve or deny changes. A build is accepted when every change has an approval.',
  },
  {
    value: 'archived',
    label: 'Archived',
    disabled: true,
    content: 'Archived builds are read-only.',
  },
];

const meta: Meta<typeof BuildTabs> = {
  title: 'Review Desk/BuildTabs',
  component: BuildTabs,
  tags: ['autodocs'],
  argTypes: events({
      onChange: "Called with the selected tab's value when the selection changes.",
  }),
  args: { tabs: TABS, onChange: spy('onChange') },
  parameters: {
    ...figma('5:2'),
    chromatic: { modes: RESPONSIVE_MODES },
  },
};
export default meta;
type Story = StoryObj<typeof BuildTabs>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('tab', { name: /Builds/ })).toHaveAttribute('aria-selected', 'true');
  },
};
export const SecondTabOpen: Story = { args: { defaultValue: 'snapshots' } };
export const WithoutCounts: Story = {
  args: { tabs: TABS.map(({ count: _count, ...t }) => t) },
};
export const ManyTabsOverflow: Story = {
  args: {
    tabs: [
      ...TABS,
      ...['Branches', 'Components', 'Settings', 'Integrations'].map((label) => ({
        value: label.toLowerCase(),
        label,
        content: `${label} panel`,
      })),
    ],
  },
};

export const SwitchedByClick: Story = {
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    clear(args.onChange);
    await step('click the Snapshots tab', async () => {
      await userEvent.click(canvas.getByRole('tab', { name: /Snapshots/ }));
    });
    await step('it becomes selected and onChange reports its value', async () => {
      await expect(canvas.getByRole('tab', { name: /Snapshots/ })).toHaveAttribute('aria-selected', 'true');
      await expect(canvas.getByRole('tab', { name: /Builds/ })).toHaveAttribute('aria-selected', 'false');
      await expect(args.onChange).toHaveBeenLastCalledWith('snapshots');
    });
    await step('only the matching panel is shown', async () => {
      await expect(canvas.getByText(/One snapshot per story/)).toBeVisible();
      const other = canvas.queryByText(/Every push to a branch/);
      if (other) await expect(other).not.toBeVisible();
    });
  },
};

/** Arrow keys move focus along the list. Mantine also selects on arrow by default. */
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    clear(args.onChange);
    await step('Tab lands on the selected tab only', async () => {
      await userEvent.tab();
      await expect(canvas.getByRole('tab', { name: /Builds/ })).toHaveFocus();
    });
    await step('ArrowRight moves to the next tab', async () => {
      await userEvent.keyboard('{ArrowRight}');
      await expect(canvas.getByRole('tab', { name: /Snapshots/ })).toHaveFocus();
      await expect(args.onChange).toHaveBeenLastCalledWith('snapshots');
    });
    await step('ArrowLeft goes back', async () => {
      await userEvent.keyboard('{ArrowLeft}');
      await expect(canvas.getByRole('tab', { name: /Builds/ })).toHaveFocus();
    });
  },
};

export const DisabledTabCannotBeSelected: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    clear(args.onChange);
    const archived = canvas.getByRole('tab', { name: /Archived/ });
    await expect(archived).toBeDisabled();
    await userEvent.click(archived);
    await expect(archived).toHaveAttribute('aria-selected', 'false');
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

/** Screen readers need each panel named by its tab. */
export const PanelsAreLabelledByTheirTab: Story = {
  play: async ({ canvasElement }) => {
    const panel = within(canvasElement).getByRole('tabpanel', { name: /Builds/ });
    await expect(panel).toBeVisible();
  },
};
