import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { SearchField } from './SearchField';
import { events } from '../../utils/storybook/events';
import { spy, clear } from '../../utils/storybook/spy';
import { StateGrid, State } from '../../utils/storybook/StateGrid';
import { RtlFrame } from '../../utils/storybook/RtlFrame';
import { BEHAVIOUR_ONLY, MATRIX_MODES, MATRIX_RTL_MODES } from '../../utils/storybook/chromatic';

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
  parameters: BEHAVIOUR_ONLY,
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
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement, args }) => {
    clear(args.onSubmit);
    box(canvasElement).focus();
    await userEvent.keyboard('{Enter}');
    // Submitting nothing is a real request: "show me everything again".
    await expect(args.onSubmit).toHaveBeenCalledWith('');
  },
};

export const TypingDoesNotSubmit: Story = {
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement, args }) => {
    clear(args.onSubmit);
    await userEvent.type(box(canvasElement), 'tabs');
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

export const SpacesAreKept: Story = {
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement, args }) => {
    clear(args.onChange);
    await userEvent.type(box(canvasElement), 'a b');
    await expect(args.onChange).toHaveBeenLastCalledWith('a b');
  },
};

// ---- Actions: clearing ----

export const ClearedWithButton: Story = {
  parameters: BEHAVIOUR_ONLY,
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
  parameters: BEHAVIOUR_ONLY,
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
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement, args }) => {
    clear(args.onChange);
    box(canvasElement).focus();
    await userEvent.keyboard('{Escape}');
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const ClearButtonOnlyWhenThereIsText: Story = {
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement }) => {
    await expect(clearButton(canvasElement)).toBeNull();
    await userEvent.type(box(canvasElement), 'a');
    await expect(clearButton(canvasElement)).toBeInTheDocument();
  },
};

// ---- Keyboard and accessibility ----

export const TabOrder: Story = {
  parameters: BEHAVIOUR_ONLY,
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
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement }) => {
    await expect(box(canvasElement)).toHaveAccessibleName('Search builds');
  },
};

export const StatesMatrix: Story = {
  parameters: { chromatic: { modes: MATRIX_RTL_MODES } },
  render: (args) => (
    <StateGrid min={300}>
      <State label="empty"><SearchField {...args} /></State>
      <State label="with text"><SearchField {...args} defaultValue="feature/tabs-keyboard-nav" /></State>
      <State label="long text"><SearchField {...args} defaultValue="feature/redesign-checkout-flow-with-saved-payment-methods" /></State>
      <State label="disabled"><SearchField {...args} defaultValue="main" disabled /></State>
      <State label="custom placeholder"><SearchField {...args} label="Search reviewers" placeholder="Name or email" /></State>
    </StateGrid>
  ),
  play: async ({ canvasElement }) => {
    // One caption per state: if a state disappears from the matrix, this fails.
    await expect(canvasElement.querySelectorAll('[data-state]')).toHaveLength(5);
  },
};

/** Right to left: the story itself is RTL, so keyboard and clearing are tested, not only photographed. */
export const Rtl: Story = {
  render: (args) => (
    <RtlFrame>
      <SearchField {...args} />
    </RtlFrame>
  ),
  play: async ({ canvasElement, args, step }) => {
    clear(args.onChange);
    await step('the field lays out right to left', async () => {
      await expect(getComputedStyle(box(canvasElement)).direction).toBe('rtl');
    });
    await step('typing still reports the text', async () => {
      await userEvent.type(box(canvasElement), 'tabs');
      await expect(args.onChange).toHaveBeenLastCalledWith('tabs');
    });
    await step('the clear button still empties the field and returns focus', async () => {
      await userEvent.click(clearButton(canvasElement) as HTMLElement);
      await expect(box(canvasElement)).toHaveValue('');
      await expect(box(canvasElement)).toHaveFocus();
    });
  },
};
