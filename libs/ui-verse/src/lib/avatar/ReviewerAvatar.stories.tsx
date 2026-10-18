import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { ReviewerAvatar, ReviewerStack, Reviewer } from './ReviewerAvatar';
import { events } from '../utils/storybook/events';
import { userEvent } from '@storybook/testing-library';
import { figma } from '../utils/storybook/chromatic';
import { spy, clear } from '../utils/storybook/spy';

// Inline SVG avatar: deterministic, no network, so snapshots never flake on image loads.
const portrait = (bg: string, fg: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${bg}"/><circle cx="32" cy="26" r="11" fill="${fg}"/><path d="M10 64c2-16 12-22 22-22s20 6 22 22z" fill="${fg}"/></svg>`
  )}`;

const TEAM: Reviewer[] = [
  { name: 'Priya Raman', src: portrait('#e9c9b6', '#7a3b1d') },
  { name: 'Tomás Herrera', src: portrait('#c6d7e2', '#1f4a68') },
  { name: 'Mei Lin' },
  { name: 'Okonkwo Adeyemi' },
  { name: 'Sara Lindqvist' },
  { name: 'Dev Patel' },
  { name: 'Hana Sato' },
];

/**
 * `onClick` is optional. Only the `Clickable` stories fire it, so the Actions
 * panel fills in there. The other tests check the accessible name: every avatar is an image named after
 * the person, whether it shows a photo or initials.
 */
const meta: Meta<typeof ReviewerAvatar> = {
  title: 'Review Desk/ReviewerAvatar',
  component: ReviewerAvatar,
  tags: ['autodocs'],
  argTypes: events({
      onClick: "Called with the reviewer's name when the avatar is clicked. Passing it turns the avatar into a button.",
  }),
  args: { name: 'Priya Raman' },
  parameters: figma('2:2'),
};
export default meta;
type Story = StoryObj<typeof ReviewerAvatar>;

export const WithImage: Story = {
  args: { src: TEAM[0].src },
  play: async ({ canvasElement }) => {
    const avatar = within(canvasElement).getAllByRole('img', { name: 'Priya Raman' });
    await expect(avatar.length).toBeGreaterThan(0);
  },
};
export const InitialsFallback: Story = {
  args: { name: 'Mei Lin' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('img', { name: 'Mei Lin' })).toBeVisible();
    await expect(canvas.getByText('ML')).toBeVisible();
  },
};
/** A deliberately dead URL: Mantine falls back to initials once the load errors. */
export const BrokenImage: Story = {
  args: { name: 'Dev Patel', src: 'http://localhost:0/missing.png' },
  parameters: { chromatic: { delay: 500 } },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText('DP')).toBeVisible();
  },
};
export const SingleName: Story = {
  args: { name: 'Hana' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('H')).toBeVisible();
  },
};
export const Large: Story = { args: { size: 96, src: TEAM[0].src } };

export const Stack: StoryObj<typeof ReviewerStack> = {
  render: (args) => <ReviewerStack {...args} />,
  args: { reviewers: TEAM.slice(0, 3) },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByLabelText('3 reviewers')).toBeVisible();
  },
};
export const StackOverflow: StoryObj<typeof ReviewerStack> = {
  render: (args) => <ReviewerStack {...args} />,
  args: { reviewers: TEAM, max: 4 },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('the group announces how many reviewers there are', async () => {
      await expect(canvas.getByLabelText('7 reviewers')).toBeVisible();
    });
    await step('the +N avatar names the people it hides', async () => {
      await expect(
        canvas.getByRole('img', { name: '3 more: Sara Lindqvist, Dev Patel, Hana Sato' })
      ).toBeVisible();
    });
  },
};

/** A clickable avatar, e.g. to open the reviewer's profile. */
export const Clickable: Story = {
  args: { name: 'Mei Lin', onClick: spy('onClick') },
  play: async ({ canvasElement, args }) => {
    clear(args.onClick);
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Mei Lin' }));
    await expect(args.onClick).toHaveBeenCalledWith('Mei Lin');
  },
};

export const StackClickable: StoryObj<typeof ReviewerStack> = {
  render: (args) => <ReviewerStack {...args} />,
  args: { reviewers: TEAM.slice(0, 3), onReviewerClick: spy('onReviewerClick') },
  argTypes: events({ onReviewerClick: "Called with the reviewer's name when one avatar is clicked." }),
  play: async ({ canvasElement, args }) => {
    clear(args.onReviewerClick);
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Tomás Herrera' }));
    await expect(args.onReviewerClick).toHaveBeenCalledWith('Tomás Herrera');
  },
};
