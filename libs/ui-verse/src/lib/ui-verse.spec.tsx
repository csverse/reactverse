import { render } from '@testing-library/react';

import UiVerse from './ui-verse';

describe('UiVerse', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UiVerse />);
    expect(baseElement).toBeTruthy();
  });
});
