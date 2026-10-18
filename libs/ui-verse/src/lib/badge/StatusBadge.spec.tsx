import { fireEvent } from '@testing-library/react';
import { renderWithTheme } from '../utils/test/renderWithTheme';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('shows the default label for a status', () => {
    const { getByText } = renderWithTheme(<StatusBadge status="denied" />);
    expect(getByText('Denied')).toBeTruthy();
  });

  it('prefers a custom label and renders the count', () => {
    const { getByText, queryByText } = renderWithTheme(
      <StatusBadge status="changed" label="Visual diffs" count={4} />
    );
    expect(getByText('Visual diffs')).toBeTruthy();
    expect(getByText('4')).toBeTruthy();
    expect(queryByText('Changes found')).toBeNull();
  });

  it('is a button that reports its status only when onClick is given', () => {
    const onClick = jest.fn();
    const { getByRole, queryByRole, rerender } = renderWithTheme(
      <StatusBadge status="denied" />
    );
    expect(queryByRole('button')).toBeNull();
    rerender(<StatusBadge status="denied" onClick={onClick} />);
    fireEvent.click(getByRole('button', { name: 'Denied' }));
    expect(onClick).toHaveBeenCalledWith('denied');
  });
});
