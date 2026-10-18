import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { ReviewThread } from './ReviewThread';
import { parts } from '../../utils/storybook/parts';
import { events } from '../../utils/storybook/events';
import { spy, clear } from '../../utils/storybook/spy';
import { StateGrid, State } from '../../utils/storybook/StateGrid';
import { RtlFrame } from '../../utils/storybook/RtlFrame';
import { BEHAVIOUR_ONLY, MATRIX_MODES, MATRIX_RTL_MODES } from '../../utils/storybook/chromatic';

const NOW = '2026-10-18T12:00:00Z';

const SEED = [
  { author: { name: 'Priya Raman' }, body: 'The focus ring on the second tab is clipped in Firefox.', createdAt: '2026-10-18T09:10:00Z' },
  { author: { name: 'Tomás Herrera' }, body: 'Reproduced. It is the overflow on the list. I will add an offset.', createdAt: '2026-10-18T10:30:00Z' },
];
type Seed = typeof SEED;

/** Holds the comment list, which the compound deliberately leaves to the caller. */
const Demo = ({ seed = SEED, ...rest }: { seed?: Seed } & Omit<React.ComponentProps<typeof ReviewThread>, 'children'>) => {
  const [comments, setComments] = useState(seed);
  return (
    <ReviewThread
      {...rest}
      onReply={(text) => {
        setComments((c) => [...c, { author: { name: 'You' }, body: text, createdAt: NOW }]);
        rest.onReply?.(text);
      }}
    >
      <ReviewThread.Header count={comments.length} />
      {comments.map((c, i) => (
        <ReviewThread.Comment key={i} {...c} now={NOW} />
      ))}
      <ReviewThread.Reply />
    </ReviewThread>
  );
};

const meta: Meta<typeof ReviewThread> = {
  title: 'Compound/ReviewThread',
  component: ReviewThread,
  subcomponents: parts({ Header: ReviewThread.Header, Comment: ReviewThread.Comment, Reply: ReviewThread.Reply }),
  tags: ['autodocs'],
  argTypes: events({
    onReply: 'Called with the trimmed reply text when Send reply is pressed. Blank replies cannot be sent.',
    onResolveChange: 'Called with true when the thread is resolved and false when it is reopened.',
  }),
  args: { onReply: spy('onReply'), onResolveChange: spy('onResolveChange') },
  decorators: [(Story) => <div style={{ maxWidth: 560 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof ReviewThread>;

const render = (seed?: Seed) => (args: React.ComponentProps<typeof ReviewThread>) => <Demo {...args} seed={seed} />;
const reply = (c: HTMLElement) => within(c).getByLabelText('Reply') as HTMLTextAreaElement;
const send = (c: HTMLElement) => within(c).getByRole('button', { name: 'Send reply' });

// ---- States ----

export const Open: Story = {
  render: render(),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/2 comments/)).toBeVisible();
    await expect(reply(canvasElement)).toBeVisible();
  },
};
export const Resolved: Story = {
  render: (args) => <Demo {...args} defaultResolved />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Reopen thread' })).toBeVisible();
    await expect(within(canvasElement).queryByLabelText('Reply')).toBeNull();
  },
};
export const NoCommentsYet: Story = {
  render: render([]),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/0 comments/)).toBeVisible();
    await expect(reply(canvasElement)).toBeVisible();
  },
};
export const SingleComment: Story = {
  render: render(SEED.slice(0, 1)),
  play: async ({ canvasElement }) => {
    // Singular, not "1 comments".
    await expect(within(canvasElement).getByText(/1 comment(?!s)/)).toBeVisible();
  },
};
export const LongConversation: Story = {
  render: render(Array.from({ length: 8 }, (_, i) => ({ author: { name: i % 2 ? 'Tomás Herrera' : 'Priya Raman' }, body: `Comment number ${i + 1} about the clipped focus ring.`, createdAt: '2026-10-18T09:10:00Z' }))),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/8 comments/)).toBeVisible();
    await expect(within(canvasElement).getAllByRole('article')).toHaveLength(8);
  },
};

// ---- Actions: replying ----

export const ReplyAddsAComment: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: render(),
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    clear(args.onReply);
    await step('type a reply', async () => {
      await userEvent.type(reply(canvasElement), '  Fixed in the next push.  ');
    });
    await step('Send reply reports the trimmed text, once', async () => {
      await userEvent.click(send(canvasElement));
      await expect(args.onReply).toHaveBeenCalledTimes(1);
      await expect(args.onReply).toHaveBeenCalledWith('Fixed in the next push.');
    });
    await step('the comment is added and the count updates', async () => {
      await expect(canvas.getByText('Fixed in the next push.')).toBeInTheDocument();
      await expect(canvas.getByText(/3 comments/)).toBeInTheDocument();
    });
    await step('the field is emptied and keeps focus for a follow-up', async () => {
      await expect(reply(canvasElement)).toHaveValue('');
      await expect(reply(canvasElement)).toHaveFocus();
    });
  },
};

export const TwoRepliesInARow: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: render(),
  play: async ({ canvasElement, args }) => {
    clear(args.onReply);
    await userEvent.type(reply(canvasElement), 'First');
    await userEvent.click(send(canvasElement));
    await userEvent.type(reply(canvasElement), 'Second');
    await userEvent.click(send(canvasElement));
    await expect((args.onReply as jest.Mock).mock.calls.map((c) => c[0])).toEqual(['First', 'Second']);
    await expect(within(canvasElement).getByText(/4 comments/)).toBeInTheDocument();
  },
};

export const MultiLineReply: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: render(),
  play: async ({ canvasElement, args }) => {
    clear(args.onReply);
    await userEvent.type(reply(canvasElement), 'Line one{shift>}{enter}{/shift}Line two');
    await userEvent.click(send(canvasElement));
    await expect(args.onReply).toHaveBeenCalledWith('Line one\nLine two');
  },
};

export const SendIsDisabledWhenBlank: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: render(),
  play: async ({ canvasElement, args, step }) => {
    clear(args.onReply);
    await step('empty: disabled', async () => {
      await expect(send(canvasElement)).toBeDisabled();
    });
    await step('spaces only: still disabled, and nothing is sent', async () => {
      await userEvent.type(reply(canvasElement), '   ');
      await expect(send(canvasElement)).toBeDisabled();
      await expect(args.onReply).not.toHaveBeenCalled();
    });
    await step('real text: enabled', async () => {
      await userEvent.type(reply(canvasElement), 'ok');
      await expect(send(canvasElement)).toBeEnabled();
    });
  },
};

// ---- Actions: resolving ----

export const ResolvingHidesTheReplyBox: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: render(),
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    clear(args.onResolveChange);
    await step('Resolve thread reports true once', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Resolve thread' }));
      await expect(args.onResolveChange).toHaveBeenCalledTimes(1);
      await expect(args.onResolveChange).toHaveBeenLastCalledWith(true);
    });
    await step('the reply box is replaced by a note', async () => {
      await expect(canvas.queryByLabelText('Reply')).toBeNull();
      await expect(canvas.getByText(/This thread is resolved/)).toBeInTheDocument();
    });
    await step('Reopen brings it back and reports false', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Reopen thread' }));
      await expect(args.onResolveChange).toHaveBeenLastCalledWith(false);
      await expect(canvas.getByLabelText('Reply')).toBeInTheDocument();
    });
  },
};

export const CommentsStayVisibleWhenResolved: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: render(),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Resolve thread' }));
    await expect(within(canvasElement).getByText(SEED[0].body)).toBeVisible();
    await expect(within(canvasElement).getByText(SEED[1].body)).toBeVisible();
  },
};

// ---- Keyboard and accessibility ----

export const RepliedWithKeyboard: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: render(),
  play: async ({ canvasElement, args, step }) => {
    clear(args.onReply);
    await step('Tab reaches Resolve thread, then the reply box', async () => {
      await userEvent.tab();
      await expect(within(canvasElement).getByRole('button', { name: 'Resolve thread' })).toHaveFocus();
      await userEvent.tab();
      await expect(reply(canvasElement)).toHaveFocus();
    });
    await step('type, Tab to Send, press Enter', async () => {
      await userEvent.keyboard('From the keyboard');
      await userEvent.tab();
      await expect(send(canvasElement)).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      await expect(args.onReply).toHaveBeenCalledWith('From the keyboard');
    });
  },
};

export const ThreadIsALabelledSection: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: render(),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('region', { name: 'Review thread' })).toBeInTheDocument();
  },
};

export const EveryCommentIsAnArticleNamedAfterItsAuthor: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: render(),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('article', { name: 'Comment by Priya Raman' })).toBeInTheDocument();
    await expect(within(canvasElement).getByRole('article', { name: 'Comment by Tomás Herrera' })).toBeInTheDocument();
  },
};

export const ReplyBoxHasAVisibleLabel: Story = {
  parameters: BEHAVIOUR_ONLY,
  render: render(),
  play: async ({ canvasElement }) => {
    await expect(reply(canvasElement)).toHaveAccessibleName('Reply');
  },
};

export const StatesMatrix: Story = {
  parameters: { chromatic: { modes: MATRIX_RTL_MODES } },
  render: (args) => (
    <StateGrid min={420}>
      <State label="open"><Demo {...args} /></State>
      <State label="resolved"><Demo {...args} defaultResolved /></State>
      <State label="no comments yet"><Demo {...args} seed={[]} /></State>
      <State label="single comment"><Demo {...args} seed={SEED.slice(0, 1)} /></State>
    </StateGrid>
  ),
  play: async ({ canvasElement }) => {
    // One caption per state: if a state disappears from the matrix, this fails.
    await expect(canvasElement.querySelectorAll('[data-state]')).toHaveLength(4);
  },
};
