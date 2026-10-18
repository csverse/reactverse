import { fireEvent } from '@testing-library/react';
import { renderWithTheme } from '../utils/test/renderWithTheme';
import { ReviewerAvatar, ReviewerStack } from './ReviewerAvatar';

describe('ReviewerAvatar', () => {
  it('falls back to initials without an image', () => {
    const { getByText } = renderWithTheme(<ReviewerAvatar name="Mei Lin" />);
    expect(getByText('ML')).toBeTruthy();
  });

  it('collapses extra reviewers into a +N tile', () => {
    const reviewers = ['A One', 'B Two', 'C Three', 'D Four', 'E Five'].map(
      (name) => ({ name })
    );
    const { getByText } = renderWithTheme(
      <ReviewerStack reviewers={reviewers} max={3} />
    );
    expect(getByText('+2')).toBeTruthy();
  });

  it('reports the reviewer name on click', () => {
    const onClick = jest.fn();
    const { getByRole } = renderWithTheme(
      <ReviewerAvatar name="Mei Lin" onClick={onClick} />
    );
    fireEvent.click(getByRole('button', { name: 'Mei Lin' }));
    expect(onClick).toHaveBeenCalledWith('Mei Lin');
  });
});
