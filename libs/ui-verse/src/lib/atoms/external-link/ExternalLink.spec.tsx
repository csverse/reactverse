import { fireEvent } from '@testing-library/react';
import { renderWithTheme } from '../../utils/test/renderWithTheme';
import { expectNoA11yViolations } from '../../utils/test/a11y';
import { ExternalLink, ExternalLinkProps } from './ExternalLink';

const setup = (props: Partial<ExternalLinkProps> = {}) =>
  renderWithTheme(
    <ExternalLink href="https://www.chromatic.com/docs" {...props}>
      Chromatic docs
    </ExternalLink>
  );

describe('ExternalLink', () => {
  it('links to the href', () => {
    const { getByRole } = setup();
    expect(getByRole('link').getAttribute('href')).toBe('https://www.chromatic.com/docs');
  });

  it('opens in a new tab without leaking the opener', () => {
    const { getByRole } = setup();
    const link = getByRole('link');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('tells screen readers it opens a new tab', () => {
    const { getByRole } = setup();
    expect(getByRole('link', { name: 'Chromatic docs (opens in a new tab)' })).toBeTruthy();
  });

  it('keeps the new-tab note even when the icon is hidden', () => {
    const { getByRole } = setup({ showIcon: false });
    expect(getByRole('link', { name: 'Chromatic docs (opens in a new tab)' })).toBeTruthy();
  });

  it('draws the icon by default and hides it from assistive tech', () => {
    const { container } = setup();
    const icon = container.querySelector('svg');
    expect(icon).toBeTruthy();
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('omits the icon when asked', () => {
    const { container } = setup({ showIcon: false });
    expect(container.querySelector('svg')).toBeNull();
  });

  describe('actions', () => {
    it('reports the href when activated', () => {
      const onNavigate = jest.fn();
      const { getByRole } = setup({ onNavigate });
      fireEvent.click(getByRole('link'));
      expect(onNavigate).toHaveBeenCalledTimes(1);
      expect(onNavigate).toHaveBeenCalledWith('https://www.chromatic.com/docs');
    });

    it('does not throw without onNavigate', () => {
      const { getByRole } = setup();
      expect(() => fireEvent.click(getByRole('link'))).not.toThrow();
    });

    it('does not prevent the link from opening', () => {
      const { getByRole } = setup({ onNavigate: jest.fn() });
      // fireEvent returns false when preventDefault was called.
      expect(fireEvent.click(getByRole('link'))).toBe(true);
    });
  });

  it.each([
    ['default', {}],
    ['without icon', { showIcon: false }],
  ])('has no axe violations (%s)', async (_n, props) => {
    const { container } = setup(props);
    await expectNoA11yViolations(container);
  });
});
