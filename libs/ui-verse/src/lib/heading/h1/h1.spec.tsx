import { renderWithTheme } from '../../utils/test/renderWithTheme';

import H1 from './h1';

describe('H1', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithTheme(<H1>hello there</H1>);
    expect(baseElement).toBeTruthy();
  });
});
