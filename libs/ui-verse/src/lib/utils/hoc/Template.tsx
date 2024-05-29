import { MantineProvider } from '@mantine/core';
import React, { ReactNode } from 'react';

type TemplateProps<P> = P & {
  children: ReactNode;
};

export const Template = <P extends NonNullable<unknown>>(
  props: TemplateProps<P>
) => {
  return (
    <MantineProvider>
      {props.children}
    </MantineProvider>)
};

export default Template;
