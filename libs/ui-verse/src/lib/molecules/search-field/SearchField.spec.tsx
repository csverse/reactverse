import { fireEvent } from '@testing-library/react';
import { renderWithTheme } from '../../utils/test/renderWithTheme';
import { expectNoA11yViolations } from '../../utils/test/a11y';
import { SearchField, SearchFieldProps } from './SearchField';

const setup = (props: Partial<SearchFieldProps> = {}) => renderWithTheme(<SearchField {...props} />);
const box = (r: ReturnType<typeof setup>) => r.getByRole('searchbox') as HTMLInputElement;

describe('SearchField', () => {
  describe('naming', () => {
    it('is a searchbox named by its label, since it has no visible label', () => {
      const { getByRole } = setup();
      expect(getByRole('searchbox', { name: 'Search builds' })).toBeTruthy();
    });

    it('accepts a custom name and placeholder', () => {
      const { getByRole } = setup({ label: 'Search reviewers', placeholder: 'Name or email' });
      expect(getByRole('searchbox', { name: 'Search reviewers' }).getAttribute('placeholder')).toBe('Name or email');
    });

    it('starts with the default value', () => {
      expect(box(setup({ defaultValue: 'main' })).value).toBe('main');
    });
  });

  describe('typing', () => {
    it('reports each change with the full text', () => {
      const onChange = jest.fn();
      const r = setup({ onChange });
      fireEvent.change(box(r), { target: { value: 't' } });
      fireEvent.change(box(r), { target: { value: 'ta' } });
      expect(onChange).toHaveBeenNthCalledWith(1, 't');
      expect(onChange).toHaveBeenNthCalledWith(2, 'ta');
    });

    it('keeps the text it was given, including spaces', () => {
      const r = setup();
      fireEvent.change(box(r), { target: { value: ' tabs ' } });
      expect(box(r).value).toBe(' tabs ');
    });

    it('does not throw without callbacks', () => {
      const r = setup();
      expect(() => {
        fireEvent.change(box(r), { target: { value: 'x' } });
        fireEvent.keyDown(box(r), { key: 'Enter' });
      }).not.toThrow();
    });
  });

  describe('submitting', () => {
    it('submits the current text on Enter', () => {
      const onSubmit = jest.fn();
      const r = setup({ defaultValue: 'main', onSubmit });
      fireEvent.keyDown(box(r), { key: 'Enter' });
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith('main');
    });

    it('submits an empty string when the field is empty', () => {
      const onSubmit = jest.fn();
      const r = setup({ onSubmit });
      fireEvent.keyDown(box(r), { key: 'Enter' });
      expect(onSubmit).toHaveBeenCalledWith('');
    });

    it('does not submit on other keys', () => {
      const onSubmit = jest.fn();
      const r = setup({ defaultValue: 'main', onSubmit });
      ['a', 'Tab', 'ArrowDown', ' '].forEach((key) => fireEvent.keyDown(box(r), { key }));
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('keeps the text after submitting', () => {
      const r = setup({ defaultValue: 'main', onSubmit: jest.fn() });
      fireEvent.keyDown(box(r), { key: 'Enter' });
      expect(box(r).value).toBe('main');
    });
  });

  describe('clearing', () => {
    it('shows the clear button only when there is text', () => {
      const r = setup();
      expect(r.queryByRole('button', { name: 'Clear search' })).toBeNull();
      fireEvent.change(box(r), { target: { value: 'a' } });
      expect(r.getByRole('button', { name: 'Clear search' })).toBeTruthy();
    });

    it('empties the field, reports it and moves focus back to the field', () => {
      const onChange = jest.fn();
      const r = setup({ defaultValue: 'main', onChange });
      fireEvent.click(r.getByRole('button', { name: 'Clear search' }));
      expect(box(r).value).toBe('');
      expect(onChange).toHaveBeenLastCalledWith('');
      expect(document.activeElement).toBe(box(r));
    });

    it('clears with Escape', () => {
      const onChange = jest.fn();
      const r = setup({ defaultValue: 'main', onChange });
      fireEvent.keyDown(box(r), { key: 'Escape' });
      expect(box(r).value).toBe('');
      expect(onChange).toHaveBeenLastCalledWith('');
    });

    it('ignores Escape when already empty', () => {
      const onChange = jest.fn();
      const r = setup({ onChange });
      fireEvent.keyDown(box(r), { key: 'Escape' });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('disabled', () => {
    it('disables the field and offers no clear button', () => {
      const r = setup({ defaultValue: 'main', disabled: true });
      expect(box(r).disabled).toBe(true);
      expect(r.queryByRole('button', { name: 'Clear search' })).toBeNull();
    });
  });

  describe('accessibility', () => {
    it.each([
      ['empty', {}],
      ['with text', { defaultValue: 'feature/tabs' }],
      ['disabled', { defaultValue: 'main', disabled: true }],
      ['custom label', { label: 'Search reviewers' }],
    ])('has no axe violations (%s)', async (_n, props) => {
      const { container } = setup(props);
      await expectNoA11yViolations(container);
    });
  });
});
