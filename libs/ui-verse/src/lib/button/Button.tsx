import { ReactNode } from 'react';
import styles from './Button.module.scss';
import {
  Button as ButtonComponent,
  ButtonProps,
  ElementProps,
} from '@mantine/core';

/* eslint-disable-next-line */
export interface ButtonPropsType
  extends ButtonProps,
    ElementProps<'button', keyof ButtonProps> {
  children?: ReactNode;
}

export function Button(props: ButtonPropsType) {
  return (<ButtonComponent {...props}>{props.children}</ButtonComponent>)
}

export default Button;
