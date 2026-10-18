import { fireEvent } from '@testing-library/react';
import { renderWithTheme } from '../utils/test/renderWithTheme';
import { SettingToggle } from './SettingToggle';

describe('SettingToggle', () => {
  it('reports the new checked state', () => {
    const onChange = jest.fn();
    const { getByRole } = renderWithTheme(
      <SettingToggle label="TurboSnap" onChange={onChange} />
    );
    fireEvent.click(getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('renders a switch role for kind=switch', () => {
    const { getByRole } = renderWithTheme(
      <SettingToggle kind="switch" label="TurboSnap" />
    );
    expect(getByRole('switch')).toBeTruthy();
  });

  it('disables the underlying input', () => {
    // jsdom still dispatches synthetic clicks to disabled inputs, so assert the
    // attribute browsers use to block interaction rather than the click.
    const { getByRole } = renderWithTheme(
      <SettingToggle label="TurboSnap" disabled />
    );
    expect((getByRole('checkbox') as HTMLInputElement).disabled).toBe(true);
  });
});
