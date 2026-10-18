import { fireEvent } from '@testing-library/react';
import { renderWithTheme } from '../../utils/test/renderWithTheme';
import { expectNoA11yViolations } from '../../utils/test/a11y';
import { StatusFilter, StatusFilterProps } from './StatusFilter';

const COUNTS = { all: 126, pending: 14, changed: 3, accepted: 98, denied: 1 };
const setup = (props: Partial<StatusFilterProps> = {}) => renderWithTheme(<StatusFilter {...props} />);
const checked = (el: HTMLElement) => (el as HTMLInputElement).checked;

describe('StatusFilter', () => {
  describe('structure', () => {
    it('is a named radio group', () => {
      const { getByRole } = setup();
      expect(getByRole('radiogroup', { name: 'Filter builds by status' })).toBeTruthy();
    });

    it('offers five statuses', () => {
      const { getAllByRole } = setup();
      expect(getAllByRole('radio')).toHaveLength(5);
    });

    it('starts on All', () => {
      const { getByRole } = setup();
      expect(checked(getByRole('radio', { name: 'All' }))).toBe(true);
    });

    it('can start on another status', () => {
      const { getByRole } = setup({ defaultValue: 'pending' });
      expect(checked(getByRole('radio', { name: 'Needs review' }))).toBe(true);
      expect(checked(getByRole('radio', { name: 'All' }))).toBe(false);
    });

    it('selects exactly one status at a time', () => {
      const { getAllByRole } = setup({ defaultValue: 'denied' });
      expect(getAllByRole('radio').filter((r) => checked(r))).toHaveLength(1);
    });
  });

  describe('counts', () => {
    it('puts the counts in the accessible names', () => {
      const { getByRole } = setup({ counts: COUNTS });
      expect(getByRole('radio', { name: 'Needs review 14' })).toBeTruthy();
      expect(getByRole('radio', { name: 'All 126' })).toBeTruthy();
    });

    it('shows zero as 0, not nothing', () => {
      const { getByRole } = setup({ counts: { denied: 0 } });
      expect(getByRole('radio', { name: 'Denied 0' })).toBeTruthy();
    });

    it('leaves names plain when there are no counts', () => {
      const { getByRole } = setup();
      expect(getByRole('radio', { name: 'Accepted' })).toBeTruthy();
    });

    it('only adds a count to the statuses that have one', () => {
      const { getByRole } = setup({ counts: { pending: 14 } });
      expect(getByRole('radio', { name: 'Needs review 14' })).toBeTruthy();
      expect(getByRole('radio', { name: 'Accepted' })).toBeTruthy();
    });
  });

  describe('actions', () => {
    it.each([
      ['Needs review', 'pending'],
      ['Changes found', 'changed'],
      ['Accepted', 'accepted'],
      ['Denied', 'denied'],
    ])('choosing "%s" reports "%s"', (name, value) => {
      const onChange = jest.fn();
      const { getByRole } = setup({ onChange });
      fireEvent.click(getByRole('radio', { name }));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(value);
    });

    it('moves the selection when uncontrolled', () => {
      const { getByRole } = setup();
      fireEvent.click(getByRole('radio', { name: 'Denied' }));
      expect(checked(getByRole('radio', { name: 'Denied' }))).toBe(true);
      expect(checked(getByRole('radio', { name: 'All' }))).toBe(false);
    });

    it('does not report when the chosen status is already selected', () => {
      const onChange = jest.fn();
      const { getByRole } = setup({ onChange, defaultValue: 'pending' });
      fireEvent.click(getByRole('radio', { name: 'Needs review' }));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('does not throw without onChange', () => {
      const { getByRole } = setup();
      expect(() => fireEvent.click(getByRole('radio', { name: 'Denied' }))).not.toThrow();
    });
  });

  describe('controlled', () => {
    it('follows the value prop', () => {
      const { getByRole, rerender } = setup({ value: 'all' });
      rerender(<StatusFilter value="accepted" />);
      expect(checked(getByRole('radio', { name: 'Accepted' }))).toBe(true);
    });

    it('stays on the controlled value until the parent changes it', () => {
      const { getByRole } = setup({ value: 'all', onChange: jest.fn() });
      fireEvent.click(getByRole('radio', { name: 'Denied' }));
      expect(checked(getByRole('radio', { name: 'All' }))).toBe(true);
    });
  });

  describe('accessibility', () => {
    it.each([
      ['plain', {}],
      ['with counts', { counts: COUNTS }],
      ['another status', { defaultValue: 'denied' as const, counts: COUNTS }],
    ])('has no axe violations (%s)', async (_n, props) => {
      const { container } = setup(props);
      await expectNoA11yViolations(container);
    });
  });
});
