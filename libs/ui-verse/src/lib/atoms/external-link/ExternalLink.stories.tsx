import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { ExternalLink } from './ExternalLink';
import { events } from '../../utils/storybook/events';
import { spy, clear } from '../../utils/storybook/spy';

const meta: Meta<typeof ExternalLink> = {
  title: 'Atoms/ExternalLink',
  component: ExternalLink,
  tags: ['autodocs'],
  argTypes: events({ onNavigate: 'Called with the href when the link is activated. The link still opens in a new tab.' }),
  args: { href: 'https://www.chromatic.com/docs', children: 'Chromatic docs', onNavigate: spy('onNavigate') },
};
export default meta;
type Story = StoryObj<typeof ExternalLink>;

const link = (c: HTMLElement) => within(c).getByRole('link', { name: 'Chromatic docs (opens in a new tab)' });

// A plain left click would open a real tab, so these tests block the navigation first.
const blockNavigation = (el: HTMLElement) => el.addEventListener('click', (e) => e.preventDefault());

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(link(canvasElement)).toBeVisible();
    await expect(canvasElement.querySelector('svg')).toBeInTheDocument();
  },
};
export const WithoutIcon: Story = {
  args: { showIcon: false },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('svg')).toBeNull();
    // Dropping the icon must not drop the spoken note.
    await expect(link(canvasElement)).toBeVisible();
  },
};
export const InASentence: Story = {
  render: (args) => (
    <p>
      Modes are explained in the <ExternalLink {...args}>Chromatic docs</ExternalLink>, which also covers viewports.
    </p>
  ),
  play: async ({ canvasElement }) => {
    await expect(link(canvasElement)).toBeVisible();
  },
};

export const OpensSafelyInANewTab: Story = {
  play: async ({ canvasElement }) => {
    await expect(link(canvasElement)).toHaveAttribute('target', '_blank');
    await expect(link(canvasElement)).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(link(canvasElement)).toHaveAttribute('href', 'https://www.chromatic.com/docs');
  },
};

// ---- Actions ----

export const ReportsNavigation: Story = {
  play: async ({ canvasElement, args }) => {
    clear(args.onNavigate);
    blockNavigation(link(canvasElement));
    await userEvent.click(link(canvasElement));
    await expect(args.onNavigate).toHaveBeenCalledTimes(1);
    await expect(args.onNavigate).toHaveBeenCalledWith('https://www.chromatic.com/docs');
  },
};

export const ReportsKeyboardActivation: Story = {
  play: async ({ canvasElement, args, step }) => {
    clear(args.onNavigate);
    blockNavigation(link(canvasElement));
    await step('Tab focuses the link', async () => {
      await userEvent.tab();
      await expect(link(canvasElement)).toHaveFocus();
    });
    await step('Enter activates it and reports once', async () => {
      await userEvent.keyboard('{Enter}');
      await expect(args.onNavigate).toHaveBeenCalledTimes(1);
    });
  },
};

// ---- Accessibility ----

export const TellsScreenReadersAboutTheNewTab: Story = {
  play: async ({ canvasElement }) => {
    await expect(link(canvasElement)).toHaveAccessibleName('Chromatic docs (opens in a new tab)');
  },
};

export const IconIsDecorative: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  },
};

export const ReachableByKeyboard: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(link(canvasElement)).toHaveFocus();
  },
};
