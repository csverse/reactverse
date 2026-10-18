import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { FilterBar } from './FilterBar';
import { parts } from '../../utils/storybook/parts';
import { events } from '../../utils/storybook/events';
import { spy, clear } from '../../utils/storybook/spy';
import { StateGrid, State } from '../../utils/storybook/StateGrid';
import { RtlFrame, directionOf } from '../../utils/storybook/RtlFrame';
import { BEHAVIOUR_ONLY, MATRIX_MODES, MATRIX_RTL_MODES } from '../../utils/storybook/chromatic';

const COUNTS = { all: 126, pending: 14, changed: 3, accepted: 98, denied: 1 };

const meta: Meta<typeof FilterBar> = {
  title: 'Compound/FilterBar',
  component: FilterBar,
  subcomponents: parts({ Search: FilterBar.Search, Status: FilterBar.Status, Tags: FilterBar.Tags, Reset: FilterBar.Reset }),
  tags: ['autodocs'],
  argTypes: events({ onChange: 'Called with { query, status, tags } after every change, including Clear all filters. The object is always complete.' }),
  args: { onChange: spy('onChange') },
};
export default meta;
type Story = StoryObj<typeof FilterBar>;

const Bar = (args: Omit<React.ComponentProps<typeof FilterBar>, 'children'>) => (
  <FilterBar {...args}>
    <FilterBar.Search />
    <FilterBar.Status counts={COUNTS} />
    <FilterBar.Tags />
    <FilterBar.Reset />
  </FilterBar>
);

const search = (c: HTMLElement) => within(c).getByRole('searchbox');
const clearAll = (c: HTMLElement) => within(c).queryByRole('button', { name: 'Clear all filters' });

// ---- States ----

export const NoFilters: Story = {
  render: (args) => <Bar {...args} />,
  play: async ({ canvasElement }) => {
    await expect(search(canvasElement)).toHaveValue('');
    await expect(within(canvasElement).getByRole('radio', { name: /^All/ })).toBeChecked();
    // Nothing is active, so there is nothing to clear.
    await expect(clearAll(canvasElement)).toBeNull();
  },
};
export const WithActiveFilters: Story = {
  render: (args) => <Bar {...args} defaultFilters={{ query: 'tabs', status: 'pending', tags: ['Firefox', 'dark mode'] }} />,
  play: async ({ canvasElement }) => {
    await expect(search(canvasElement)).toHaveValue('tabs');
    await expect(within(canvasElement).getByRole('radio', { name: /Needs review/ })).toBeChecked();
    await expect(within(canvasElement).getAllByRole('listitem')).toHaveLength(2);
    await expect(clearAll(canvasElement)).toBeInTheDocument();
  },
};
export const OnlySearch: Story = {
  render: (args) => (
    <FilterBar {...args}>
      <FilterBar.Search />
    </FilterBar>
  ),
  play: async ({ canvasElement }) => {
    await expect(search(canvasElement)).toBeVisible();
    await expect(within(canvasElement).queryByRole('radiogroup')).toBeNull();
  },
};
export const ManyTags: Story = {
  render: (args) => <Bar {...args} defaultFilters={{ tags: ['Chrome', 'Firefox', 'Safari', 'Edge', 'dark mode', 'mobile', 'tablet'] }} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole('listitem')).toHaveLength(7);
  },
};

// ---- Actions ----

export const TypedAQuery: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => <Bar {...args} />,
  play: async ({ canvasElement, args, step }) => {
    clear(args.onChange);
    await step('typing updates the query and reports the whole state', async () => {
      await userEvent.type(search(canvasElement), 'tabs');
      await expect(args.onChange).toHaveBeenLastCalledWith({ query: 'tabs', status: 'all', tags: [] });
    });
    await step('Clear all filters appears', async () => {
      await expect(clearAll(canvasElement)).toBeInTheDocument();
    });
  },
};

export const ChoseAStatus: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => <Bar {...args} />,
  play: async ({ canvasElement, args }) => {
    clear(args.onChange);
    await userEvent.click(within(canvasElement).getByText('Needs review'));
    await expect(args.onChange).toHaveBeenLastCalledWith({ query: '', status: 'pending', tags: [] });
    await expect(clearAll(canvasElement)).toBeInTheDocument();
  },
};

export const FiltersCombine: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => <Bar {...args} defaultFilters={{ tags: ['Firefox'] }} />,
  play: async ({ canvasElement, args }) => {
    clear(args.onChange);
    await userEvent.type(search(canvasElement), 'a');
    await userEvent.click(within(canvasElement).getByText('Denied'));
    // Each change carries the others along, so the parent never has to merge.
    await expect(args.onChange).toHaveBeenLastCalledWith({ query: 'a', status: 'denied', tags: ['Firefox'] });
  },
};

export const RemovedATag: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => <Bar {...args} defaultFilters={{ tags: ['Firefox', 'Safari'] }} />,
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    clear(args.onChange);
    await step('removing Firefox keeps Safari', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Remove filter Firefox' }));
      await expect(args.onChange).toHaveBeenLastCalledWith({ query: '', status: 'all', tags: ['Safari'] });
      await expect(canvas.queryByText('Firefox')).toBeNull();
    });
    await step('removing the last tag hides the list', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Remove filter Safari' }));
      await expect(canvas.queryByRole('list', { name: 'Active filters' })).toBeNull();
    });
  },
};

export const ClearedEverything: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => <Bar {...args} defaultFilters={{ query: 'tabs', status: 'pending', tags: ['Firefox'] }} />,
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    clear(args.onChange);
    await step('Clear all filters resets the state and reports it', async () => {
      await userEvent.click(clearAll(canvasElement) as HTMLElement);
      await expect(args.onChange).toHaveBeenLastCalledWith({ query: '', status: 'all', tags: [] });
    });
    await step('the search box is empty, All is selected and the tags are gone', async () => {
      await expect(search(canvasElement)).toHaveValue('');
      await expect(canvas.getByRole('radio', { name: /^All/ })).toBeChecked();
      await expect(canvas.queryByText('Firefox')).toBeNull();
    });
    await step('there is nothing left to clear', async () => {
      await expect(clearAll(canvasElement)).toBeNull();
    });
  },
};

export const FilterAgainAfterClearing: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => <Bar {...args} defaultFilters={{ query: 'tabs' }} />,
  play: async ({ canvasElement, args }) => {
    clear(args.onChange);
    await userEvent.click(clearAll(canvasElement) as HTMLElement);
    await userEvent.type(search(canvasElement), 'modal');
    await expect(args.onChange).toHaveBeenLastCalledWith({ query: 'modal', status: 'all', tags: [] });
  },
};

// ---- Keyboard and accessibility ----

export const RemovedATagWithKeyboard: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => <Bar {...args} defaultFilters={{ tags: ['Firefox'] }} />,
  play: async ({ canvasElement, args }) => {
    clear(args.onChange);
    within(canvasElement).getByRole('button', { name: 'Remove filter Firefox' }).focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith({ query: '', status: 'all', tags: [] });
  },
};

export const ClearedWithKeyboard: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => <Bar {...args} defaultFilters={{ query: 'tabs' }} />,
  play: async ({ canvasElement, args }) => {
    clear(args.onChange);
    (clearAll(canvasElement) as HTMLElement).focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith({ query: '', status: 'all', tags: [] });
  },
};

export const IsASearchLandmark: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => <Bar {...args} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('search', { name: 'Filter builds' })).toBeInTheDocument();
  },
};

export const ActiveTagsAreANamedList: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => <Bar {...args} defaultFilters={{ tags: ['Firefox', 'Safari'] }} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('list', { name: 'Active filters' })).toBeInTheDocument();
  },
};

export const StatesMatrix: Story = {
  parameters: { chromatic: { modes: MATRIX_RTL_MODES } },
  render: (args) => (
    <StateGrid min={520}>
      <State label="no filters"><Bar {...args} /></State>
      <State label="active filters"><Bar {...args} defaultFilters={{ query: 'tabs', status: 'pending', tags: ['Firefox', 'dark mode'] }} /></State>
      <State label="many tags"><Bar {...args} defaultFilters={{ tags: ['Chrome', 'Firefox', 'Safari', 'Edge', 'dark mode', 'mobile', 'tablet'] }} /></State>
      <State label="only search">
        <FilterBar {...args}>
          <FilterBar.Search />
        </FilterBar>
      </State>
    </StateGrid>
  ),
  play: async ({ canvasElement }) => {
    // One caption per state: if a state disappears from the matrix, this fails.
    await expect(canvasElement.querySelectorAll('[data-state]')).toHaveLength(4);
  },
};

/** Right to left: the story itself is RTL, so searching and removing a tag are tested, not only photographed. */
export const Rtl: Story = {
  render: (args) => (
    <RtlFrame>
      <Bar {...args} defaultFilters={{ tags: ['Firefox'] }} />
    </RtlFrame>
  ),
  play: async ({ canvasElement, args, step }) => {
    clear(args.onChange);
    await step('the search landmark lays out right to left', async () => {
      await expect(directionOf(within(canvasElement).getByRole('search'))).toBe('rtl');
    });
    await step('typing still reports the whole state', async () => {
      await userEvent.type(search(canvasElement), 'tabs');
      await expect(args.onChange).toHaveBeenLastCalledWith({ query: 'tabs', status: 'all', tags: ['Firefox'] });
    });
    await step('removing a tag still works', async () => {
      await userEvent.click(within(canvasElement).getByRole('button', { name: 'Remove filter Firefox' }));
      await expect(args.onChange).toHaveBeenLastCalledWith({ query: 'tabs', status: 'all', tags: [] });
    });
  },
};
