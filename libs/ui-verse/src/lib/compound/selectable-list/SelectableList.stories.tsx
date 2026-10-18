import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { SelectableList } from './SelectableList';
import { parts } from '../../utils/storybook/parts';
import { events } from '../../utils/storybook/events';
import { spy, clear } from '../../utils/storybook/spy';
import { StateGrid, State } from '../../utils/storybook/StateGrid';
import { RtlFrame } from '../../utils/storybook/RtlFrame';
import { BEHAVIOUR_ONLY, MATRIX_MODES, MATRIX_RTL_MODES } from '../../utils/storybook/chromatic';

const ITEMS = [
  { id: 'tabs', label: 'BuildTabs / Default', description: '3 changes in Firefox' },
  { id: 'modal', label: 'AcceptChangesModal / Open', description: '1 change in Safari' },
  { id: 'table', label: 'BuildsTable / Loading', description: '14 changes across all browsers' },
  { id: 'form', label: 'SignInForm / Empty', description: 'No changes' },
];
const IDS = ITEMS.map((i) => i.id);

const meta: Meta<typeof SelectableList> = {
  title: 'Compound/SelectableList',
  component: SelectableList,
  subcomponents: parts({ SelectAll: SelectableList.SelectAll, Summary: SelectableList.Summary, Item: SelectableList.Item }),
  tags: ['autodocs'],
  argTypes: events({ onSelectionChange: 'Called with the selected ids, in list order, after every change. Locked items are included when they are selected.' }),
  args: { ids: IDS, label: 'Changed stories', onSelectionChange: spy('onSelectionChange') },
  decorators: [(Story) => <div style={{ maxWidth: 460 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof SelectableList>;

const List = (args: Omit<React.ComponentProps<typeof SelectableList>, 'children'>) => (
  <SelectableList {...args}>
    <SelectableList.SelectAll />
    <SelectableList.Summary />
    {ITEMS.map((i) => (
      <SelectableList.Item key={i.id} {...i} />
    ))}
  </SelectableList>
);

const box = (c: HTMLElement, name: string | RegExp) => within(c).getByRole('checkbox', { name }) as HTMLInputElement;

// ---- States ----

export const NoneSelected: Story = {
  render: (args) => <List {...args} />,
  play: async ({ canvasElement }) => {
    await expect(box(canvasElement, 'Select all')).not.toBeChecked();
    await expect(within(canvasElement).getByText('0 of 4 selected')).toBeVisible();
  },
};
export const SomeSelected: Story = {
  render: (args) => <List {...args} defaultSelected={['tabs', 'table']} />,
  play: async ({ canvasElement }) => {
    // The header checkbox shows the in-between state, through the native property.
    await expect(box(canvasElement, 'Select all')).toBePartiallyChecked();
    await expect(within(canvasElement).getByText('2 of 4 selected')).toBeVisible();
  },
};
export const AllSelected: Story = {
  render: (args) => <List {...args} defaultSelected={IDS} />,
  play: async ({ canvasElement }) => {
    await expect(box(canvasElement, 'Select all')).toBeChecked();
    await expect(box(canvasElement, 'Select all')).not.toBePartiallyChecked();
  },
};
export const WithLockedItem: Story = {
  render: (args) => <List {...args} disabledIds={['form']} defaultSelected={['form']} />,
  play: async ({ canvasElement }) => {
    await expect(box(canvasElement, /SignInForm/)).toBeDisabled();
    await expect(box(canvasElement, /SignInForm/)).toBeChecked();
  },
};
export const EveryItemLocked: Story = {
  render: (args) => <List {...args} disabledIds={IDS} />,
  play: async ({ canvasElement }) => {
    // With nothing to choose, Select all has nothing to do either.
    await expect(box(canvasElement, 'Select all')).toBeDisabled();
  },
};

// ---- Actions ----

export const SelectedAll: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => <List {...args} />,
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    clear(args.onSelectionChange);
    await step('Select all selects every item and reports every id', async () => {
      await userEvent.click(box(canvasElement, 'Select all'));
      await expect(args.onSelectionChange).toHaveBeenLastCalledWith(IDS);
      await expect(canvas.getByText('4 of 4 selected')).toBeInTheDocument();
    });
    await step('clicking it again clears the selection', async () => {
      await userEvent.click(box(canvasElement, 'Select all'));
      await expect(args.onSelectionChange).toHaveBeenLastCalledWith([]);
      await expect(canvas.getByText('0 of 4 selected')).toBeInTheDocument();
    });
  },
};

export const SelectedOneByOne: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => <List {...args} />,
  play: async ({ canvasElement, args, step }) => {
    clear(args.onSelectionChange);
    await step('picking two items reports them in list order, not click order', async () => {
      await userEvent.click(box(canvasElement, /BuildsTable/));
      await userEvent.click(box(canvasElement, /BuildTabs/));
      await expect(args.onSelectionChange).toHaveBeenLastCalledWith(['tabs', 'table']);
    });
    await step('Select all is now in between', async () => {
      await expect(box(canvasElement, 'Select all')).toBePartiallyChecked();
    });
    await step('unticking one updates the list', async () => {
      await userEvent.click(box(canvasElement, /BuildTabs/));
      await expect(args.onSelectionChange).toHaveBeenLastCalledWith(['table']);
    });
  },
};

export const SelectingTheRestCompletesTheSet: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => <List {...args} defaultSelected={['tabs']} />,
  play: async ({ canvasElement, args }) => {
    clear(args.onSelectionChange);
    await userEvent.click(box(canvasElement, 'Select all'));
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(IDS);
    await expect(box(canvasElement, 'Select all')).toBeChecked();
  },
};

export const LockedItemIsSkipped: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => <List {...args} disabledIds={['form']} />,
  play: async ({ canvasElement, args, step }) => {
    clear(args.onSelectionChange);
    await step('the locked item cannot be clicked', async () => {
      await expect(box(canvasElement, /SignInForm/)).toBeDisabled();
      await userEvent.click(box(canvasElement, /SignInForm/));
      await expect(args.onSelectionChange).not.toHaveBeenCalled();
    });
    await step('Select all leaves it out and still counts as complete', async () => {
      await userEvent.click(box(canvasElement, 'Select all'));
      await expect(args.onSelectionChange).toHaveBeenLastCalledWith(['tabs', 'modal', 'table']);
      await expect(box(canvasElement, 'Select all')).toBeChecked();
    });
  },
};

export const LockedItemSurvivesClearingAll: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => <List {...args} disabledIds={['form']} defaultSelected={IDS} />,
  play: async ({ canvasElement, args }) => {
    clear(args.onSelectionChange);
    await userEvent.click(box(canvasElement, 'Select all'));
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(['form']);
  },
};

// ---- Keyboard and accessibility ----

export const SelectedWithKeyboard: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => <List {...args} />,
  play: async ({ canvasElement, args, step }) => {
    clear(args.onSelectionChange);
    await step('Tab lands on Select all, then the first item', async () => {
      await userEvent.tab();
      await expect(box(canvasElement, 'Select all')).toHaveFocus();
      await userEvent.tab();
      await expect(box(canvasElement, /BuildTabs/)).toHaveFocus();
    });
    await step('Space selects the focused item', async () => {
      await userEvent.keyboard(' ');
      await expect(args.onSelectionChange).toHaveBeenLastCalledWith(['tabs']);
    });
  },
};

export const SelectAllWithKeyboard: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => <List {...args} />,
  play: async ({ canvasElement, args }) => {
    clear(args.onSelectionChange);
    await userEvent.tab();
    await userEvent.keyboard(' ');
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(IDS);
  },
};

export const LockedItemIsSkippedByTab: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => <List {...args} disabledIds={['modal']} />,
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    // Select all, BuildTabs, then straight past the locked AcceptChangesModal to BuildsTable.
    await expect(box(canvasElement, /BuildsTable/)).toHaveFocus();
  },
};

export const GroupIsNamed: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => <List {...args} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('group', { name: 'Changed stories' })).toBeInTheDocument();
  },
};

export const SummaryIsAnnouncedPolitely: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => <List {...args} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('0 of 4 selected')).toHaveAttribute('aria-live', 'polite');
  },
};

export const EveryCheckboxHasAName: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: (args) => <List {...args} />,
  play: async ({ canvasElement }) => {
    for (const cb of within(canvasElement).getAllByRole('checkbox')) {
      await expect(cb).toHaveAccessibleName();
    }
  },
};

export const StatesMatrix: Story = {
  parameters: { chromatic: { modes: MATRIX_RTL_MODES } },
  render: (args) => (
    <StateGrid min={360}>
      <State label="none selected"><List {...args} /></State>
      <State label="some selected"><List {...args} defaultSelected={['tabs', 'table']} /></State>
      <State label="all selected"><List {...args} defaultSelected={IDS} /></State>
      <State label="locked item"><List {...args} disabledIds={['form']} defaultSelected={['form']} /></State>
      <State label="every item locked"><List {...args} disabledIds={IDS} /></State>
    </StateGrid>
  ),
  play: async ({ canvasElement }) => {
    // One caption per state: if a state disappears from the matrix, this fails.
    await expect(canvasElement.querySelectorAll('[data-state]')).toHaveLength(5);
  },
};
