import { renderWithTheme, visibleText } from '../../utils/test/renderWithTheme';
import { expectNoA11yViolations } from '../../utils/test/a11y';
import { SnapshotProgress, SnapshotProgressProps, percentOf } from './SnapshotProgress';

const setup = (props: Partial<SnapshotProgressProps> = {}) =>
  renderWithTheme(<SnapshotProgress done={63} total={126} {...props} />);

describe('percentOf', () => {
  it.each([
    [98, 126, 78],
    [0, 126, 0],
    [126, 126, 100],
    [63, 126, 50],
    [1, 3, 33],
    [2, 3, 67],
    [130, 126, 100],
    [0, 0, 0],
    [5, 0, 0],
  ])('percentOf(%i, %i) is %i', (done, total, pct) => {
    expect(percentOf(done, total)).toBe(pct);
  });
});

describe('SnapshotProgress', () => {
  it('exposes the percentage as a progressbar', () => {
    const { getByRole } = setup();
    const bar = getByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('50');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
  });

  it('names the progressbar', () => {
    const { getByRole } = setup();
    expect(getByRole('progressbar', { name: 'Snapshot progress' })).toBeTruthy();
  });

  it('shows the counts as text, so the numbers are not only in the bar', () => {
    const { getByText } = setup({ done: 98 });
    expect(getByText('98 of 126')).toBeTruthy();
  });

  it('mentions failures in the text', () => {
    const { getByText } = setup({ done: 120, total: 126, failed: 6 });
    expect(getByText('120 of 126, 6 failed')).toBeTruthy();
  });

  it('does not mention failures when there are none', () => {
    const { container } = setup({ failed: 0 });
    expect(visibleText(container)).not.toContain('failed');
  });

  it('does not show NaN when there are no snapshots', () => {
    const { getByRole, container } = setup({ done: 0, total: 0 });
    expect(getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0');
    expect(visibleText(container)).not.toContain('NaN');
  });

  it('never goes past 100', () => {
    const { getByRole } = setup({ done: 200, total: 126 });
    expect(getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100');
  });

  it('follows updates', () => {
    const { getByRole, rerender } = setup({ done: 10, total: 100 });
    rerender(<SnapshotProgress done={90} total={100} />);
    expect(getByRole('progressbar').getAttribute('aria-valuenow')).toBe('90');
  });

  it.each([
    ['not started', { done: 0 }],
    ['in progress', {}],
    ['complete', { done: 126 }],
    ['with failures', { done: 120, failed: 6 }],
    ['no snapshots', { done: 0, total: 0 }],
  ])('has no axe violations (%s)', async (_n, props) => {
    const { container } = setup(props);
    await expectNoA11yViolations(container);
  });
});
