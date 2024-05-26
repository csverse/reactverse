import type { Meta } from '@storybook/react';
import { H1, H1Props } from './h1/h1';
import { Template } from '../utils/hoc/Template';

const meta: Meta<typeof H1> = {
  title: 'Heading',
};
export default meta;

export const h1: React.FC<H1Props> = ({ ...args }) => {
  return (
    <Template>
      <H1>Welcome to UiVerse H1 tag</H1>
    </Template>
  );
};
