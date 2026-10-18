import { renderWithTheme } from '../utils/test/renderWithTheme';

import Image from './image';

describe('Image', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithTheme(<Image />);
    expect(baseElement).toBeTruthy();
  });
});
