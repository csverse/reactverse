import { action } from '@storybook/addon-actions';
import { jest } from '@storybook/jest';

/**
 * A callback that does two things at once:
 * - logs each call in the Actions panel, and
 * - is a jest mock, so `play` functions can assert on it (and each call
 *   shows up in the Interactions panel).
 */
export const spy = (name: string) => jest.fn(action(name));

/** Reset a spy's call history. Args are typed as plain callbacks, hence the cast. */
export const clear = (...fns: unknown[]) =>
  fns.forEach((fn) => (fn as ReturnType<typeof spy>).mockClear());
