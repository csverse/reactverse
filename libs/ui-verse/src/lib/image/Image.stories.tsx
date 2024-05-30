import type { Meta, StoryObj } from '@storybook/react';
import { Image, ImagePropsType } from './Image';
import Template from '../utils/hoc/Template';

const meta: Meta<typeof Image> = {
  component: Image,
  title: 'Image',
};
export default meta;
type Story = StoryObj<typeof Image>;

export const Primary = (props: ImagePropsType) => {
  return (
    <Template>
      <Image {...props} />
    </Template>
  );
};
