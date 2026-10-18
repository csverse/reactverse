import { renderWithTheme } from '../../utils/test/renderWithTheme';
import { expectNoA11yViolations } from '../../utils/test/a11y';
import { LoadingIndicator, LoadingIndicatorProps } from './LoadingIndicator';

const setup = (props: Partial<LoadingIndicatorProps> = {}) => renderWithTheme(<LoadingIndicator {...props} />);

describe('LoadingIndicator', () => {
  it('announces the default label', () => {
    const { getByRole } = setup();
    expect(getByRole('status').textContent).toContain('Loading');
  });

  it('announces a custom label', () => {
    const { getByRole } = setup({ label: 'Capturing 126 snapshots' });
    expect(getByRole('status').textContent).toContain('Capturing 126 snapshots');
  });

  it('is a polite live region, so it never interrupts', () => {
    const { getByRole } = setup();
    expect(getByRole('status').getAttribute('aria-live')).toBe('polite');
  });

  it('keeps the words for screen readers when the label is hidden', () => {
    const { getByRole } = setup({ label: 'Loading builds', hideLabel: true });
    expect(getByRole('status').textContent).toContain('Loading builds');
  });

  it('keeps the spinner out of the accessibility tree', () => {
    const { container } = setup();
    expect(container.querySelector('[role="status"] .mantine-Loader-root')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('updates the announcement when the label changes', () => {
    const { getByRole, rerender } = setup({ label: 'Loading builds' });
    rerender(<LoadingIndicator label="Almost done" />);
    expect(getByRole('status').textContent).toContain('Almost done');
  });

  it.each([
    ['default', {}],
    ['small', { size: 'sm' as const }],
    ['large', { size: 'lg' as const }],
    ['hidden label', { hideLabel: true }],
    ['long label', { label: 'Waiting for Storybook to build and every story to render in every mode' }],
  ])('has no axe violations (%s)', async (_n, props) => {
    const { container } = setup(props);
    await expectNoA11yViolations(container);
  });
});
