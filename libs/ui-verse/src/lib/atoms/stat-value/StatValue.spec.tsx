import { renderWithTheme, visibleText } from '../../utils/test/renderWithTheme';
import { expectNoA11yViolations } from '../../utils/test/a11y';
import { StatValue, StatValueProps, formatValue } from './StatValue';

const setup = (props: Partial<StatValueProps> = {}) =>
  renderWithTheme(<StatValue label="Snapshots" value={12480} {...props} />);

describe('formatValue', () => {
  it.each([
    [12480, undefined, '12,480'],
    [0, 'count', '0'],
    [1234567, 'count', '1,234,567'],
    [78, 'percent', '78%'],
    [0, 'percent', '0%'],
    [247, 'seconds', '4m 07s'],
    [31, 'seconds', '31s'],
    [60, 'seconds', '1m 00s'],
    [0, 'seconds', '0s'],
    [3600, 'seconds', '60m 00s'],
  ] as const)('formatValue(%i, %s) is %s', (value, unit, expected) => {
    expect(formatValue(value, unit)).toBe(expected);
  });
});

describe('StatValue', () => {
  it('shows the label and the formatted value', () => {
    const { getByText } = setup();
    expect(getByText('Snapshots')).toBeTruthy();
    expect(getByText('12,480')).toBeTruthy();
  });

  describe('delta', () => {
    it('shows nothing without a delta', () => {
      const { container } = setup();
      expect(visibleText(container)).not.toMatch(/Up|Down|No change/);
    });

    it('spells out an increase in words', () => {
      const { container } = setup({ delta: 320, deltaLabel: 'vs last week' });
      expect(visibleText(container)).toContain('Up');
      expect(visibleText(container)).toContain('+320 vs last week');
    });

    it('spells out a decrease in words', () => {
      const { container } = setup({ delta: -5 });
      expect(visibleText(container)).toContain('Down');
      expect(visibleText(container)).toContain('-5');
    });

    it('says "No change" for zero', () => {
      const { container } = setup({ delta: 0 });
      expect(visibleText(container)).toContain('No change');
    });

    it('formats the delta in the same unit as the value', () => {
      const { container } = setup({ value: 247, unit: 'seconds', delta: -31 });
      expect(visibleText(container)).toContain('-31s');
    });

    it('does not rely on colour: direction words appear for good and bad changes alike', () => {
      const good = setup({ delta: -3, goodWhen: 'down' });
      expect(visibleText(good.container)).toContain('Down');
      good.unmount();
      const bad = setup({ delta: -3, goodWhen: 'up' });
      expect(visibleText(bad.container)).toContain('Down');
    });

    it('hides the arrow icon from assistive tech', () => {
      const { container } = setup({ delta: 1 });
      expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it.each([
    ['plain', {}],
    ['increase', { delta: 320, deltaLabel: 'vs last week' }],
    ['good decrease', { delta: -5, goodWhen: 'down' as const }],
    ['bad decrease', { delta: -5 }],
    ['no change', { delta: 0 }],
    ['percent', { value: 78, unit: 'percent' as const, delta: 4 }],
    ['duration', { value: 247, unit: 'seconds' as const, delta: -31 }],
  ])('has no axe violations (%s)', async (_n, props) => {
    const { container } = setup(props);
    await expectNoA11yViolations(container);
  });
});
