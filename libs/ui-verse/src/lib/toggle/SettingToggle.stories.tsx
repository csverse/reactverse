import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { SettingToggle } from './SettingToggle';
import { events } from '../utils/storybook/events';
import { figma, RESPONSIVE_MODES } from '../utils/storybook/chromatic';
import { spy, clear } from '../utils/storybook/spy';

const meta: Meta<typeof SettingToggle> = {
  title: 'Review Desk/SettingToggle',
  component: SettingToggle,
  tags: ['autodocs'],
  argTypes: events({
      onChange: 'Called with the new checked state each time the control is toggled.',
  }),
  args: {
    label: 'Only snapshot changed stories',
    description: 'TurboSnap compares your git diff to the import graph.',
    // Logged in the Actions panel and asserted on in the play functions below.
    onChange: spy('onChange'),
  },
  parameters: figma('4:2'),
};
export default meta;
type Story = StoryObj<typeof SettingToggle>;

export const CheckboxOff: Story = {};
export const CheckboxOn: Story = { args: { defaultChecked: true } };
export const SwitchOff: Story = { args: { kind: 'switch' } };
export const SwitchOn: Story = { args: { kind: 'switch', defaultChecked: true } };
export const Disabled: Story = {
  args: { disabled: true, defaultChecked: true },
};
export const WithError: Story = {
  args: { error: 'Enable TurboSnap before setting a baseline branch.' },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText('Enable TurboSnap before setting a baseline branch.')
    ).toBeVisible();
  },
};
export const LongLabel: Story = {
  args: {
    label:
      'Automatically accept changes on the default branch when a pull request has been merged and reviewed',
  },
  parameters: { chromatic: { modes: RESPONSIVE_MODES } },
};

export const CheckedByClick: Story = {
  play: async ({ canvasElement, args, step }) => {
    const box = within(canvasElement).getByRole('checkbox');
    clear(args.onChange);
    await step('click checks the box and reports true', async () => {
      await userEvent.click(box);
      await expect(box).toBeChecked();
      await expect(args.onChange).toHaveBeenLastCalledWith(true);
    });
    await step('clicking the label text unchecks it and reports false', async () => {
      await userEvent.click(within(canvasElement).getByText('Only snapshot changed stories'));
      await expect(box).not.toBeChecked();
      await expect(args.onChange).toHaveBeenLastCalledWith(false);
    });
  },
};

export const SwitchedByKeyboard: Story = {
  args: { kind: 'switch' },
  play: async ({ canvasElement, args, step }) => {
    const control = within(canvasElement).getByRole('switch');
    clear(args.onChange);
    await step('Tab moves focus onto the switch', async () => {
      await userEvent.tab();
      await expect(control).toHaveFocus();
    });
    await step('Space turns it on', async () => {
      await userEvent.keyboard(' ');
      await expect(control).toBeChecked();
      await expect(args.onChange).toHaveBeenLastCalledWith(true);
    });
    await step('Space again turns it off', async () => {
      await userEvent.keyboard(' ');
      await expect(control).not.toBeChecked();
      await expect(args.onChange).toHaveBeenLastCalledWith(false);
    });
  },
};

export const DisabledIgnoresInput: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args, step }) => {
    const box = within(canvasElement).getByRole('checkbox');
    clear(args.onChange);
    await step('it is exposed as disabled', async () => {
      await expect(box).toBeDisabled();
    });
    await step('clicking does nothing and fires nothing', async () => {
      await userEvent.click(box);
      await expect(box).not.toBeChecked();
      await expect(args.onChange).not.toHaveBeenCalled();
    });
    await step('Tab skips it', async () => {
      await userEvent.tab();
      await expect(box).not.toHaveFocus();
    });
  },
};

/** The focus ring is captured through `play`, not CSS pseudo-states. */
export const FocusedCheckbox: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole('checkbox')).toHaveFocus();
  },
};

export const LabelAndDescriptionAreLinked: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // getByLabelText only succeeds when label and input are properly associated.
    await expect(canvas.getByLabelText('Only snapshot changed stories')).toBe(
      canvas.getByRole('checkbox')
    );
  },
};

/**
 * Intentional accessibility failure: a raw checkbox with no label.
 * The Accessibility panel and Chromatic's accessibility tests both report it.
 * The CI test-runner skips it so the build stays green.
 */
export const A11yViolationDemo: Story = {
  render: () => <input type="checkbox" />,
  parameters: { a11yTestRunner: { skip: true } },
};
