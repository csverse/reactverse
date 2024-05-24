import { FunctionComponent, ReactNode } from 'react';
import styles from './h1.module.scss';

/* eslint-disable-next-line */
export interface H1Props {
  children: ReactNode;
}

export const H1: FunctionComponent<H1Props> = (props) => {
  return (
    <div className={styles['container']}>
      <h1>{props.children}</h1>
    </div>
  );
};

export default H1;
