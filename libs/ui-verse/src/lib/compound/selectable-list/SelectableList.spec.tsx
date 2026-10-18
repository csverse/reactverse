import { fireEvent, render } from '@testing-library/react';
import { renderWithTheme } from '../../utils/test/renderWithTheme';
import { expectNoA11yViolations } from '../../utils/test/a11y';
import { SelectableList } from './SelectableList';

type Props = Partial<React.ComponentProps<typeof SelectableList>>;

const list = (props: Props = {}) => (
  <SelectableList ids={['a', 'b', 'c']} label="Changed stories" {...props}>
    <SelectableList.SelectAll />
    <SelectableList.Summary />
    <SelectableList.Item id="a" label="Alpha" description="First" />
    <SelectableList.Item id="b" label="Beta" />
    <SelectableList.Item id="c" label="Gamma" />
  </SelectableList>
);
const setup = (props: Props = {}) => renderWithTheme(list(props));
type R = ReturnType<typeof setup>;
const box = (r: R, name: string) => r.getByRole('checkbox', { name }) as HTMLInputElement;

describe('SelectableList', () => {
  describe('structure', () => {
    it('is a named group', () => {
      const { getByRole } = setup();
      expect(getByRole('group', { name: 'Changed stories' })).toBeTruthy();
    });

    it('has Select all and one checkbox per item', () => {
      const { getAllByRole } = setup();
      expect(getAllByRole('checkbox')).toHaveLength(4);
    });

    it('starts with nothing selected', () => {
      const r = setup();
      expect(box(r, 'Select all').checked).toBe(false);
      expect(r.getByText('0 of 3 selected')).toBeTruthy();
    });

    it('starts with the default selection', () => {
      const r = setup({ defaultSelected: ['a', 'c'] });
      expect(box(r, 'Alpha').checked).toBe(true);
      expect(box(r, 'Beta').checked).toBe(false);
      expect(r.getByText('2 of 3 selected')).toBeTruthy();
    });

    it('announces the summary politely', () => {
      const { getByText } = setup();
      expect(getByText('0 of 3 selected').getAttribute('aria-live')).toBe('polite');
    });

    it('shows an item description', () => {
      const { getByText } = setup();
      expect(getByText('First')).toBeTruthy();
    });
  });

  describe('items', () => {
    it('toggles one item and reports the selection', () => {
      const onSelectionChange = jest.fn();
      const r = setup({ onSelectionChange });
      fireEvent.click(box(r, 'Beta'));
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenCalledWith(['b']);
      expect(box(r, 'Beta').checked).toBe(true);
    });

    it('unticks an item', () => {
      const onSelectionChange = jest.fn();
      const r = setup({ onSelectionChange, defaultSelected: ['a', 'b'] });
      fireEvent.click(box(r, 'Alpha'));
      expect(onSelectionChange).toHaveBeenLastCalledWith(['b']);
    });

    it('reports in list order, whatever order they were picked in', () => {
      const onSelectionChange = jest.fn();
      const r = setup({ onSelectionChange });
      fireEvent.click(box(r, 'Gamma'));
      fireEvent.click(box(r, 'Alpha'));
      expect(onSelectionChange).toHaveBeenLastCalledWith(['a', 'c']);
    });

    it('updates the summary', () => {
      const r = setup();
      fireEvent.click(box(r, 'Alpha'));
      fireEvent.click(box(r, 'Beta'));
      expect(r.getByText('2 of 3 selected')).toBeTruthy();
    });

    it('does not throw without onSelectionChange', () => {
      const r = setup();
      expect(() => fireEvent.click(box(r, 'Alpha'))).not.toThrow();
    });
  });

  describe('Select all', () => {
    it('selects everything and reports every id', () => {
      const onSelectionChange = jest.fn();
      const r = setup({ onSelectionChange });
      fireEvent.click(box(r, 'Select all'));
      expect(onSelectionChange).toHaveBeenLastCalledWith(['a', 'b', 'c']);
      expect(r.getByText('3 of 3 selected')).toBeTruthy();
    });

    it('clears everything when everything is selected', () => {
      const onSelectionChange = jest.fn();
      const r = setup({ onSelectionChange, defaultSelected: ['a', 'b', 'c'] });
      fireEvent.click(box(r, 'Select all'));
      expect(onSelectionChange).toHaveBeenLastCalledWith([]);
    });

    it('selects the rest when only some are selected', () => {
      const onSelectionChange = jest.fn();
      const r = setup({ onSelectionChange, defaultSelected: ['a'] });
      fireEvent.click(box(r, 'Select all'));
      expect(onSelectionChange).toHaveBeenLastCalledWith(['a', 'b', 'c']);
    });

    it('is checked only when every item is', () => {
      const r = setup({ defaultSelected: ['a', 'b', 'c'] });
      expect(box(r, 'Select all').checked).toBe(true);
    });

    it('shows the in-between state for a partial selection, using the native property', () => {
      const r = setup({ defaultSelected: ['a'] });
      expect(box(r, 'Select all').indeterminate).toBe(true);
      expect(box(r, 'Select all').checked).toBe(false);
    });

    it('is not in-between when none or all are selected', () => {
      const none = setup();
      expect(box(none, 'Select all').indeterminate).toBe(false);
      none.unmount();
      const all = setup({ defaultSelected: ['a', 'b', 'c'] });
      expect(box(all, 'Select all').indeterminate).toBe(false);
    });

    it('follows individual changes', () => {
      const r = setup();
      fireEvent.click(box(r, 'Alpha'));
      expect(box(r, 'Select all').indeterminate).toBe(true);
      fireEvent.click(box(r, 'Beta'));
      fireEvent.click(box(r, 'Gamma'));
      expect(box(r, 'Select all').checked).toBe(true);
    });
  });

  describe('locked items', () => {
    it('cannot be changed', () => {
      const onSelectionChange = jest.fn();
      const r = setup({ onSelectionChange, disabledIds: ['b'] });
      expect(box(r, 'Beta').disabled).toBe(true);
      fireEvent.click(box(r, 'Beta'));
      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it('are skipped by Select all', () => {
      const onSelectionChange = jest.fn();
      const r = setup({ onSelectionChange, disabledIds: ['b'] });
      fireEvent.click(box(r, 'Select all'));
      expect(onSelectionChange).toHaveBeenLastCalledWith(['a', 'c']);
      expect(box(r, 'Select all').checked).toBe(true);
    });

    it('stay selected when Select all clears the rest', () => {
      const onSelectionChange = jest.fn();
      const r = setup({ onSelectionChange, disabledIds: ['b'], defaultSelected: ['a', 'b', 'c'] });
      fireEvent.click(box(r, 'Select all'));
      expect(onSelectionChange).toHaveBeenLastCalledWith(['b']);
    });

    it('disable Select all when every item is locked', () => {
      const r = setup({ disabledIds: ['a', 'b', 'c'] });
      expect(box(r, 'Select all').disabled).toBe(true);
    });
  });

  describe('composition', () => {
    it.each([
      ['SelectAll', () => <SelectableList.SelectAll />],
      ['Summary', () => <SelectableList.Summary />],
      ['Item', () => <SelectableList.Item id="a" label="A" />],
    ])('refuses to render %s outside its parent', (_name, part) => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      expect(() => render(part())).toThrow(/inside <SelectableList>/);
      spy.mockRestore();
    });
  });

  describe('accessibility', () => {
    it.each([
      ['none selected', {}],
      ['some selected', { defaultSelected: ['a'] }],
      ['all selected', { defaultSelected: ['a', 'b', 'c'] }],
      ['with a locked item', { disabledIds: ['b'], defaultSelected: ['b'] }],
    ])('has no axe violations (%s)', async (_n, props) => {
      const { container } = setup(props);
      await expectNoA11yViolations(container);
    });
  });
});
