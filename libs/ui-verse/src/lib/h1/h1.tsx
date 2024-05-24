import { FunctionComponent, ReactNode } from 'react';

/* eslint-disable-next-line */
export interface H1Props {
  children: ReactNode;
  className: string;
}

export const H1: FunctionComponent<H1Props> = (props) => {
  return <h1 className={props.className}>{props.children}</h1>;
};

export default H1;
