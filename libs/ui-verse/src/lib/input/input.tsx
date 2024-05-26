import React, { ReactNode } from 'react';
import styles from './input.module.scss';
import {
  ElementProps,
  Input as InputComponent,
  InputProps,
} from '@mantine/core';

/* eslint-disable-next-line */
export interface InputPropsType
  extends InputProps,
    ElementProps<'input', keyof InputProps> {
  children?: ReactNode;
}

export const Input: React.FC<InputPropsType> = (props) => {
  return <InputComponent {...props}>{props.children}</InputComponent>;
};

export default Input;
