import { ElementProps, ImageProps, Image as ImageComponent } from '@mantine/core';
import styles from './image.module.scss';
import { ReactNode } from 'react';

/* eslint-disable-next-line */
export interface ImagePropsType extends ImageProps, ElementProps<'img', keyof ImageProps> {
  children?: ReactNode
}

export function Image(props: ImagePropsType) {
  return (
    <ImageComponent {...props} />
  );
}

export default Image;
