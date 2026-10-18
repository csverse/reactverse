import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { BuildsPagination } from './BuildsPagination';
import { events } from '../../utils/storybook/events';
import { spy, clear } from '../../utils/storybook/spy';
import { StateGrid, State } from '../../utils/storybook/StateGrid';
import { RtlFrame, directionOf } from '../../utils/storybook/RtlFrame';
import { BEHAVIOUR_ONLY, MATRIX_MODES, MATRIX_RTL_MODES } from '../../utils/storybook/chromatic';

const meta: Meta<typeof BuildsPagination> = {
  title: 'Molecules/BuildsPagination',
  component: BuildsPagination,
  tags: ['autodocs'],
  argTypes: events({ onChange: 'Called with the new page number, starting at 1, each time the page changes.' }),
  args: { totalItems: 482, onChange: spy('onChange') },
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
  parameters: BEHAVIOUR_ONLY,
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
  parameters: BEHAVIOUR_ONLY,
  args: { defaultPage: 999 },
  play: async ({ canvasElement }) => {
    await expect(text(canvasElement, 'Showing 481–482 of 482 builds')).toBeInTheDocument();
  },
};

// ---- Actions ----

export const NextPage: Story = {
  parameters: BEHAVIOUR_ONLY,
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
  parameters: BEHAVIOUR_ONLY,
  args: { defaultPage: 4 },
  play: async ({ canvasElement, args }) => {
    clear(args.onChange);
    await userEvent.click(btn(canvasElement, 'Previous page'));
    await expect(args.onChange).toHaveBeenLastCalledWith(3);
  },
};

export const JumpToAPage: Story = {
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement, args }) => {
    clear(args.onChange);
    await userEvent.click(btn(canvasElement, 'Page 3'));
    await expect(args.onChange).toHaveBeenLastCalledWith(3);
    await expect(btn(canvasElement, 'Page 3')).toHaveAttribute('aria-current', 'page');
    await expect(btn(canvasElement, 'Page 1')).not.toHaveAttribute('aria-current');
  },
};

export const JumpToTheEnds: Story = {
  parameters: BEHAVIOUR_ONLY,
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
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement, args }) => {
    clear(args.onChange);
    await userEvent.click(btn(canvasElement, 'Previous page'));
    await userEvent.click(btn(canvasElement, 'First page'));
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

// ---- Keyboard and accessibility ----

export const PagedByKeyboard: Story = {
  parameters: BEHAVIOUR_ONLY,
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
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('navigation', { name: 'Builds pagination' })).toBeInTheDocument();
  },
};

export const EveryControlIsNamed: Story = {
  parameters: BEHAVIOUR_ONLY,
  args: { defaultPage: 5 },
  play: async ({ canvasElement }) => {
    for (const name of ['First page', 'Previous page', 'Next page', 'Last page', 'Page 5']) {
      await expect(btn(canvasElement, name)).toBeInTheDocument();
    }
  },
};

export const RangeIsAnnouncedWhenItChanges: Story = {
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement }) => {
    await expect(text(canvasElement, 'Showing 1–20 of 482 builds')).toHaveAttribute('aria-live', 'polite');
  },
};

export const StatesMatrix: Story = {
  parameters: { chromatic: { modes: MATRIX_RTL_MODES } },
  render: (args) => (
    <StateGrid min={480}>
      <State label="first page"><BuildsPagination {...args} /></State>
      <State label="middle page"><BuildsPagination {...args} defaultPage={12} /></State>
      <State label="last page"><BuildsPagination {...args} defaultPage={25} /></State>
      <State label="one page"><BuildsPagination {...args} totalItems={12} /></State>
      <State label="no builds"><BuildsPagination {...args} totalItems={0} /></State>
      <State label="custom page size"><BuildsPagination {...args} pageSize={50} /></State>
    </StateGrid>
  ),
  play: async ({ canvasElement }) => {
    // One caption per state: if a state disappears from the matrix, this fails.
    await expect(canvasElement.querySelectorAll('[data-state]')).toHaveLength(6);
  },
};

/** Right to left: the story itself is RTL, so paging is tested, not only photographed. */
export const Rtl: Story = {
  render: (args) => (
    <RtlFrame>
      <BuildsPagination {...args} />
    </RtlFrame>
  ),
  play: async ({ canvasElement, args, step }) => {
    clear(args.onChange);
    await step('the navigation lays out right to left', async () => {
      await expect(directionOf(within(canvasElement).getByRole('navigation'))).toBe('rtl');
    });
    await step('Next page still means the next page, and reports it', async () => {
      await userEvent.click(btn(canvasElement, 'Next page'));
      await expect(args.onChange).toHaveBeenLastCalledWith(2);
      await expect(text(canvasElement, 'Showing 21–40 of 482 builds')).toBeInTheDocument();
    });
  },
};
