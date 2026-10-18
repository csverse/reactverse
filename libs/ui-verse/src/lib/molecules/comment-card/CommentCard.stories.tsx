import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { CommentCard } from './CommentCard';
import { events } from '../../utils/storybook/events';
import { spy, clear } from '../../utils/storybook/spy';
import { StateGrid, State } from '../../utils/storybook/StateGrid';
import { RtlFrame } from '../../utils/storybook/RtlFrame';
import { BEHAVIOUR_ONLY, MATRIX_MODES, MATRIX_RTL_MODES } from '../../utils/storybook/chromatic';

const BODY = 'The focus ring on the second tab is clipped in Firefox. Can we add 2px of outline offset?';

const meta: Meta<typeof CommentCard> = {
  title: 'Molecules/CommentCard',
  component: CommentCard,
  tags: ['autodocs'],
  argTypes: events({ onResolve: 'Called with true when resolved and false when reopened. Passing it shows the Resolve / Reopen button.' }),
  args: {
    author: { name: 'Priya Raman' },
    body: BODY,
    createdAt: '2026-10-18T09:10:00Z',
    now: '2026-10-18T12:00:00Z',
  },
  decorators: [(Story) => <div style={{ maxWidth: 520 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof CommentCard>;

const article = (c: HTMLElement, name = 'Comment by Priya Raman') => within(c).getByRole('article', { name });

// ---- States ----

export const ReadOnly: Story = {
  play: async ({ canvasElement }) => {
    await expect(article(canvasElement)).toBeInTheDocument();
    await expect(within(canvasElement).getByText(BODY)).toBeVisible();
    await expect(within(canvasElement).getByText('2 hours ago')).toBeVisible();
    await expect(within(canvasElement).queryByRole('button')).toBeNull();
  },
};
export const Open: Story = {
  args: { onResolve: spy('onResolve') },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Resolve' })).toBeVisible();
    await expect(within(canvasElement).queryByText('Resolved')).toBeNull();
  },
};
export const Resolved: Story = {
  args: { resolved: true, onResolve: spy('onResolve') },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Resolved')).toBeVisible();
    await expect(within(canvasElement).getByRole('button', { name: 'Reopen' })).toBeVisible();
  },
};
export const LongBody: Story = {
  args: { body: 'This needs a closer look at every viewport. '.repeat(12), onResolve: spy('onResolve') },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Resolve' })).toBeVisible();
  },
};
export const LongName: Story = {
  args: { author: { name: 'Okonkwo Adeyemi-Featherstonehaugh' }, onResolve: spy('onResolve') },
  play: async ({ canvasElement }) => {
    await expect(article(canvasElement, 'Comment by Okonkwo Adeyemi-Featherstonehaugh')).toBeInTheDocument();
  },
};
export const MarkupIsShownAsText: Story = {
  parameters: BEHAVIOUR_ONLY,
  args: { body: '<b>not bold</b> and <script>alert(1)</script>' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('<b>not bold</b> and <script>alert(1)</script>')).toBeVisible();
    await expect(canvasElement.querySelector('b, script')).toBeNull();
  },
};

// ---- Actions ----

export const ResolvedByClick: Story = {
  parameters: BEHAVIOUR_ONLY,
  args: { onResolve: spy('onResolve') },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    clear(args.onResolve);
    await step('Resolve marks it resolved and reports true once', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Resolve' }));
      await expect(canvas.getByText('Resolved')).toBeInTheDocument();
      await expect(args.onResolve).toHaveBeenCalledTimes(1);
      await expect(args.onResolve).toHaveBeenLastCalledWith(true);
    });
    await step('the button becomes Reopen', async () => {
      await expect(canvas.getByRole('button', { name: 'Reopen' })).toBeInTheDocument();
    });
  },
};

export const ReopenedByClick: Story = {
  parameters: BEHAVIOUR_ONLY,
  args: { resolved: true, onResolve: spy('onResolve') },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    clear(args.onResolve);
    await userEvent.click(canvas.getByRole('button', { name: 'Reopen' }));
    await expect(canvas.queryByText('Resolved')).toBeNull();
    await expect(args.onResolve).toHaveBeenLastCalledWith(false);
  },
};

export const ResolvedThenReopened: Story = {
  parameters: BEHAVIOUR_ONLY,
  args: { onResolve: spy('onResolve') },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    clear(args.onResolve);
    await userEvent.click(canvas.getByRole('button', { name: 'Resolve' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Reopen' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Resolve' }));
    // Each press is one report, in order: true, false, true.
    await expect((args.onResolve as jest.Mock).mock.calls.map((c) => c[0])).toEqual([true, false, true]);
  },
};

// ---- Keyboard and accessibility ----

export const ResolvedWithKeyboard: Story = {
  parameters: BEHAVIOUR_ONLY,
  args: { onResolve: spy('onResolve') },
  play: async ({ canvasElement, args, step }) => {
    clear(args.onResolve);
    await step('Tab reaches the button', async () => {
      await userEvent.tab();
      await expect(within(canvasElement).getByRole('button', { name: 'Resolve' })).toHaveFocus();
    });
    await step('Enter resolves it', async () => {
      await userEvent.keyboard('{Enter}');
      await expect(args.onResolve).toHaveBeenLastCalledWith(true);
    });
  },
};

export const FocusStaysOnTheButtonAfterToggling: Story = {
  parameters: BEHAVIOUR_ONLY,
  args: { onResolve: spy('onResolve') },
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    // The button is replaced by "Reopen" in place; focus must not fall back to the page.
    await expect(within(canvasElement).getByRole('button', { name: 'Reopen' })).toHaveFocus();
  },
};

export const CardIsNamedAfterItsAuthor: Story = {
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement }) => {
    await expect(article(canvasElement)).toHaveAccessibleName('Comment by Priya Raman');
  },
};

export const TimeIsMachineReadable: Story = {
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('time')).toHaveAttribute('datetime', '2026-10-18T09:10:00.000Z');
  },
};

export const StatesMatrix: Story = {
  parameters: { chromatic: { modes: MATRIX_RTL_MODES } },
  render: (args) => (
    <StateGrid min={340}>
      <State label="read-only"><CommentCard {...args} /></State>
      <State label="open"><CommentCard {...args} onResolve={() => undefined} /></State>
      <State label="resolved"><CommentCard {...args} resolved onResolve={() => undefined} /></State>
      <State label="long body"><CommentCard {...args} body={'This needs a closer look at every viewport. '.repeat(8)} onResolve={() => undefined} /></State>
      <State label="long name"><CommentCard {...args} author={{ name: 'Okonkwo Adeyemi-Featherstonehaugh' }} onResolve={() => undefined} /></State>
    </StateGrid>
  ),
  play: async ({ canvasElement }) => {
    // One caption per state: if a state disappears from the matrix, this fails.
    await expect(canvasElement.querySelectorAll('[data-state]')).toHaveLength(5);
  },
};
