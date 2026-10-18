/**
 * True when the browser reports the focused element as keyboard-focused (`:focus-visible`).
 *
 * Mantine tooltips open on keyboard focus only (`visibleOnly`). Focus moved by script, which is
 * what jsdom and Chromatic's synthetic events do, is not reported that way, so the tooltip never
 * opens there. A real key press, as in the Storybook test-runner, is. Stories that depend on it
 * check this first and stop after the parts that are environment-independent.
 */
export const hasKeyboardFocus = (element: Element) => {
  try {
    return element.matches(':focus-visible');
  } catch {
    // jsdom does not know the selector.
    return false;
  }
};
