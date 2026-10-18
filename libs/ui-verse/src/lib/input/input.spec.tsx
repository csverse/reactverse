import { renderWithTheme } from '../utils/test/renderWithTheme';

import Input from './input';

describe('Input', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithTheme(<Input />);
    expect(baseElement).toBeTruthy();
  });
});
