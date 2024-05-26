import type { Meta } from '@storybook/react';
import { Button, ButtonPropsType } from './Button';
import Template from '../utils/hoc/Template';

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'Button',
};

export default meta;

export const Primary = (props: ButtonPropsType) => {
  return (
    <Template>
      <Button {...props}>Click Me</Button>
    </Template>
  );
};
