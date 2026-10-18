import { fireEvent } from '@testing-library/react';
import { renderWithTheme } from '../../utils/test/renderWithTheme';
import { expectNoA11yViolations } from '../../utils/test/a11y';
import { FilterTag, FilterTagProps } from './FilterTag';

const setup = (props: Partial<FilterTagProps> = {}) => renderWithTheme(<FilterTag label="Firefox" {...props} />);

describe('FilterTag', () => {
  describe('read-only', () => {
    it('shows the label', () => {
      const { getByText } = setup();
      expect(getByText('Firefox')).toBeTruthy();
    });

    it('has no button unless onRemove is given', () => {
      const { queryByRole } = setup();
      expect(queryByRole('button')).toBeNull();
    });
  });

  describe('removable', () => {
    it('names the remove button after the tag, so several tags are distinguishable', () => {
      const { getByRole } = setup({ onRemove: jest.fn() });
      expect(getByRole('button', { name: 'Remove filter Firefox' })).toBeTruthy();
    });

    it('reports the label when removed', () => {
      const onRemove = jest.fn();
      const { getByRole } = setup({ onRemove });
      fireEvent.click(getByRole('button', { name: 'Remove filter Firefox' }));
      expect(onRemove).toHaveBeenCalledTimes(1);
      expect(onRemove).toHaveBeenCalledWith('Firefox');
    });

    it('is reachable by keyboard', () => {
      const { getByRole } = setup({ onRemove: jest.fn() });
      expect(getByRole('button', { name: 'Remove filter Firefox' }).getAttribute('tabindex')).toBe('0');
    });

    it('is exposed to assistive tech, not hidden', () => {
      const { getByRole } = setup({ onRemove: jest.fn() });
      expect(getByRole('button', { name: 'Remove filter Firefox' }).getAttribute('aria-hidden')).not.toBe('true');
    });

    it('uses the new label after it changes', () => {
      const onRemove = jest.fn();
      const { getByRole, rerender } = setup({ onRemove });
      rerender(<FilterTag label="Safari" onRemove={onRemove} />);
      fireEvent.click(getByRole('button', { name: 'Remove filter Safari' }));
      expect(onRemove).toHaveBeenCalledWith('Safari');
    });
  });

  describe('disabled', () => {
    it('hides the remove button', () => {
      const { queryByRole } = setup({ onRemove: jest.fn(), disabled: true });
      expect(queryByRole('button')).toBeNull();
    });
  });

  describe('accessibility', () => {
    it.each([
      ['read-only', {}],
      ['removable', { onRemove: jest.fn() }],
      ['disabled', { onRemove: jest.fn(), disabled: true }],
      ['long label', { label: 'feature/redesign-checkout-flow-with-saved-payment-methods', onRemove: jest.fn() }],
    ])('has no axe violations (%s)', async (_n, props) => {
      const { container } = setup(props);
      await expectNoA11yViolations(container);
    });
  });
});
