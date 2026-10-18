import { fireEvent } from '@testing-library/react';
import { renderWithTheme } from '../utils/test/renderWithTheme';
import { BrowserMatrix } from './BrowserMatrix';

const results = [
  { browser: 'Chrome', version: '125', status: 'accepted' as const, snapshots: 10 },
  { browser: 'Safari', version: '17', status: 'changed' as const, snapshots: 10, notes: 'Two diffs.' },
];

describe('BrowserMatrix', () => {
  it('lists every browser', () => {
    const { getByText } = renderWithTheme(
      <BrowserMatrix results={results} transitionDuration={0} />
    );
    expect(getByText('Chrome')).toBeTruthy();
    expect(getByText('Safari')).toBeTruthy();
  });

  it('toggles aria-expanded when a row is clicked', () => {
    const { getByRole } = renderWithTheme(
      <BrowserMatrix results={results} transitionDuration={0} />
    );
    const control = getByRole('button', { name: /Safari/ });
    expect(control.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(control);
    expect(control.getAttribute('aria-expanded')).toBe('true');
  });

  it('reports which panels are open', () => {
    const onChange = jest.fn();
    const { getByRole } = renderWithTheme(
      <BrowserMatrix results={results} transitionDuration={0} onChange={onChange} />
    );
    fireEvent.click(getByRole('button', { name: /Chrome/ }));
    expect(onChange).toHaveBeenCalledWith(['Chrome']);
  });
});
