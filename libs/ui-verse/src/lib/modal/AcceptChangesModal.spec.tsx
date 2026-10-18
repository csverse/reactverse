import { fireEvent } from '@testing-library/react';
import { renderWithTheme } from '../utils/test/renderWithTheme';
import { AcceptChangesModal } from './AcceptChangesModal';

const setup = (props: Partial<React.ComponentProps<typeof AcceptChangesModal>> = {}) => {
  const onConfirm = jest.fn();
  const onClose = jest.fn();
  const utils = renderWithTheme(
    <AcceptChangesModal
      opened
      changeCount={3}
      transitionDuration={0}
      onConfirm={onConfirm}
      onClose={onClose}
      {...props}
    />
  );
  return { ...utils, onConfirm, onClose };
};

describe('AcceptChangesModal', () => {
  it('pluralises the title', () => {
    const { getByText, rerender } = setup();
    expect(getByText('Accept 3 changes?')).toBeTruthy();
    void rerender;
  });

  it('confirms and closes through their buttons', () => {
    const { getByText, onConfirm, onClose } = setup();
    fireEvent.click(getByText('Accept all'));
    fireEvent.click(getByText('Keep reviewing'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when closed', () => {
    const { queryByRole } = setup({ opened: false });
    expect(queryByRole('dialog')).toBeNull();
  });
});
