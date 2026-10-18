import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { SearchField } from './SearchField';
import { RESPONSIVE_MODES } from '../../utils/storybook/chromatic';
import { events } from '../../utils/storybook/events';
import { spy, clear } from '../../utils/storybook/spy';

const meta: Meta<typeof SearchField> = {
  title: 'Molecules/SearchField',
  component: SearchField,
  tags: ['autodocs'],
  argTypes: events({
    onChange: 'Called with the new text on every keystroke and when the field is cleared.',
    onSubmit: 'Called with the current text when Enter is pressed. The text stays in the field.',
  }),
  args: { onChange: spy('onChange'), onSubmit: spy('onSubmit') },
  decorators: [(Story) => <div style={{ maxWidth: 380 }}><Story /></div>],
  parameters: { chromatic: { modes: RESPONSIVE_MODES } },
};
export default meta;
type Story = StoryObj<typeof SearchField>;

const box = (c: HTMLElement, name = 'Search builds') => within(c).getByRole('searchbox', { name });
const clearButton = (c: HTMLElement) => within(c).queryByRole('button', { name: 'Clear search' });

// ---- States ----

export const Empty: Story = {
  play: async ({ canvasElement }) => {
    await expect(box(canvasElement)).toHaveValue('');
    await expect(clearButton(canvasElement)).toBeNull();
  },
};
export const WithText: Story = {
  args: { defaultValue: 'feature/tabs-keyboard-nav' },
  play: async ({ canvasElement }) => {
    await expect(box(canvasElement)).toHaveValue('feature/tabs-keyboard-nav');
    await expect(clearButton(canvasElement)).toBeInTheDocument();
  },
};
export const Disabled: Story = {
  args: { defaultValue: 'main', disabled: true },
  play: async ({ canvasElement, args }) => {
    clear(args.onChange);
    await expect(box(canvasElement)).toBeDisabled();
    await expect(clearButton(canvasElement)).toBeNull();
    await userEvent.type(box(canvasElement), 'x');
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const CustomLabel: Story = {
  args: { label: 'Search reviewers', placeholder: 'Name or email' },
  play: async ({ canvasElement }) => {
    await expect(box(canvasElement, 'Search reviewers')).toHaveAttribute('placeholder', 'Name or email');
  },
};

// ---- Actions: typing and submitting ----

export const TypedAndSubmitted: Story = {
  play: async ({ canvasElement, args, step }) => {
    clear(args.onChange, args.onSubmit);
    await step('typing reports each change', async () => {
      await userEvent.type(box(canvasElement), 'tabs');
      await expect(args.onChange).toHaveBeenLastCalledWith('tabs');
      await expect(args.onChange).toHaveBeenCalledTimes(4);
    });
    await step('Enter submits the whole text once', async () => {
      await userEvent.keyboard('{Enter}');
      await expect(args.onSubmit).toHaveBeenCalledTimes(1);
      await expect(args.onSubmit).toHaveBeenCalledWith('tabs');
    });
    await step('the text stays in the field', async () => {
      await expect(box(canvasElement)).toHaveValue('tabs');
    });
  },
};

export const SubmittingEmptyText: Story = {
  play: async ({ canvasElement, args }) => {
    clear(args.onSubmit);
    box(canvasElement).focus();
    await userEvent.keyboard('{Enter}');
    // Submitting nothing is a real request: "show me everything again".
    await expect(args.onSubmit).toHaveBeenCalledWith('');
  },
};

export const TypingDoesNotSubmit: Story = {
  play: async ({ canvasElement, args }) => {
    clear(args.onSubmit);
    await userEvent.type(box(canvasElement), 'tabs');
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

export const SpacesAreKept: Story = {
  play: async ({ canvasElement, args }) => {
    clear(args.onChange);
    await userEvent.type(box(canvasElement), 'a b');
    await expect(args.onChange).toHaveBeenLastCalledWith('a b');
  },
};

// ---- Actions: clearing ----

export const ClearedWithButton: Story = {
  args: { defaultValue: 'main' },
  play: async ({ canvasElement, args, step }) => {
    clear(args.onChange);
    await step('the clear button empties the field and reports it', async () => {
      await userEvent.click(clearButton(canvasElement) as HTMLElement);
      await expect(box(canvasElement)).toHaveValue('');
      await expect(args.onChange).toHaveBeenLastCalledWith('');
    });
    await step('focus goes back to the field so typing can continue', async () => {
      await expect(box(canvasElement)).toHaveFocus();
    });
    await step('the clear button disappears', async () => {
      await expect(clearButton(canvasElement)).toBeNull();
    });
  },
};

export const ClearedWithEscape: Story = {
  args: { defaultValue: 'main' },
  play: async ({ canvasElement, args }) => {
    clear(args.onChange);
    box(canvasElement).focus();
    await userEvent.keyboard('{Escape}');
    await expect(box(canvasElement)).toHaveValue('');
    await expect(args.onChange).toHaveBeenLastCalledWith('');
  },
};

export const EscapeOnEmptyDoesNothing: Story = {
  play: async ({ canvasElement, args }) => {
    clear(args.onChange);
    box(canvasElement).focus();
    await userEvent.keyboard('{Escape}');
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const ClearButtonOnlyWhenThereIsText: Story = {
  play: async ({ canvasElement }) => {
    await expect(clearButton(canvasElement)).toBeNull();
    await userEvent.type(box(canvasElement), 'a');
    await expect(clearButton(canvasElement)).toBeInTheDocument();
  },
};

// ---- Keyboard and accessibility ----

export const TabOrder: Story = {
  args: { defaultValue: 'main' },
  play: async ({ canvasElement, step }) => {
    await step('Tab goes to the field first', async () => {
      await userEvent.tab();
      await expect(box(canvasElement)).toHaveFocus();
    });
    await step('then to the clear button', async () => {
      await userEvent.tab();
      await expect(clearButton(canvasElement)).toHaveFocus();
    });
  },
};

export const IsNamedForScreenReaders: Story = {
  play: async ({ canvasElement }) => {
    await expect(box(canvasElement)).toHaveAccessibleName('Search builds');
  },
};
