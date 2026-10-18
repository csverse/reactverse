import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { BuildsPagination } from './BuildsPagination';
import { RESPONSIVE_MODES } from '../../utils/storybook/chromatic';
import { events } from '../../utils/storybook/events';
import { spy, clear } from '../../utils/storybook/spy';

const meta: Meta<typeof BuildsPagination> = {
  title: 'Molecules/BuildsPagination',
  component: BuildsPagination,
  tags: ['autodocs'],
  argTypes: events({ onChange: 'Called with the new page number, starting at 1, each time the page changes.' }),
  args: { totalItems: 482, onChange: spy('onChange') },
  parameters: { chromatic: { modes: RESPONSIVE_MODES } },
};
export default meta;
type Story = StoryObj<typeof BuildsPagination>;

const btn = (c: HTMLElement, name: string) => within(c).getByRole('button', { name });
const text = (c: HTMLElement, t: string) => within(c).getByText(t);

// ---- States ----

export const FirstPage: Story = {
  play: async ({ canvasElement }) => {
    await expect(text(canvasElement, 'Showing 1–20 of 482 builds')).toBeInTheDocument();
    await expect(btn(canvasElement, 'Page 1')).toHaveAttribute('aria-current', 'page');
  },
};
export const MiddlePage: Story = {
  args: { defaultPage: 12 },
  play: async ({ canvasElement }) => {
    await expect(text(canvasElement, 'Showing 221–240 of 482 builds')).toBeInTheDocument();
    await expect(btn(canvasElement, 'Previous page')).toBeEnabled();
    await expect(btn(canvasElement, 'Next page')).toBeEnabled();
  },
};
export const LastPage: Story = {
  args: { defaultPage: 25 },
  play: async ({ canvasElement }) => {
    // The last page is short: 481 to 482.
    await expect(text(canvasElement, 'Showing 481–482 of 482 builds')).toBeInTheDocument();
    await expect(btn(canvasElement, 'Next page')).toBeDisabled();
  },
};
export const OnePage: Story = {
  args: { totalItems: 12 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('navigation')).toBeNull();
    await expect(text(canvasElement, 'Showing 1–12 of 12 builds')).toBeInTheDocument();
  },
};
export const ExactlyOnePageFull: Story = {
  args: { totalItems: 20 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('navigation')).toBeNull();
    await expect(text(canvasElement, 'Showing 1–20 of 20 builds')).toBeInTheDocument();
  },
};
export const NoBuilds: Story = {
  args: { totalItems: 0 },
  play: async ({ canvasElement }) => {
    await expect(text(canvasElement, 'No builds')).toBeInTheDocument();
    await expect(within(canvasElement).queryByRole('navigation')).toBeNull();
  },
};
export const CustomPageSize: Story = {
  args: { pageSize: 50, totalItems: 482 },
  play: async ({ canvasElement }) => {
    await expect(text(canvasElement, 'Showing 1–50 of 482 builds')).toBeInTheDocument();
    await expect(btn(canvasElement, 'Last page')).toBeEnabled();
  },
};
export const StartPagePastTheEndIsClamped: Story = {
  args: { defaultPage: 999 },
  play: async ({ canvasElement }) => {
    await expect(text(canvasElement, 'Showing 481–482 of 482 builds')).toBeInTheDocument();
  },
};

// ---- Actions ----

export const NextPage: Story = {
  play: async ({ canvasElement, args, step }) => {
    clear(args.onChange);
    await step('Next page moves forward and reports page 2 once', async () => {
      await userEvent.click(btn(canvasElement, 'Next page'));
      await expect(args.onChange).toHaveBeenCalledTimes(1);
      await expect(args.onChange).toHaveBeenLastCalledWith(2);
    });
    await step('the range text follows', async () => {
      await expect(text(canvasElement, 'Showing 21–40 of 482 builds')).toBeInTheDocument();
    });
  },
};

export const PreviousPage: Story = {
  args: { defaultPage: 4 },
  play: async ({ canvasElement, args }) => {
    clear(args.onChange);
    await userEvent.click(btn(canvasElement, 'Previous page'));
    await expect(args.onChange).toHaveBeenLastCalledWith(3);
  },
};

export const JumpToAPage: Story = {
  play: async ({ canvasElement, args }) => {
    clear(args.onChange);
    await userEvent.click(btn(canvasElement, 'Page 3'));
    await expect(args.onChange).toHaveBeenLastCalledWith(3);
    await expect(btn(canvasElement, 'Page 3')).toHaveAttribute('aria-current', 'page');
    await expect(btn(canvasElement, 'Page 1')).not.toHaveAttribute('aria-current');
  },
};

export const JumpToTheEnds: Story = {
  play: async ({ canvasElement, args, step }) => {
    clear(args.onChange);
    await step('Last page goes to 25', async () => {
      await userEvent.click(btn(canvasElement, 'Last page'));
      await expect(args.onChange).toHaveBeenLastCalledWith(25);
    });
    await step('First page goes back to 1', async () => {
      await userEvent.click(btn(canvasElement, 'First page'));
      await expect(args.onChange).toHaveBeenLastCalledWith(1);
    });
  },
};

export const DisabledControlsDoNotFire: Story = {
  play: async ({ canvasElement, args }) => {
    clear(args.onChange);
    await userEvent.click(btn(canvasElement, 'Previous page'));
    await userEvent.click(btn(canvasElement, 'First page'));
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

// ---- Keyboard and accessibility ----

export const PagedByKeyboard: Story = {
  play: async ({ canvasElement, args, step }) => {
    clear(args.onChange);
    await step('focus Next page', async () => {
      btn(canvasElement, 'Next page').focus();
      await expect(btn(canvasElement, 'Next page')).toHaveFocus();
    });
    await step('Enter and Space each turn a page', async () => {
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard(' ');
      await expect(args.onChange).toHaveBeenNthCalledWith(1, 2);
      await expect(args.onChange).toHaveBeenNthCalledWith(2, 3);
    });
  },
};

export const NavigationIsNamed: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('navigation', { name: 'Builds pagination' })).toBeInTheDocument();
  },
};

export const EveryControlIsNamed: Story = {
  args: { defaultPage: 5 },
  play: async ({ canvasElement }) => {
    for (const name of ['First page', 'Previous page', 'Next page', 'Last page', 'Page 5']) {
      await expect(btn(canvasElement, name)).toBeInTheDocument();
    }
  },
};

export const RangeIsAnnouncedWhenItChanges: Story = {
  play: async ({ canvasElement }) => {
    await expect(text(canvasElement, 'Showing 1–20 of 482 builds')).toHaveAttribute('aria-live', 'polite');
  },
};
