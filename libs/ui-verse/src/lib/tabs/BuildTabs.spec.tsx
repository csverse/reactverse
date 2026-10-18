import { fireEvent } from '@testing-library/react';
import { renderWithTheme } from '../utils/test/renderWithTheme';
import { BuildTabs } from './BuildTabs';

const tabs = [
  { value: 'a', label: 'Builds', count: 3, content: 'Builds panel' },
  { value: 'b', label: 'Snapshots', content: 'Snapshots panel' },
];

describe('BuildTabs', () => {
  it('shows the first panel by default', () => {
    const { getByText } = renderWithTheme(<BuildTabs tabs={tabs} />);
    expect(getByText('Builds panel')).toBeTruthy();
  });

  it('switches panels and reports the change', () => {
    const onChange = jest.fn();
    const { getByRole, getByText } = renderWithTheme(
      <BuildTabs tabs={tabs} onChange={onChange} />
    );
    fireEvent.click(getByRole('tab', { name: 'Snapshots' }));
    expect(onChange).toHaveBeenCalledWith('b');
    expect(getByText('Snapshots panel')).toBeTruthy();
  });
});
