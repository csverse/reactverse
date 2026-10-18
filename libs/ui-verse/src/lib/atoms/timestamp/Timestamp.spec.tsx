import { renderWithTheme, visibleText } from '../../utils/test/renderWithTheme';
import { expectNoA11yViolations } from '../../utils/test/a11y';
import { Timestamp, TimestampProps, relativeLabel } from './Timestamp';

const NOW = '2026-10-18T12:00:00Z';
const now = new Date(NOW);
const setup = (props: Partial<TimestampProps> = {}) =>
  renderWithTheme(<Timestamp date="2026-10-11T09:30:00Z" now={NOW} {...props} />);

describe('relativeLabel', () => {
  it.each([
    ['2026-10-18T11:59:40Z', 'just now'],
    ['2026-10-18T12:00:00Z', 'just now'],
    ['2026-10-18T12:00:30Z', 'just now'],
    ['2026-10-18T11:59:00Z', '1 minute ago'],
    ['2026-10-18T11:42:00Z', '18 minutes ago'],
    ['2026-10-18T11:00:00Z', '1 hour ago'],
    ['2026-10-18T07:00:00Z', '5 hours ago'],
    ['2026-10-17T12:00:00Z', 'yesterday'],
    ['2026-10-11T09:00:00Z', '7 days ago'],
    ['2026-10-18T14:00:00Z', 'in 2 hours'],
    ['2026-10-19T12:00:00Z', 'tomorrow'],
    ['2026-10-18T12:05:00Z', 'in 5 minutes'],
  ])('%s is "%s"', (date, label) => {
    expect(relativeLabel(new Date(date), now)).toBe(label);
  });
});

describe('Timestamp', () => {
  it('renders a <time> element', () => {
    const { container } = setup();
    expect(container.querySelector('time')).toBeTruthy();
  });

  it('carries an ISO value for machines', () => {
    const { container } = setup();
    expect(container.querySelector('time')?.getAttribute('datetime')).toBe('2026-10-11T09:30:00.000Z');
  });

  it('puts the full date in the title for hover', () => {
    const { container } = setup();
    expect(container.querySelector('time')?.getAttribute('title')).toBe('11 Oct 2026, 09:30 UTC');
  });

  it('shows relative text by default', () => {
    const { getByText } = setup();
    expect(getByText('7 days ago')).toBeTruthy();
  });

  it('shows the absolute date when asked', () => {
    const { getByText } = setup({ format: 'absolute' });
    expect(getByText('11 Oct 2026, 09:30 UTC')).toBeTruthy();
  });

  it('accepts a Date as well as a string', () => {
    const { container } = setup({ date: new Date('2026-10-18T07:00:00Z') });
    expect(visibleText(container)).toBe('5 hours ago');
  });

  it('is stable across timezones: it always speaks in UTC', () => {
    const { container } = setup({ date: '2026-10-18T23:30:00Z', format: 'absolute' });
    expect(visibleText(container)).toBe('18 Oct 2026, 23:30 UTC');
  });

  it.each([
    ['relative', {}],
    ['absolute', { format: 'absolute' as const }],
    ['future', { date: '2026-10-18T14:00:00Z' }],
  ])('has no axe violations (%s)', async (_n, props) => {
    const { container } = setup(props);
    await expectNoA11yViolations(container);
  });
});
