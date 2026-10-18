import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { SignInForm } from './SignInForm';
import { events } from '../utils/storybook/events';
import { figma, RESPONSIVE_MODES } from '../utils/storybook/chromatic';
import { spy, clear } from '../utils/storybook/spy';

const meta: Meta<typeof SignInForm> = {
  title: 'Review Desk/SignInForm',
  component: SignInForm,
  tags: ['autodocs'],
  argTypes: events({
      onSubmit: 'Called with the email and password once, and only when validation passes.',
  }),
  args: { onSubmit: spy('onSubmit') },
  parameters: {
    ...figma('10:2'),
    chromatic: { modes: RESPONSIVE_MODES },
  },
};
export default meta;
type Story = StoryObj<typeof SignInForm>;

export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Work email')).toBeVisible();
    await expect(canvas.getByLabelText('Password')).toBeVisible();
  },
};
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Sign in' })).toBeDisabled();
  },
};
export const ServerError: Story = {
  args: { serverError: 'Those credentials do not match an account on this workspace.' },
  play: async ({ canvasElement }) => {
    // role=alert: announced as soon as it appears.
    await expect(await within(canvasElement).findByRole('alert')).toHaveTextContent(
      'Those credentials do not match'
    );
  },
};

export const ValidationErrors: Story = {
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    clear(args.onSubmit);
    await step('submitting empty shows an error for each field', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Sign in' }));
      await expect(await canvas.findByText('Enter your work email.')).toBeVisible();
      await expect(canvas.getByText('Enter your password.')).toBeVisible();
    });
    await step('invalid fields are flagged to assistive tech', async () => {
      await expect(canvas.getByLabelText('Work email')).toHaveAttribute('aria-invalid', 'true');
      await expect(canvas.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true');
    });
    await step('focus moves to the first invalid field', async () => {
      await expect(canvas.getByLabelText('Work email')).toHaveFocus();
    });
    await step('nothing was submitted', async () => {
      await expect(args.onSubmit).not.toHaveBeenCalled();
    });
  },
};

export const IncompleteEmail: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    clear(args.onSubmit);
    await userEvent.type(canvas.getByLabelText('Work email'), 'priya@');
    await userEvent.type(canvas.getByLabelText('Password'), 'short');
    await userEvent.click(canvas.getByRole('button', { name: 'Sign in' }));
    await expect(await canvas.findByText('That email address looks incomplete.')).toBeVisible();
    await expect(canvas.getByText('Passwords have at least 8 characters.')).toBeVisible();
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

export const OnlyPasswordInvalid: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    clear(args.onSubmit);
    await userEvent.type(canvas.getByLabelText('Work email'), 'priya@example.com');
    await userEvent.click(canvas.getByRole('button', { name: 'Sign in' }));
    await expect(await canvas.findByText('Enter your password.')).toBeVisible();
    // Focus skips the valid email field and lands on the password.
    await expect(canvas.getByLabelText('Password')).toHaveFocus();
  },
};

export const SubmitsValidInput: Story = {
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    clear(args.onSubmit);
    await step('fill both fields', async () => {
      await userEvent.type(canvas.getByLabelText('Work email'), 'priya@example.com');
      await userEvent.type(canvas.getByLabelText('Password'), 'correct-horse-battery');
    });
    await step('click Sign in: onSubmit gets the values exactly once', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Sign in' }));
      await expect(args.onSubmit).toHaveBeenCalledTimes(1);
      await expect(args.onSubmit).toHaveBeenCalledWith({
        email: 'priya@example.com',
        password: 'correct-horse-battery',
      });
    });
  },
};

export const SubmitWithEnterKey: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    clear(args.onSubmit);
    await userEvent.type(canvas.getByLabelText('Work email'), 'priya@example.com');
    await userEvent.type(canvas.getByLabelText('Password'), 'correct-horse-battery{enter}');
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
  },
};

export const PasswordCanBeRevealed: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByLabelText('Password');
    await expect(field).toHaveAttribute('type', 'password');
    await userEvent.type(field, 'correct-horse-battery');
    // Mantine's reveal control is a mouse-only button; it is not in the tab order.
    await userEvent.click(canvasElement.querySelector('button[type="button"]') as HTMLElement);
    await expect(field).toHaveAttribute('type', 'text');
  },
};
