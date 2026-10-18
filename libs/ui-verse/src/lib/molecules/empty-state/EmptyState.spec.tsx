import { fireEvent } from '@testing-library/react';
import { renderWithTheme } from '../../utils/test/renderWithTheme';
import { expectNoA11yViolations } from '../../utils/test/a11y';
import { EmptyState, EmptyStateProps } from './EmptyState';

const setup = (props: Partial<EmptyStateProps> = {}) => renderWithTheme(<EmptyState title="No builds yet" {...props} />);

describe('EmptyState', () => {
  describe('content', () => {
    it('shows the title as a heading', () => {
      const { getByRole } = setup();
      expect(getByRole('heading', { level: 4, name: 'No builds yet' })).toBeTruthy();
    });

    it('shows the description when given', () => {
      const { getByText } = setup({ description: 'Run Chromatic once.' });
      expect(getByText('Run Chromatic once.')).toBeTruthy();
    });

    it('omits the description when not given', () => {
      const { container } = setup();
      expect(container.querySelectorAll('p')).toHaveLength(0);
    });

    it('hides the decorative icon from assistive tech', () => {
      const { container } = setup();
      expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('action', () => {
    it('has no button without an action label', () => {
      const { queryByRole } = setup({ onAction: jest.fn() });
      expect(queryByRole('button')).toBeNull();
    });

    it('shows a button with the label', () => {
      const { getByRole } = setup({ actionLabel: 'Copy the command' });
      expect(getByRole('button', { name: 'Copy the command' })).toBeTruthy();
    });

    it('calls onAction once per press', () => {
      const onAction = jest.fn();
      const { getByRole } = setup({ actionLabel: 'Go', onAction });
      fireEvent.click(getByRole('button', { name: 'Go' }));
      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('does not throw without onAction', () => {
      const { getByRole } = setup({ actionLabel: 'Go' });
      expect(() => fireEvent.click(getByRole('button', { name: 'Go' }))).not.toThrow();
    });
  });

  describe('tone', () => {
    it('renders the error tone with the same content', () => {
      const { getByRole } = setup({ tone: 'error', title: 'Could not load', actionLabel: 'Try again' });
      expect(getByRole('heading', { name: 'Could not load' })).toBeTruthy();
      expect(getByRole('button', { name: 'Try again' })).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it.each([
      ['title only', {}],
      ['with description', { description: 'Run Chromatic once.' }],
      ['with action', { description: 'x', actionLabel: 'Go', onAction: jest.fn() }],
      ['error tone', { tone: 'error' as const, title: 'Could not load', actionLabel: 'Try again' }],
    ])('has no axe violations (%s)', async (_n, props) => {
      const { container } = setup(props);
      await expectNoA11yViolations(container);
    });
  });
});
