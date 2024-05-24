import type { Meta, StoryObj } from '@storybook/react';
import { H1 } from './h1';

const meta: Meta<typeof H1> = {
  component: H1,
  title: 'H1',
};
export default meta;
type Story = StoryObj<typeof H1>;

export const h1 = ({ ...args }) => {
  return <H1 className="h1">Welcome to UiVerse H1 tag</H1>;
};

export const h2: Story = {
  args: {},
};
