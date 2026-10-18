import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, waitFor } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { EditableTitle } from './EditableTitle';
import { events } from '../../utils/storybook/events';
import { spy, clear } from '../../utils/storybook/spy';
import { StateGrid, State } from '../../utils/storybook/StateGrid';
import { RtlFrame } from '../../utils/storybook/RtlFrame';
import { BEHAVIOUR_ONLY, MATRIX_MODES, MATRIX_RTL_MODES } from '../../utils/storybook/chromatic';

const meta: Meta<typeof EditableTitle> = {
  title: 'Molecules/EditableTitle',
  component: EditableTitle,
  tags: ['autodocs'],
  argTypes: events({ onSave: 'Called with the trimmed new title when it is saved. Not called on cancel, and not when the title is empty.' }),
  args: { value: 'Tabs keyboard navigation', onSave: spy('onSave') },
};
export default meta;
type Story = StoryObj<typeof EditableTitle>;

const input = (c: HTMLElement) => within(c).getByRole('textbox', { name: 'Build title' });
const editButton = (c: HTMLElement) => within(c).getByRole('button', { name: 'Edit title' });
const heading = (c: HTMLElement, name: string) => within(c).findByRole('heading', { level: 3, name });

// ---- States ----

export const Viewing: Story = {
  play: async ({ canvasElement }) => {
    await expect(await heading(canvasElement, 'Tabs keyboard navigation')).toBeInTheDocument();
    await expect(within(canvasElement).queryByRole('textbox')).toBeNull();
  },
};
export const Editing: Story = {
  args: { startEditing: true },
  play: async ({ canvasElement }) => {
    await expect(input(canvasElement)).toHaveFocus();
    await expect(input(canvasElement)).toHaveValue('Tabs keyboard navigation');
  },
};
export const LongTitle: Story = {
  args: { value: 'Redesign the checkout flow with saved payment methods and one-tap reorder for returning customers' },
  play: async ({ canvasElement }) => {
    await expect(editButton(canvasElement)).toBeVisible();
  },
};

// ---- Actions: saving ----

export const EditedAndSaved: Story = {
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    clear(args.onSave);
    await step('Edit opens a field holding the current title', async () => {
      await userEvent.click(editButton(canvasElement));
      await expect(input(canvasElement)).toHaveValue('Tabs keyboard navigation');
    });
    await step('type a new title and press Enter', async () => {
      await userEvent.clear(input(canvasElement));
      await userEvent.type(input(canvasElement), '  Tabs arrow keys  {enter}');
    });
    await step('it saves the trimmed title once and shows it', async () => {
      await expect(args.onSave).toHaveBeenCalledTimes(1);
      await expect(args.onSave).toHaveBeenCalledWith('Tabs arrow keys');
      await expect(await canvas.findByRole('heading', { name: 'Tabs arrow keys' })).toBeInTheDocument();
    });
    await step('focus returns to the Edit button', async () => {
      await waitFor(() => expect(editButton(canvasElement)).toHaveFocus());
    });
  },
};

export const SavedWithTheButton: Story = {
  parameters: BEHAVIOUR_ONLY,
  args: { startEditing: true },
  play: async ({ canvasElement, args }) => {
    clear(args.onSave);
    await userEvent.clear(input(canvasElement));
    await userEvent.type(input(canvasElement), 'Saved by button');
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Save' }));
    await expect(args.onSave).toHaveBeenCalledWith('Saved by button');
  },
};

export const SavedTitleIsKeptForTheNextEdit: Story = {
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement }) => {
    await userEvent.click(editButton(canvasElement));
    await userEvent.clear(input(canvasElement));
    await userEvent.type(input(canvasElement), 'First{enter}');
    await waitFor(() => expect(editButton(canvasElement)).toBeInTheDocument());
    await userEvent.click(editButton(canvasElement));
    await expect(input(canvasElement)).toHaveValue('First');
  },
};

// ---- Actions: cancelling ----

export const CancelledWithEscape: Story = {
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement, args, step }) => {
    clear(args.onSave);
    await userEvent.click(editButton(canvasElement));
    await userEvent.type(input(canvasElement), ' extra');
    await step('Escape closes the field and keeps the old title', async () => {
      await userEvent.keyboard('{Escape}');
      await expect(await heading(canvasElement, 'Tabs keyboard navigation')).toBeInTheDocument();
    });
    await step('nothing was saved', async () => {
      await expect(args.onSave).not.toHaveBeenCalled();
    });
    await step('focus returns to the Edit button', async () => {
      await waitFor(() => expect(editButton(canvasElement)).toHaveFocus());
    });
  },
};

export const CancelledWithButton: Story = {
  parameters: BEHAVIOUR_ONLY,
  args: { startEditing: true },
  play: async ({ canvasElement, args }) => {
    clear(args.onSave);
    await userEvent.type(input(canvasElement), ' extra');
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Cancel' }));
    await expect(await heading(canvasElement, 'Tabs keyboard navigation')).toBeInTheDocument();
    await expect(args.onSave).not.toHaveBeenCalled();
  },
};

export const NextEditStartsFromTheSavedTitle: Story = {
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement }) => {
    await userEvent.click(editButton(canvasElement));
    await userEvent.type(input(canvasElement), ' abandoned draft');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(editButton(canvasElement)).toBeInTheDocument());
    await userEvent.click(editButton(canvasElement));
    await expect(input(canvasElement)).toHaveValue('Tabs keyboard navigation');
  },
};

// ---- Validation ----

export const EmptyTitleIsRejected: Story = {
  args: { startEditing: true },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    clear(args.onSave);
    await step('clearing the field and saving shows an error', async () => {
      await userEvent.clear(input(canvasElement));
      await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
      await expect(await canvas.findByText("Title can't be empty.")).toBeInTheDocument();
    });
    await step('nothing was saved and the field is flagged', async () => {
      await expect(args.onSave).not.toHaveBeenCalled();
      await expect(input(canvasElement)).toHaveAttribute('aria-invalid', 'true');
    });
  },
};

export const WhitespaceOnlyIsRejected: Story = {
  parameters: BEHAVIOUR_ONLY,
  args: { startEditing: true },
  play: async ({ canvasElement, args }) => {
    clear(args.onSave);
    await userEvent.clear(input(canvasElement));
    await userEvent.type(input(canvasElement), '    ');
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Save' }));
    await expect(await within(canvasElement).findByText("Title can't be empty.")).toBeInTheDocument();
    await expect(args.onSave).not.toHaveBeenCalled();
  },
};

export const ErrorClearsWhenTypingAgain: Story = {
  parameters: BEHAVIOUR_ONLY,
  args: { startEditing: true },
  play: async ({ canvasElement }) => {
    await userEvent.clear(input(canvasElement));
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Save' }));
    await within(canvasElement).findByText("Title can't be empty.");
    await userEvent.type(input(canvasElement), 'a');
    await expect(within(canvasElement).queryByText("Title can't be empty.")).toBeNull();
  },
};

// ---- Keyboard and accessibility ----

export const EditButtonIsReachableByKeyboard: Story = {
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(editButton(canvasElement)).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(input(canvasElement)).toHaveFocus();
  },
};

export const FieldIsNamed: Story = {
  parameters: BEHAVIOUR_ONLY,
  args: { startEditing: true },
  play: async ({ canvasElement }) => {
    await expect(input(canvasElement)).toHaveAccessibleName('Build title');
  },
};

export const StatesMatrix: Story = {
  parameters: { chromatic: { modes: MATRIX_RTL_MODES } },
  render: (args) => (
    <StateGrid min={360}>
      <State label="viewing"><EditableTitle {...args} /></State>
      <State label="editing"><EditableTitle {...args} startEditing /></State>
      <State label="long title"><EditableTitle {...args} value="Redesign the checkout flow with saved payment methods and one-tap reorder for returning customers" /></State>
    </StateGrid>
  ),
  play: async ({ canvasElement }) => {
    // One caption per state: if a state disappears from the matrix, this fails.
    await expect(canvasElement.querySelectorAll('[data-state]')).toHaveLength(3);
  },
};

/** Right to left: the story itself is RTL, so the edit and save flow is tested, not only photographed. */
export const Rtl: Story = {
  render: (args) => (
    <RtlFrame>
      <EditableTitle {...args} />
    </RtlFrame>
  ),
  play: async ({ canvasElement, args, step }) => {
    clear(args.onSave);
    await step('Edit opens the field, laid out right to left', async () => {
      await userEvent.click(editButton(canvasElement));
      await expect(getComputedStyle(input(canvasElement)).direction).toBe('rtl');
    });
    await step('saving still reports the trimmed title', async () => {
      await userEvent.clear(input(canvasElement));
      await userEvent.type(input(canvasElement), 'العنوان الجديد{enter}');
      await expect(args.onSave).toHaveBeenCalledWith('العنوان الجديد');
    });
  },
};
