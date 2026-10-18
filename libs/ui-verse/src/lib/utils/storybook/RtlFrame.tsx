import { DirectionProvider } from '@mantine/core';
import type { ReactNode } from 'react';

/**
 * Renders its children right-to-left regardless of the toolbar, so a story can test RTL
 * behaviour itself (keyboard, clearing, focus) and not only photograph it.
 */
export function RtlFrame({ children }: { children: ReactNode }) {
  return (
    <DirectionProvider initialDirection="rtl" detectDirection={false}>
      <div dir="rtl">{children}</div>
    </DirectionProvider>
  );
}

/**
 * The direction an element actually lays out in. Browsers answer with the computed style;
 * jsdom has no stylesheet to inherit `dir` through, so fall back to the nearest `dir` attribute.
 */
export const directionOf = (element: Element) =>
  getComputedStyle(element).direction || element.closest('[dir]')?.getAttribute('dir') || 'ltr';
