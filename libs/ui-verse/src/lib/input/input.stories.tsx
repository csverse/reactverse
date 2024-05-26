import type { Meta, StoryObj } from '@storybook/react';
import { Input, InputPropsType } from './input';
import Template from '../utils/hoc/Template';

const meta: Meta<typeof Input> = {
  component: Input,
  title: 'Input',
};

export default meta;

export const Primary = (props: InputPropsType) => {
  return (
    <Template>
      <Input variant="default" placeholder="input component" {...props} />
    </Template>
  );
};

export const Secondary = (props: InputPropsType) => {
  return (
    <Template>
      <Input variant="filled" placeholder="input component" {...props} />
    </Template>
  );
};

export const Disabled = (props: InputPropsType) => {
  return (
    <Template>
      <Input
        variant="filled"
        disabled
        placeholder="input component"
        {...props}
      />
    </Template>
  );
};
