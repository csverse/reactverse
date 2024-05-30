import type { Meta, StoryObj } from '@storybook/react';
import { Image } from './Image';

const meta: Meta<typeof Image> = {
  component: Image,
  title: 'Image',
};
export default meta;
type Story = StoryObj<typeof Image>;

export const Primary = {
  args: {},
};
