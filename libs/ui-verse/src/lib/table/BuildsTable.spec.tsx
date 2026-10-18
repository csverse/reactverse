import { fireEvent } from '@testing-library/react';
import { renderWithTheme } from '../utils/test/renderWithTheme';
import { BuildsTable } from './BuildsTable';
import { SAMPLE_BUILDS, formatDuration } from './builds.data';

const buildNumbers = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('tbody tr td:first-child')).map(
    (td) => td.textContent
  );

describe('BuildsTable', () => {
  it('sorts by build number descending by default', () => {
    const { container } = renderWithTheme(<BuildsTable builds={SAMPLE_BUILDS} />);
    expect(buildNumbers(container)[0]).toBe('#482');
  });

  it('flips direction when the active header is clicked again', () => {
    const { container, getByRole } = renderWithTheme(
      <BuildsTable builds={SAMPLE_BUILDS} />
    );
    fireEvent.click(getByRole('button', { name: /Build/ }));
    expect(buildNumbers(container)[0]).toBe('#477');
  });

  it('reports sort changes', () => {
    const onSortChange = jest.fn();
    const { getByRole } = renderWithTheme(
      <BuildsTable builds={SAMPLE_BUILDS} onSortChange={onSortChange} />
    );
    fireEvent.click(getByRole('button', { name: /Branch/ }));
    expect(onSortChange).toHaveBeenCalledWith({ key: 'branch', dir: 'asc' });
  });

  it('shows an empty state', () => {
    const { getByText } = renderWithTheme(<BuildsTable builds={[]} />);
    expect(getByText(/No builds yet/)).toBeTruthy();
  });

  it('hides rows while loading', () => {
    const { queryByText } = renderWithTheme(
      <BuildsTable builds={SAMPLE_BUILDS} loading />
    );
    expect(queryByText('#482')).toBeNull();
  });

  it('formats durations', () => {
    expect(formatDuration(31)).toBe('31s');
    expect(formatDuration(214)).toBe('3m 34s');
  });
});
