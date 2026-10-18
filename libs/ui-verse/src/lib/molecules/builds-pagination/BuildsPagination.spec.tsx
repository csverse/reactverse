import { fireEvent } from '@testing-library/react';
import { renderWithTheme } from '../../utils/test/renderWithTheme';
import { expectNoA11yViolations } from '../../utils/test/a11y';
import { BuildsPagination, BuildsPaginationProps, rangeText } from './BuildsPagination';

const setup = (props: Partial<BuildsPaginationProps> = {}) => renderWithTheme(<BuildsPagination totalItems={482} {...props} />);

describe('rangeText', () => {
  it.each([
    [1, 20, 482, 'Showing 1–20 of 482 builds'],
    [2, 20, 482, 'Showing 21–40 of 482 builds'],
    [25, 20, 482, 'Showing 481–482 of 482 builds'],
    [1, 20, 12, 'Showing 1–12 of 12 builds'],
    [1, 20, 1, 'Showing 1–1 of 1 builds'],
    [1, 20, 0, 'No builds'],
    [3, 50, 482, 'Showing 101–150 of 482 builds'],
    [1, 20, 20, 'Showing 1–20 of 20 builds'],
  ])('page %i of size %i over %i is "%s"', (page, size, total, text) => {
    expect(rangeText(page, size, total)).toBe(text);
  });
});

describe('BuildsPagination', () => {
  describe('range text', () => {
    it('describes the first page', () => {
      const { getByText } = setup();
      expect(getByText('Showing 1–20 of 482 builds')).toBeTruthy();
    });

    it('is a polite live region so a page change is announced', () => {
      const { getByText } = setup();
      expect(getByText('Showing 1–20 of 482 builds').getAttribute('aria-live')).toBe('polite');
    });

    it('respects a custom page size', () => {
      const { getByText } = setup({ pageSize: 50 });
      expect(getByText('Showing 1–50 of 482 builds')).toBeTruthy();
    });

    it('starts on the given page', () => {
      const { getByText } = setup({ defaultPage: 3 });
      expect(getByText('Showing 41–60 of 482 builds')).toBeTruthy();
    });

    it('clamps a start page that is past the end', () => {
      const { getByText } = setup({ defaultPage: 999 });
      expect(getByText('Showing 481–482 of 482 builds')).toBeTruthy();
    });
  });

  describe('controls', () => {
    it('is hidden when everything fits on one page', () => {
      const { queryByRole } = setup({ totalItems: 12 });
      expect(queryByRole('navigation')).toBeNull();
    });

    it('is hidden when there are no builds', () => {
      const { queryByRole, getByText } = setup({ totalItems: 0 });
      expect(queryByRole('navigation')).toBeNull();
      expect(getByText('No builds')).toBeTruthy();
    });

    it('is a named navigation landmark', () => {
      const { getByRole } = setup();
      expect(getByRole('navigation', { name: 'Builds pagination' })).toBeTruthy();
    });

    it('names every control', () => {
      const { getByRole } = setup({ defaultPage: 5 });
      ['First page', 'Previous page', 'Next page', 'Last page'].forEach((name) => expect(getByRole('button', { name })).toBeTruthy());
    });

    it('names page buttons by number and marks the current one', () => {
      const { getByRole } = setup({ defaultPage: 3 });
      expect(getByRole('button', { name: 'Page 3' }).getAttribute('aria-current')).toBe('page');
      expect(getByRole('button', { name: 'Page 2' }).getAttribute('aria-current')).toBeNull();
    });

    it('disables previous and first on the first page', () => {
      const { getByRole } = setup();
      expect((getByRole('button', { name: 'Previous page' }) as HTMLButtonElement).disabled).toBe(true);
      expect((getByRole('button', { name: 'First page' }) as HTMLButtonElement).disabled).toBe(true);
    });

    it('disables next and last on the last page', () => {
      const { getByRole } = setup({ defaultPage: 25 });
      expect((getByRole('button', { name: 'Next page' }) as HTMLButtonElement).disabled).toBe(true);
      expect((getByRole('button', { name: 'Last page' }) as HTMLButtonElement).disabled).toBe(true);
    });
  });

  describe('actions', () => {
    it('moves forward and reports the page', () => {
      const onChange = jest.fn();
      const { getByRole, getByText } = setup({ onChange });
      fireEvent.click(getByRole('button', { name: 'Next page' }));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(2);
      expect(getByText('Showing 21–40 of 482 builds')).toBeTruthy();
    });

    it('moves back', () => {
      const onChange = jest.fn();
      const { getByRole } = setup({ onChange, defaultPage: 4 });
      fireEvent.click(getByRole('button', { name: 'Previous page' }));
      expect(onChange).toHaveBeenCalledWith(3);
    });

    it('jumps to a numbered page', () => {
      const onChange = jest.fn();
      const { getByRole } = setup({ onChange });
      fireEvent.click(getByRole('button', { name: 'Page 3' }));
      expect(onChange).toHaveBeenCalledWith(3);
      expect(getByRole('button', { name: 'Page 3' }).getAttribute('aria-current')).toBe('page');
    });

    it('jumps to the last page', () => {
      const onChange = jest.fn();
      const { getByRole, getByText } = setup({ onChange });
      fireEvent.click(getByRole('button', { name: 'Last page' }));
      expect(onChange).toHaveBeenCalledWith(25);
      expect(getByText('Showing 481–482 of 482 builds')).toBeTruthy();
    });

    it('jumps to the first page', () => {
      const onChange = jest.fn();
      const { getByRole } = setup({ onChange, defaultPage: 10 });
      fireEvent.click(getByRole('button', { name: 'First page' }));
      expect(onChange).toHaveBeenCalledWith(1);
    });

    it('does not throw without onChange', () => {
      const { getByRole } = setup();
      expect(() => fireEvent.click(getByRole('button', { name: 'Next page' }))).not.toThrow();
    });
  });

  describe('accessibility', () => {
    it.each([
      ['first page', {}],
      ['middle page', { defaultPage: 12 }],
      ['last page', { defaultPage: 25 }],
      ['single page', { totalItems: 12 }],
      ['empty', { totalItems: 0 }],
    ])('has no axe violations (%s)', async (_n, props) => {
      const { container } = setup(props);
      await expectNoA11yViolations(container);
    });
  });
});
