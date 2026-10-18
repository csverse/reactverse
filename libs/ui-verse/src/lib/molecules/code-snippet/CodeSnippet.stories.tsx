import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { CodeSnippet } from './CodeSnippet';
import { events } from '../../utils/storybook/events';
import { spy, clear } from '../../utils/storybook/spy';
import { StateGrid, State } from '../../utils/storybook/StateGrid';
import { BEHAVIOUR_ONLY, MATRIX_MODES, MATRIX_RTL_MODES } from '../../utils/storybook/chromatic';

const CMD = 'npx chromatic --project-token=<token>';

const meta: Meta<typeof CodeSnippet> = {
  title: 'Molecules/CodeSnippet',
  component: CodeSnippet,
  tags: ['autodocs'],
  argTypes: events({ onCopy: 'Called with the code each time the copy button is pressed, whether or not the browser allowed the clipboard write.' }),
  args: { code: CMD, onCopy: spy('onCopy') },
  decorators: [(Story) => <div style={{ maxWidth: 520 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof CodeSnippet>;

const region = (c: HTMLElement, name = 'command') => within(c).getByRole('region', { name });
const copyButton = (c: HTMLElement, name = 'Copy command') => within(c).getByRole('button', { name });

// ---- States ----

export const InstallCommand: Story = {
  play: async ({ canvasElement }) => {
    await expect(region(canvasElement)).toHaveTextContent(CMD);
    await expect(copyButton(canvasElement)).toBeVisible();
  },
};
export const MultiLine: Story = {
  args: {
    label: 'workflow step',
    code: `- name: Publish to Chromatic\n  uses: chromaui/action@latest\n  with:\n    projectToken: \${{ secrets.CHROMATIC_PROJECT_TOKEN }}`,
  },
  play: async ({ canvasElement }) => {
    // Line breaks and indentation survive.
    await expect(region(canvasElement, 'workflow step').textContent).toContain('\n  uses: chromaui/action@latest');
  },
};
export const LongLineScrolls: Story = {
  args: { code: 'npm run build-storybook && npx http-server libs/ui-verse/storybook-static --port 6006 --silent --cors' },
  play: async ({ canvasElement }) => {
    const pre = region(canvasElement);
    await expect(pre).toHaveAttribute('tabindex', '0');
  },
};
export const WithoutCopy: Story = {
  args: { hideCopy: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button')).toBeNull();
  },
};
export const CustomLabel: Story = {
  args: { label: 'install step', code: 'npm install' },
  play: async ({ canvasElement }) => {
    await expect(region(canvasElement, 'install step')).toBeVisible();
    await expect(copyButton(canvasElement, 'Copy install step')).toBeVisible();
  },
};
export const CodeWithMarkupIsShownAsText: Story = {
  parameters: BEHAVIOUR_ONLY,
  args: { code: '<script>alert("hi")</script>' },
  play: async ({ canvasElement }) => {
    await expect(region(canvasElement)).toHaveTextContent('<script>alert("hi")</script>');
    await expect(canvasElement.querySelector('script')).toBeNull();
  },
};

// ---- Actions ----

export const CopyReportsTheCode: Story = {
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement, args }) => {
    clear(args.onCopy);
    await userEvent.click(copyButton(canvasElement));
    await expect(args.onCopy).toHaveBeenCalledTimes(1);
    await expect(args.onCopy).toHaveBeenCalledWith(CMD);
  },
};

export const CopyReportsEveryPress: Story = {
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement, args }) => {
    clear(args.onCopy);
    await userEvent.click(copyButton(canvasElement));
    await userEvent.click(within(canvasElement).getByRole('button', { name: /Copy|Copied/ }));
    await expect(args.onCopy).toHaveBeenCalledTimes(2);
  },
};

// ---- Keyboard and accessibility ----

export const CopiedWithKeyboard: Story = {
  parameters: BEHAVIOUR_ONLY,
  play: async ({ canvasElement, args, step }) => {
    clear(args.onCopy);
    await step('Tab goes to the snippet first so it can be scrolled', async () => {
      await userEvent.tab();
      await expect(region(canvasElement)).toHaveFocus();
    });
    await step('Tab again reaches the copy button', async () => {
      await userEvent.tab();
      await expect(copyButton(canvasElement)).toHaveFocus();
    });
    await step('Enter copies', async () => {
      await userEvent.keyboard('{Enter}');
      await expect(args.onCopy).toHaveBeenCalledWith(CMD);
    });
  },
};

export const ScrollableByKeyboard: Story = {
  parameters: BEHAVIOUR_ONLY,
  args: { hideCopy: true },
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(region(canvasElement)).toHaveFocus();
  },
};

export const ButtonNameTellsYouWhatItCopies: Story = {
  parameters: BEHAVIOUR_ONLY,
  args: { label: 'workflow step' },
  play: async ({ canvasElement }) => {
    await expect(copyButton(canvasElement, 'Copy workflow step')).toHaveAccessibleName('Copy workflow step');
  },
};

export const StatesMatrix: Story = {
  parameters: { chromatic: { modes: MATRIX_MODES } },
  render: (args) => (
    <StateGrid min={320}>
      <State label="command"><CodeSnippet {...args} /></State>
      <State label="multi-line"><CodeSnippet {...args} label="workflow step" code={'- name: Publish\n  uses: chromaui/action@latest\n  with:\n    projectToken: token'} /></State>
      <State label="long line scrolls"><CodeSnippet {...args} code="npm run build-storybook && npx http-server libs/ui-verse/storybook-static --port 6006 --silent --cors" /></State>
      <State label="without copy"><CodeSnippet {...args} hideCopy /></State>
    </StateGrid>
  ),
  play: async ({ canvasElement }) => {
    // One caption per state: if a state disappears from the matrix, this fails.
    await expect(canvasElement.querySelectorAll('[data-state]')).toHaveLength(4);
  },
};
