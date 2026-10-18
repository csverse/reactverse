import { renderWithTheme } from '../utils/test/renderWithTheme';

import Button from './Button';

describe('Button', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithTheme(<Button />);
    expect(baseElement).toBeTruthy();
  });
});
