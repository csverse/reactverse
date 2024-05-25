import type { Meta, StoryObj } from '@storybook/react';
import { Input, InputPropsType } from './input';
import { MantineProvider } from '@mantine/core';

const meta: Meta<typeof Input> = {
  component: Input,
  title: 'Input',
};

export default meta;

type Story = StoryObj<typeof Input>;

const Template = (props: InputPropsType) => {
  return (
    <MantineProvider>
      <Input {...props} />
    </MantineProvider>
  );
};

export const Primary = () => {
  return <Template variant="default" placeholder="input component" />;
};

export const Secondary = () => {
  return <Template variant="filled" placeholder="input component" />;
};

export const Disabled = () => {
  return <Template variant="filled" disabled placeholder="input component" />;
};
