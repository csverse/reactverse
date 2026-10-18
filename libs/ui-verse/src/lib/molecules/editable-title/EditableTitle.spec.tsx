import { fireEvent } from '@testing-library/react';
import { renderWithTheme } from '../../utils/test/renderWithTheme';
import { expectNoA11yViolations } from '../../utils/test/a11y';
import { EditableTitle, EditableTitleProps } from './EditableTitle';

const setup = (props: Partial<EditableTitleProps> = {}) => renderWithTheme(<EditableTitle value="Tabs keyboard navigation" {...props} />);
type R = ReturnType<typeof setup>;
const field = (r: R) => r.getByRole('textbox', { name: 'Build title' }) as HTMLInputElement;
const type = (r: R, value: string) => fireEvent.change(field(r), { target: { value } });

describe('EditableTitle', () => {
  describe('viewing', () => {
    it('shows the title as a level 3 heading', () => {
      const { getByRole } = setup();
      expect(getByRole('heading', { level: 3, name: 'Tabs keyboard navigation' })).toBeTruthy();
    });

    it('offers an Edit button named for what it edits', () => {
      const { getByRole } = setup();
      expect(getByRole('button', { name: 'Edit title' })).toBeTruthy();
    });

    it('has no text field until editing starts', () => {
      const { queryByRole } = setup();
      expect(queryByRole('textbox')).toBeNull();
    });
  });

  describe('editing', () => {
    it('opens a field holding the current title', () => {
      const r = setup();
      fireEvent.click(r.getByRole('button', { name: 'Edit title' }));
      expect(field(r).value).toBe('Tabs keyboard navigation');
    });

    it('can start in edit mode', () => {
      const r = setup({ startEditing: true });
      expect(field(r)).toBeTruthy();
    });

    it('focuses the field when editing starts', () => {
      const r = setup({ startEditing: true });
      expect(document.activeElement).toBe(field(r));
    });

    it('shows Save and Cancel while editing, and no Edit button', () => {
      const r = setup({ startEditing: true });
      expect(r.getByRole('button', { name: 'Save' })).toBeTruthy();
      expect(r.getByRole('button', { name: 'Cancel' })).toBeTruthy();
      expect(r.queryByRole('button', { name: 'Edit title' })).toBeNull();
    });
  });

  describe('saving', () => {
    it('saves the trimmed title, reports it and shows it', () => {
      const onSave = jest.fn();
      const r = setup({ onSave });
      fireEvent.click(r.getByRole('button', { name: 'Edit title' }));
      type(r, '  Modal focus trap  ');
      fireEvent.click(r.getByRole('button', { name: 'Save' }));
      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith('Modal focus trap');
      expect(r.getByRole('heading', { name: 'Modal focus trap' })).toBeTruthy();
    });

    it('saves on Enter (form submit)', () => {
      const onSave = jest.fn();
      const r = setup({ startEditing: true, onSave });
      type(r, 'New');
      fireEvent.submit(field(r).closest('form') as HTMLFormElement);
      expect(onSave).toHaveBeenCalledWith('New');
    });

    it('keeps the saved title when editing again', () => {
      const r = setup();
      fireEvent.click(r.getByRole('button', { name: 'Edit title' }));
      type(r, 'First');
      fireEvent.click(r.getByRole('button', { name: 'Save' }));
      fireEvent.click(r.getByRole('button', { name: 'Edit title' }));
      expect(field(r).value).toBe('First');
    });

    it('returns focus to the Edit button', () => {
      const r = setup({ startEditing: true });
      type(r, 'New');
      fireEvent.click(r.getByRole('button', { name: 'Save' }));
      expect(document.activeElement).toBe(r.getByRole('button', { name: 'Edit title' }));
    });

    it('does not throw without onSave', () => {
      const r = setup({ startEditing: true });
      type(r, 'New');
      expect(() => fireEvent.click(r.getByRole('button', { name: 'Save' }))).not.toThrow();
    });
  });

  describe('validation', () => {
    it.each([[''], ['   ']])('rejects the title %j with a message', (value) => {
      const onSave = jest.fn();
      const r = setup({ startEditing: true, onSave });
      type(r, value);
      fireEvent.click(r.getByRole('button', { name: 'Save' }));
      expect(r.getByText("Title can't be empty.")).toBeTruthy();
      expect(onSave).not.toHaveBeenCalled();
    });

    it('flags the field as invalid and keeps editing', () => {
      const r = setup({ startEditing: true });
      type(r, '');
      fireEvent.click(r.getByRole('button', { name: 'Save' }));
      expect(field(r).getAttribute('aria-invalid')).toBe('true');
    });

    it('clears the error as soon as the user types again', () => {
      const r = setup({ startEditing: true });
      type(r, '');
      fireEvent.click(r.getByRole('button', { name: 'Save' }));
      type(r, 'a');
      expect(r.queryByText("Title can't be empty.")).toBeNull();
    });
  });

  describe('cancelling', () => {
    it('restores the heading without saving when Cancel is pressed', () => {
      const onSave = jest.fn();
      const r = setup({ startEditing: true, onSave });
      type(r, 'Changed my mind');
      fireEvent.click(r.getByRole('button', { name: 'Cancel' }));
      expect(r.getByRole('heading', { name: 'Tabs keyboard navigation' })).toBeTruthy();
      expect(onSave).not.toHaveBeenCalled();
    });

    it('cancels on Escape', () => {
      const onSave = jest.fn();
      const r = setup({ startEditing: true, onSave });
      fireEvent.keyDown(field(r), { key: 'Escape' });
      expect(r.getByRole('heading', { name: 'Tabs keyboard navigation' })).toBeTruthy();
      expect(onSave).not.toHaveBeenCalled();
    });

    it('returns focus to the Edit button', () => {
      const r = setup({ startEditing: true });
      fireEvent.keyDown(field(r), { key: 'Escape' });
      expect(document.activeElement).toBe(r.getByRole('button', { name: 'Edit title' }));
    });

    it('starts the next edit from the saved title, not the abandoned draft', () => {
      const r = setup();
      fireEvent.click(r.getByRole('button', { name: 'Edit title' }));
      type(r, 'abandoned');
      fireEvent.click(r.getByRole('button', { name: 'Cancel' }));
      fireEvent.click(r.getByRole('button', { name: 'Edit title' }));
      expect(field(r).value).toBe('Tabs keyboard navigation');
    });
  });

  describe('accessibility', () => {
    it.each([
      ['viewing', {}],
      ['editing', { startEditing: true }],
      ['long title', { value: 'Redesign the checkout flow with saved payment methods and one-tap reorder' }],
    ])('has no axe violations (%s)', async (_n, props) => {
      const { container } = setup(props);
      await expectNoA11yViolations(container);
    });

    it('has no axe violations showing a validation error', async () => {
      const r = setup({ startEditing: true });
      type(r, '');
      fireEvent.click(r.getByRole('button', { name: 'Save' }));
      await expectNoA11yViolations(r.container);
    });
  });
});
