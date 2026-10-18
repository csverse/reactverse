import { fireEvent } from '@testing-library/react';
import { renderWithTheme } from '../utils/test/renderWithTheme';
import { BaselineAlert } from './BaselineAlert';

describe('BaselineAlert', () => {
  it('uses role=alert for errors and status otherwise', () => {
    const { getByRole, rerender } = renderWithTheme(
      <BaselineAlert tone="error" title="Build failed" />
    );
    expect(getByRole('alert')).toBeTruthy();
    rerender(<BaselineAlert tone="info" title="Heads up" />);
  });

  it('only shows a close button when onClose is given', () => {
    const onClose = jest.fn();
    const { getByLabelText, queryByLabelText, rerender } = renderWithTheme(
      <BaselineAlert title="Hello" />
    );
    expect(queryByLabelText('Dismiss message')).toBeNull();
    rerender(<BaselineAlert title="Hello" onClose={onClose} />);
    fireEvent.click(getByLabelText('Dismiss message'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
