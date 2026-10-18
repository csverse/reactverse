import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { ChangeReviewCard } from './ChangeReviewCard';
import { parts } from '../../utils/storybook/parts';
import { RESPONSIVE_MODES } from '../../utils/storybook/chromatic';
import { events } from '../../utils/storybook/events';
import { spy, clear } from '../../utils/storybook/spy';

const meta: Meta<typeof ChangeReviewCard> = {
  title: 'Compound/ChangeReviewCard',
  component: ChangeReviewCard,
  subcomponents: parts({ Preview: ChangeReviewCard.Preview, Meta: ChangeReviewCard.Meta, Actions: ChangeReviewCard.Actions }),
  tags: ['autodocs'],
  argTypes: events({ onDecision: 'Called with the card id and the new decision ("approved", "denied", or "pending" after an undo).' }),
  args: { id: 'builds-table-loading', title: 'BuildsTable / Loading', onDecision: spy('onDecision') },
  decorators: [(Story) => <div style={{ maxWidth: 460 }}><Story /></div>],
  parameters: { chromatic: { modes: RESPONSIVE_MODES } },
};
export default meta;
type Story = StoryObj<typeof ChangeReviewCard>;

const T = 'BuildsTable / Loading';
const Full = (args: React.ComponentProps<typeof ChangeReviewCard>) => (
  <ChangeReviewCard {...args}>
    <ChangeReviewCard.Preview variant="shifted" />
    <ChangeReviewCard.Meta>Light · Chrome · 1200px</ChangeReviewCard.Meta>
    <ChangeReviewCard.Actions />
  </ChangeReviewCard>
);
const approve = (c: HTMLElement, title = T) => within(c).getByRole('button', { name: `Approve ${title}` });
const deny = (c: HTMLElement, title = T) => within(c).getByRole('button', { name: `Deny ${title}` });
const undo = (c: HTMLElement) => within(c).getByRole('button', { name: 'Undo decision' });

// ---- States ----

export const Pending: Story = {
  render: (args) => <Full {...args} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Needs review')).toBeVisible();
    await expect(approve(canvasElement)).toBeVisible();
    await expect(deny(canvasElement)).toBeVisible();
  },
};
export const Approved: Story = {
  render: (args) => <Full {...args} defaultDecision="approved" />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Approved')).toBeVisible();
    await expect(undo(canvasElement)).toBeVisible();
  },
};
export const Denied: Story = {
  render: (args) => <Full {...args} defaultDecision="denied" />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Denied')).toBeVisible();
    await expect(undo(canvasElement)).toBeVisible();
  },
};
export const ColourChange: Story = {
  render: (args) => (
    <ChangeReviewCard {...args} title="StatusBadge / Denied">
      <ChangeReviewCard.Preview variant="recolored" />
      <ChangeReviewCard.Meta>Dark · Firefox · 320px</ChangeReviewCard.Meta>
      <ChangeReviewCard.Actions />
    </ChangeReviewCard>
  ),
  play: async ({ canvasElement }) => {
    await expect(approve(canvasElement, 'StatusBadge / Denied')).toBeVisible();
    await expect(within(canvasElement).getByRole('img', { name: 'Change snapshot' })).toBeVisible();
  },
};
export const IdenticalPreview: Story = {
  render: (args) => (
    <ChangeReviewCard {...args}>
      <ChangeReviewCard.Preview variant="identical" />
      <ChangeReviewCard.Meta>Only the timestamp differs</ChangeReviewCard.Meta>
      <ChangeReviewCard.Actions />
    </ChangeReviewCard>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole('img')).toHaveLength(2);
  },
};
export const WithoutPreview: Story = {
  render: (args) => (
    <ChangeReviewCard {...args}>
      <ChangeReviewCard.Meta>Interaction test failed in 2 modes</ChangeReviewCard.Meta>
      <ChangeReviewCard.Actions />
    </ChangeReviewCard>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('img')).toBeNull();
    await expect(approve(canvasElement)).toBeVisible();
  },
};

// ---- Actions ----

export const ApprovedByClick: Story = {
  render: (args) => <Full {...args} />,
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    clear(args.onDecision);
    await step('Approve reports the decision for this card, once', async () => {
      await userEvent.click(approve(canvasElement));
      await expect(args.onDecision).toHaveBeenCalledTimes(1);
      await expect(args.onDecision).toHaveBeenCalledWith('builds-table-loading', 'approved');
    });
    await step('the badge changes and the buttons are replaced by Undo', async () => {
      await expect(canvas.getByText('Approved')).toBeInTheDocument();
      await expect(canvas.queryByRole('button', { name: /^Deny/ })).toBeNull();
      await expect(undo(canvasElement)).toBeInTheDocument();
    });
  },
};

export const DeniedByClick: Story = {
  render: (args) => <Full {...args} />,
  play: async ({ canvasElement, args }) => {
    clear(args.onDecision);
    await userEvent.click(deny(canvasElement));
    await expect(args.onDecision).toHaveBeenCalledWith('builds-table-loading', 'denied');
    await expect(within(canvasElement).getByText('Denied')).toBeInTheDocument();
  },
};

export const DeniedThenUndone: Story = {
  render: (args) => <Full {...args} />,
  play: async ({ canvasElement, args, step }) => {
    clear(args.onDecision);
    await step('Deny', async () => {
      await userEvent.click(deny(canvasElement));
      await expect(args.onDecision).toHaveBeenLastCalledWith('builds-table-loading', 'denied');
    });
    await step('Undo returns it to pending with both buttons back', async () => {
      await userEvent.click(undo(canvasElement));
      await expect(args.onDecision).toHaveBeenLastCalledWith('builds-table-loading', 'pending');
      await expect(approve(canvasElement)).toBeInTheDocument();
      await expect(within(canvasElement).getByText('Needs review')).toBeInTheDocument();
    });
  },
};

export const ChangedMindTwice: Story = {
  render: (args) => <Full {...args} />,
  play: async ({ canvasElement, args }) => {
    clear(args.onDecision);
    await userEvent.click(approve(canvasElement));
    await userEvent.click(undo(canvasElement));
    await userEvent.click(deny(canvasElement));
    await expect((args.onDecision as jest.Mock).mock.calls.map((c) => c[1])).toEqual(['approved', 'pending', 'denied']);
  },
};

export const ReviewQueue: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      {[
        ['tabs', 'BuildTabs / Default'],
        ['modal', 'AcceptChangesModal / Open'],
        ['table', 'BuildsTable / Loading'],
      ].map(([id, title]) => (
        <ChangeReviewCard key={id} {...args} id={id} title={title}>
          <ChangeReviewCard.Meta />
          <ChangeReviewCard.Actions />
        </ChangeReviewCard>
      ))}
    </div>
  ),
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    clear(args.onDecision);
    await step('approving one card leaves the others pending', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Approve BuildTabs / Default' }));
      await expect(canvas.getAllByText('Needs review')).toHaveLength(2);
      await expect(args.onDecision).toHaveBeenLastCalledWith('tabs', 'approved');
    });
    await step('each card reports its own id', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Deny BuildsTable / Loading' }));
      await expect(args.onDecision).toHaveBeenLastCalledWith('table', 'denied');
    });
  },
};

// ---- Keyboard and accessibility ----

export const ApprovedWithKeyboard: Story = {
  render: (args) => <Full {...args} />,
  play: async ({ canvasElement, args, step }) => {
    clear(args.onDecision);
    await step('Tab lands on Approve first', async () => {
      await userEvent.tab();
      await expect(approve(canvasElement)).toHaveFocus();
    });
    await step('Enter approves', async () => {
      await userEvent.keyboard('{Enter}');
      await expect(args.onDecision).toHaveBeenCalledWith('builds-table-loading', 'approved');
    });
  },
};

export const DeniedWithKeyboard: Story = {
  render: (args) => <Full {...args} />,
  play: async ({ canvasElement, args }) => {
    clear(args.onDecision);
    await userEvent.tab();
    await userEvent.tab();
    await expect(deny(canvasElement)).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(args.onDecision).toHaveBeenCalledWith('builds-table-loading', 'denied');
  },
};

export const CardIsNamedAfterItsStory: Story = {
  render: (args) => <Full {...args} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('article', { name: `Change in ${T}` })).toBeInTheDocument();
  },
};

export const ButtonsNameTheStoryTheyAffect: Story = {
  render: (args) => <Full {...args} />,
  play: async ({ canvasElement }) => {
    // With many cards on a page, "Approve" alone would be ambiguous to a screen reader.
    await expect(approve(canvasElement)).toHaveAccessibleName(`Approve ${T}`);
    await expect(deny(canvasElement)).toHaveAccessibleName(`Deny ${T}`);
  },
};

export const PreviewsAreLabelled: Story = {
  render: (args) => <Full {...args} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('img', { name: 'Baseline snapshot' })).toBeInTheDocument();
    await expect(within(canvasElement).getByRole('img', { name: 'Change snapshot' })).toBeInTheDocument();
  },
};
