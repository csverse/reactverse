import React, { ReactNode } from 'react';
import styles from './input.module.scss';
import {
  ButtonProps,
  ElementProps,
  Input as InputComponent,
  InputProps,
} from '@mantine/core';

/* eslint-disable-next-line */
export interface InputPropsType
  extends InputProps,
    ElementProps<'input', keyof ButtonProps> {
  children?: ReactNode;
}

export const Input: React.FC<InputPropsType> = (props) => {
  return <InputComponent {...props}>{props.children}</InputComponent>;
};

export default Input;
