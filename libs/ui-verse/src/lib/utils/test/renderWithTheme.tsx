import { MantineProvider } from '@mantine/core';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';

const withTheme = (ui: ReactElement) => <MantineProvider>{ui}</MantineProvider>;

/** Like RTL's render, but `rerender` keeps the Mantine provider around the tree. */
export const renderWithTheme = (ui: ReactElement) => {
  const utils = render(withTheme(ui));
  return {
    ...utils,
    rerender: (next: ReactElement) => utils.rerender(withTheme(next)),
  };
};

/** Text a person would read. MantineProvider injects <style> tags, which `textContent` would include. */
export const visibleText = (el: Element) => {
  const copy = el.cloneNode(true) as Element;
  copy.querySelectorAll('style').forEach((s) => s.remove());
  return copy.textContent ?? '';
};
