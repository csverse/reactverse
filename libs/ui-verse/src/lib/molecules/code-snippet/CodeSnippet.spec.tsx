import { fireEvent } from '@testing-library/react';
import { renderWithTheme } from '../../utils/test/renderWithTheme';
import { expectNoA11yViolations } from '../../utils/test/a11y';
import { CodeSnippet, CodeSnippetProps } from './CodeSnippet';

const setup = (props: Partial<CodeSnippetProps> = {}) => renderWithTheme(<CodeSnippet code="npm install ui-verse" {...props} />);

describe('CodeSnippet', () => {
  describe('content', () => {
    it('shows the code exactly as given', () => {
      const { getByRole } = setup();
      expect(getByRole('region', { name: 'command' }).textContent).toBe('npm install ui-verse');
    });

    it('keeps multi-line code and its indentation', () => {
      const code = 'a:\n  b: 1\n  c: 2';
      const { getByRole } = setup({ code });
      expect(getByRole('region', { name: 'command' }).textContent).toBe(code);
    });

    it('does not interpret HTML in the code', () => {
      const { getByRole } = setup({ code: '<script>alert(1)</script>' });
      expect(getByRole('region', { name: 'command' }).textContent).toBe('<script>alert(1)</script>');
      expect(document.querySelector('script')).toBeNull();
    });
  });

  describe('naming', () => {
    it('names the region and the copy button after the label', () => {
      const { getByRole } = setup({ label: 'workflow step' });
      expect(getByRole('region', { name: 'workflow step' })).toBeTruthy();
      expect(getByRole('button', { name: 'Copy workflow step' })).toBeTruthy();
    });

    it('is focusable so keyboard users can scroll a long line', () => {
      const { getByRole } = setup();
      expect(getByRole('region', { name: 'command' }).getAttribute('tabindex')).toBe('0');
    });
  });

  describe('actions', () => {
    it('reports the code when copy is pressed', () => {
      const onCopy = jest.fn();
      const { getByRole } = setup({ onCopy });
      fireEvent.click(getByRole('button', { name: 'Copy command' }));
      expect(onCopy).toHaveBeenCalledTimes(1);
      expect(onCopy).toHaveBeenCalledWith('npm install ui-verse');
    });

    it('reports every press, not just the first', () => {
      const onCopy = jest.fn();
      const { getByRole } = setup({ onCopy });
      const button = getByRole('button', { name: /Copy|Copied/ });
      fireEvent.click(button);
      fireEvent.click(button);
      expect(onCopy).toHaveBeenCalledTimes(2);
    });

    it('does not throw without onCopy', () => {
      const { getByRole } = setup();
      expect(() => fireEvent.click(getByRole('button', { name: 'Copy command' }))).not.toThrow();
    });
  });

  describe('copy button', () => {
    it('is hidden when asked', () => {
      const { queryByRole } = setup({ hideCopy: true });
      expect(queryByRole('button')).toBeNull();
    });
  });

  describe('accessibility', () => {
    it.each([
      ['default', {}],
      ['without copy', { hideCopy: true }],
      ['multi-line', { code: 'a\nb\nc', label: 'script' }],
    ])('has no axe violations (%s)', async (_n, props) => {
      const { container } = setup(props);
      await expectNoA11yViolations(container);
    });
  });
});
