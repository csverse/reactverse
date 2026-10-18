import { fireEvent } from '@testing-library/react';
import { renderWithTheme } from '../utils/test/renderWithTheme';
import { HintPopover, HintTooltip } from './Hint';

describe('Hint', () => {
  it('renders the tooltip label when forced open', () => {
    const { getByText } = renderWithTheme(
      <HintTooltip label="Ignored below 0.063" opened>
        diffThreshold
      </HintTooltip>
    );
    expect(getByText('Ignored below 0.063')).toBeTruthy();
  });

  it('keeps the target keyboard-focusable', () => {
    const { getByText } = renderWithTheme(
      <HintTooltip label="x">diffThreshold</HintTooltip>
    );
    expect(getByText('diffThreshold').getAttribute('tabindex')).toBe('0');
  });

  it('asks the parent to toggle the popover on click', () => {
    const onChange = jest.fn();
    const { getByRole } = renderWithTheme(
      <HintPopover trigger="What is a mode?" title="Modes" opened={false} onChange={onChange}>
        copy
      </HintPopover>
    );
    fireEvent.click(getByRole('button', { name: 'What is a mode?' }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('closes on Escape from the trigger, where focus stays', () => {
    const onChange = jest.fn();
    const { getByRole } = renderWithTheme(
      <HintPopover trigger="What is a mode?" title="Modes" opened onChange={onChange}>
        copy
      </HintPopover>
    );
    fireEvent.keyDown(getByRole('button', { name: 'What is a mode?' }), { key: 'Escape' });
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('ignores Escape when it is already closed', () => {
    const onChange = jest.fn();
    const { getByRole } = renderWithTheme(
      <HintPopover trigger="What is a mode?" title="Modes" opened={false} onChange={onChange}>
        copy
      </HintPopover>
    );
    fireEvent.keyDown(getByRole('button', { name: 'What is a mode?' }), { key: 'Escape' });
    expect(onChange).not.toHaveBeenCalled();
  });
});
