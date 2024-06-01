import { ReactNode } from 'react';
import styles from './Button.module.scss';
import {
  Button as ButtonComponent,
  ButtonProps,
  ElementProps,
} from '@mantine/core';
import Template from '../utils/hoc/Template';

/* eslint-disable-next-line */
export interface ButtonPropsType
  extends ButtonProps,
    ElementProps<'button', keyof ButtonProps> {
  children?: ReactNode;
}

export function Button(props: ButtonPropsType) {
  return (
    <Template>
      <ButtonComponent>{props.children}</ButtonComponent>
    </Template>
  )
}

export default Button;
