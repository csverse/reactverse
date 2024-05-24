import type { Meta, StoryObj } from '@storybook/react';
import { UiVerse } from './ui-verse';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<typeof UiVerse> = {
  component: UiVerse,
  title: 'UiVerse',
};
export default meta;
type Story = StoryObj<typeof UiVerse>;

export const Primary = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to UiVerse!/gi)).toBeTruthy();
  },
};
