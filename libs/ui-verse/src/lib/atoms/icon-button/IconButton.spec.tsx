import { fireEvent } from '@testing-library/react';
import { IconBell, IconTrash } from '@tabler/icons-react';
import { renderWithTheme } from '../../utils/test/renderWithTheme';
import { expectNoA11yViolations } from '../../utils/test/a11y';
import { IconButton, IconButtonProps } from './IconButton';

const setup = (props: Partial<IconButtonProps> = {}) =>
  renderWithTheme(<IconButton icon={IconTrash} label="Delete comment" {...props} />);

describe('IconButton', () => {
  describe('naming', () => {
    it('is named by its label', () => {
      const { getByRole } = setup();
      expect(getByRole('button', { name: 'Delete comment' })).toBeTruthy();
    });

    it('follows the label when it changes', () => {
      const { getByRole, rerender } = setup();
      rerender(<IconButton icon={IconBell} label="Mute thread" />);
      expect(getByRole('button', { name: 'Mute thread' })).toBeTruthy();
    });

    it('draws the icon at the size that matches the button size', () => {
      const sizes = { sm: '14', md: '18', lg: '22' } as const;
      for (const [size, px] of Object.entries(sizes)) {
        const { container, unmount } = setup({ size: size as IconButtonProps['size'] });
        expect(container.querySelector('svg')?.getAttribute('width')).toBe(px);
        unmount();
      }
    });
  });

  describe('actions', () => {
    it('calls onClick once per click', () => {
      const onClick = jest.fn();
      const { getByRole } = setup({ onClick });
      const button = getByRole('button', { name: 'Delete comment' });
      fireEvent.click(button);
      fireEvent.click(button);
      expect(onClick).toHaveBeenCalledTimes(2);
    });

    it('does not throw without onClick', () => {
      const { getByRole } = setup();
      expect(() => fireEvent.click(getByRole('button'))).not.toThrow();
    });

    it('does not call onClick when disabled', () => {
      const onClick = jest.fn();
      const { getByRole } = setup({ onClick, disabled: true });
      fireEvent.click(getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('does not call onClick while loading', () => {
      const onClick = jest.fn();
      const { getByRole } = setup({ onClick, loading: true });
      fireEvent.click(getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('state', () => {
    it('is disabled for assistive tech when disabled', () => {
      const { getByRole } = setup({ disabled: true });
      expect((getByRole('button') as HTMLButtonElement).disabled).toBe(true);
    });

    it('is disabled while loading', () => {
      const { getByRole } = setup({ loading: true });
      expect((getByRole('button') as HTMLButtonElement).disabled).toBe(true);
    });
  });

  describe('accessibility', () => {
    it.each([
      ['default', {}],
      ['filled', { variant: 'filled' as const }],
      ['outlined', { variant: 'default' as const }],
      ['disabled', { disabled: true }],
      ['loading', { loading: true }],
      ['small', { size: 'sm' as const }],
      ['large', { size: 'lg' as const }],
    ])('has no axe violations (%s)', async (_name, props) => {
      const { container } = setup(props);
      await expectNoA11yViolations(container);
    });
  });
});
