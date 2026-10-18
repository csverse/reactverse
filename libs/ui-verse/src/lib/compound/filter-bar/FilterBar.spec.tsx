import { fireEvent, render } from '@testing-library/react';
import { renderWithTheme } from '../../utils/test/renderWithTheme';
import { expectNoA11yViolations } from '../../utils/test/a11y';
import { FilterBar } from './FilterBar';

type Props = Partial<React.ComponentProps<typeof FilterBar>>;

const bar = (props: Props = {}) => (
  <FilterBar {...props}>
    <FilterBar.Search />
    <FilterBar.Status counts={{ all: 126, pending: 14 }} />
    <FilterBar.Tags />
    <FilterBar.Reset />
  </FilterBar>
);
const setup = (props: Props = {}) => renderWithTheme(bar(props));
type R = ReturnType<typeof setup>;
const search = (r: R) => r.getByRole('searchbox') as HTMLInputElement;
const checked = (r: R, name: string | RegExp) => (r.getByRole('radio', { name }) as HTMLInputElement).checked;

describe('FilterBar', () => {
  describe('structure', () => {
    it('is a search landmark with a name', () => {
      const { getByRole } = setup();
      expect(getByRole('search', { name: 'Filter builds' })).toBeTruthy();
    });

    it('starts with no filters: empty search, All selected, no tags, nothing to clear', () => {
      const r = setup();
      expect(search(r).value).toBe('');
      expect(checked(r, /^All/)).toBe(true);
      expect(r.queryByRole('list', { name: 'Active filters' })).toBeNull();
      expect(r.queryByRole('button', { name: 'Clear all filters' })).toBeNull();
    });

    it('starts from the default filters', () => {
      const r = setup({ defaultFilters: { query: 'tabs', status: 'pending', tags: ['Firefox'] } });
      expect(search(r).value).toBe('tabs');
      expect(checked(r, /Needs review/)).toBe(true);
      expect(r.getByText('Firefox')).toBeTruthy();
    });

    it('works with only some parts', () => {
      const { getByRole, queryByRole } = renderWithTheme(
        <FilterBar>
          <FilterBar.Search />
        </FilterBar>
      );
      expect(getByRole('searchbox')).toBeTruthy();
      expect(queryByRole('radiogroup')).toBeNull();
    });
  });

  describe('reporting', () => {
    it('reports the complete state when the query changes', () => {
      const onChange = jest.fn();
      const r = setup({ onChange });
      fireEvent.change(search(r), { target: { value: 'tabs' } });
      expect(onChange).toHaveBeenLastCalledWith({ query: 'tabs', status: 'all', tags: [] });
    });

    it('reports the complete state when the status changes', () => {
      const onChange = jest.fn();
      const r = setup({ onChange });
      fireEvent.click(r.getByRole('radio', { name: /Needs review/ }));
      expect(onChange).toHaveBeenLastCalledWith({ query: '', status: 'pending', tags: [] });
    });

    it('keeps the other filters when one changes', () => {
      const onChange = jest.fn();
      const r = setup({ onChange, defaultFilters: { status: 'pending', tags: ['Safari'] } });
      fireEvent.change(search(r), { target: { value: 'x' } });
      expect(onChange).toHaveBeenLastCalledWith({ query: 'x', status: 'pending', tags: ['Safari'] });
    });

    it('reports once per change', () => {
      const onChange = jest.fn();
      const r = setup({ onChange });
      fireEvent.change(search(r), { target: { value: 'a' } });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('does not throw without onChange', () => {
      const r = setup();
      expect(() => fireEvent.change(search(r), { target: { value: 'a' } })).not.toThrow();
    });
  });

  describe('tags', () => {
    it('lists active tags as a named list', () => {
      const { getByRole, getAllByRole } = setup({ defaultFilters: { tags: ['Firefox', 'Safari'] } });
      expect(getByRole('list', { name: 'Active filters' })).toBeTruthy();
      expect(getAllByRole('listitem')).toHaveLength(2);
    });

    it('removes one tag and keeps the rest', () => {
      const onChange = jest.fn();
      const r = setup({ onChange, defaultFilters: { tags: ['Firefox', 'Safari'] } });
      fireEvent.click(r.getByRole('button', { name: 'Remove filter Firefox' }));
      expect(onChange).toHaveBeenLastCalledWith({ query: '', status: 'all', tags: ['Safari'] });
      expect(r.queryByText('Firefox')).toBeNull();
    });

    it('hides the list when the last tag is removed', () => {
      const r = setup({ defaultFilters: { tags: ['Firefox'] } });
      fireEvent.click(r.getByRole('button', { name: 'Remove filter Firefox' }));
      expect(r.queryByRole('list', { name: 'Active filters' })).toBeNull();
    });
  });

  describe('clearing', () => {
    it.each([
      ['a query', { query: 'tabs' }],
      ['a status', { status: 'denied' as const }],
      ['a tag', { tags: ['Firefox'] }],
    ])('offers Clear all filters when there is %s', (_n, defaultFilters) => {
      const r = setup({ defaultFilters });
      expect(r.getByRole('button', { name: 'Clear all filters' })).toBeTruthy();
    });

    it('resets everything and reports the empty state', () => {
      const onChange = jest.fn();
      const r = setup({ onChange, defaultFilters: { query: 'tabs', status: 'pending', tags: ['Firefox'] } });
      fireEvent.click(r.getByRole('button', { name: 'Clear all filters' }));
      expect(onChange).toHaveBeenLastCalledWith({ query: '', status: 'all', tags: [] });
    });

    it('empties the text in the search box too', () => {
      const r = setup({ defaultFilters: { query: 'tabs' } });
      fireEvent.click(r.getByRole('button', { name: 'Clear all filters' }));
      expect(search(r).value).toBe('');
    });

    it('returns the status to All and removes the tags', () => {
      const r = setup({ defaultFilters: { status: 'denied', tags: ['Firefox'] } });
      fireEvent.click(r.getByRole('button', { name: 'Clear all filters' }));
      expect(checked(r, /^All/)).toBe(true);
      expect(r.queryByText('Firefox')).toBeNull();
    });

    it('disappears once there is nothing to clear', () => {
      const r = setup({ defaultFilters: { query: 'tabs' } });
      fireEvent.click(r.getByRole('button', { name: 'Clear all filters' }));
      expect(r.queryByRole('button', { name: 'Clear all filters' })).toBeNull();
    });

    it('lets the user filter again after clearing', () => {
      const onChange = jest.fn();
      const r = setup({ onChange, defaultFilters: { query: 'tabs' } });
      fireEvent.click(r.getByRole('button', { name: 'Clear all filters' }));
      fireEvent.change(search(r), { target: { value: 'modal' } });
      expect(onChange).toHaveBeenLastCalledWith({ query: 'modal', status: 'all', tags: [] });
    });
  });

  describe('composition', () => {
    it.each([
      ['Search', () => <FilterBar.Search />],
      ['Status', () => <FilterBar.Status />],
      ['Tags', () => <FilterBar.Tags />],
      ['Reset', () => <FilterBar.Reset />],
    ])('refuses to render %s outside its parent', (_name, part) => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      expect(() => render(part())).toThrow(/inside <FilterBar>/);
      spy.mockRestore();
    });
  });

  describe('accessibility', () => {
    it.each([
      ['no filters', {}],
      ['active filters', { defaultFilters: { query: 'tabs', status: 'pending' as const, tags: ['Firefox', 'dark mode'] } }],
    ])('has no axe violations (%s)', async (_n, props) => {
      const { container } = setup(props);
      await expectNoA11yViolations(container);
    });
  });
});
