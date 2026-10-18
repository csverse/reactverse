import { renderWithTheme, visibleText } from '../../utils/test/renderWithTheme';
import { expectNoA11yViolations } from '../../utils/test/a11y';
import { ShortcutKey } from './ShortcutKey';

describe('ShortcutKey', () => {
  it.each([
    [['↵'], 'Shortcut: Enter'],
    [['⌘', 'K'], 'Shortcut: Command plus K'],
    [['⌘', '⇧', 'A'], 'Shortcut: Command plus Shift plus A'],
    [['⌥', 'Z'], 'Shortcut: Option plus Z'],
    [['⌃', 'C'], 'Shortcut: Control plus C'],
    [['⎋'], 'Shortcut: Escape'],
    [['Ctrl', 'Alt', 'Delete'], 'Shortcut: Ctrl plus Alt plus Delete'],
  ])('speaks %j as "%s"', (keys, name) => {
    const { getByRole } = renderWithTheme(<ShortcutKey keys={keys} />);
    expect(getByRole('group', { name })).toBeTruthy();
  });

  it('draws one key cap per key', () => {
    const { container } = renderWithTheme(<ShortcutKey keys={['⌘', '⇧', 'A']} />);
    expect(container.querySelectorAll('kbd')).toHaveLength(3);
  });

  it('draws a plus between keys but not before the first', () => {
    const { container } = renderWithTheme(<ShortcutKey keys={['⌘', 'K']} />);
    expect(visibleText(container)?.match(/\+/g)).toHaveLength(1);
  });

  it('hides the drawn symbols from screen readers so they are not read twice', () => {
    const { container } = renderWithTheme(<ShortcutKey keys={['⌘', 'K']} />);
    container.querySelectorAll('kbd').forEach((k) => expect(k.getAttribute('aria-hidden')).toBe('true'));
  });

  it('does not add a tab stop', () => {
    const { container } = renderWithTheme(<ShortcutKey keys={['⌘', 'K']} />);
    expect(container.querySelectorAll('[tabindex], a, button')).toHaveLength(0);
  });

  it('renders nothing visible for an empty list without crashing', () => {
    const { container } = renderWithTheme(<ShortcutKey keys={[]} />);
    expect(container.querySelectorAll('kbd')).toHaveLength(0);
  });

  it.each([[['↵']], [['⌘', 'K']], [['Ctrl', 'Alt', 'Delete']]])('has no axe violations (%j)', async (keys) => {
    const { container } = renderWithTheme(<ShortcutKey keys={keys} />);
    await expectNoA11yViolations(container);
  });
});
