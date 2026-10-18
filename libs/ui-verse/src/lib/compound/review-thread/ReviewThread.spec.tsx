import { fireEvent, render } from '@testing-library/react';
import { renderWithTheme } from '../../utils/test/renderWithTheme';
import { expectNoA11yViolations } from '../../utils/test/a11y';
import { ReviewThread } from './ReviewThread';

type Props = Partial<React.ComponentProps<typeof ReviewThread>>;

const NOW = '2026-10-18T12:00:00Z';
const thread = (props: Props = {}, count = 1) => (
  <ReviewThread {...props}>
    <ReviewThread.Header count={count} />
    <ReviewThread.Comment author={{ name: 'Priya Raman' }} body="Clipped focus ring." createdAt="2026-10-18T09:10:00Z" now={NOW} />
    <ReviewThread.Reply />
  </ReviewThread>
);
const setup = (props: Props = {}, count = 1) => renderWithTheme(thread(props, count));
type R = ReturnType<typeof setup>;
const reply = (r: R) => r.getByLabelText('Reply') as HTMLTextAreaElement;
const send = (r: R) => r.getByRole('button', { name: 'Send reply' }) as HTMLButtonElement;
const write = (r: R, value: string) => fireEvent.change(reply(r), { target: { value } });

describe('ReviewThread', () => {
  describe('structure', () => {
    it('is a labelled section', () => {
      const { getByRole } = setup();
      expect(getByRole('region', { name: 'Review thread' })).toBeTruthy();
    });

    it.each([
      [0, '0 comments'],
      [1, '1 comment'],
      [2, '2 comments'],
      [12, '12 comments'],
    ])('counts %i as "%s"', (count, text) => {
      const { getByText } = setup({}, count);
      expect(getByText(text, { exact: false })).toBeTruthy();
    });

    it('shows the comments', () => {
      const { getByText } = setup();
      expect(getByText('Clipped focus ring.')).toBeTruthy();
    });

    it('has no resolve button on the comment itself', () => {
      const { queryByRole } = setup();
      expect(queryByRole('button', { name: 'Resolve' })).toBeNull();
    });
  });

  describe('replying', () => {
    it('sends the trimmed text, once', () => {
      const onReply = jest.fn();
      const r = setup({ onReply });
      write(r, '  Fixed in the next push.  ');
      fireEvent.click(send(r));
      expect(onReply).toHaveBeenCalledTimes(1);
      expect(onReply).toHaveBeenCalledWith('Fixed in the next push.');
    });

    it('empties the field and keeps focus on it for a follow-up', () => {
      const r = setup({ onReply: jest.fn() });
      write(r, 'Fixed.');
      fireEvent.click(send(r));
      expect(reply(r).value).toBe('');
      expect(document.activeElement).toBe(reply(r));
    });

    it('keeps multi-line replies whole', () => {
      const onReply = jest.fn();
      const r = setup({ onReply });
      write(r, 'Line one\nLine two');
      fireEvent.click(send(r));
      expect(onReply).toHaveBeenCalledWith('Line one\nLine two');
    });

    it.each([[''], ['   '], ['\n\n']])('disables Send for blank text %j', (value) => {
      const onReply = jest.fn();
      const r = setup({ onReply });
      write(r, value);
      expect(send(r).disabled).toBe(true);
      fireEvent.click(send(r));
      expect(onReply).not.toHaveBeenCalled();
    });

    it('enables Send once there is text', () => {
      const r = setup();
      write(r, 'Hi');
      expect(send(r).disabled).toBe(false);
    });

    it('does not throw without onReply', () => {
      const r = setup();
      write(r, 'Hi');
      expect(() => fireEvent.click(send(r))).not.toThrow();
    });
  });

  describe('resolving', () => {
    it('starts open: Resolve thread and a reply box', () => {
      const { getByRole, getByLabelText } = setup();
      expect(getByRole('button', { name: 'Resolve thread' })).toBeTruthy();
      expect(getByLabelText('Reply')).toBeTruthy();
    });

    it('resolves, reports true, and swaps the reply box for a note', () => {
      const onResolveChange = jest.fn();
      const { getByRole, queryByLabelText, getByText } = setup({ onResolveChange });
      fireEvent.click(getByRole('button', { name: 'Resolve thread' }));
      expect(onResolveChange).toHaveBeenCalledTimes(1);
      expect(onResolveChange).toHaveBeenCalledWith(true);
      expect(queryByLabelText('Reply')).toBeNull();
      expect(getByText(/This thread is resolved/)).toBeTruthy();
    });

    it('says so in the header too', () => {
      const { getByRole, getByText } = setup();
      fireEvent.click(getByRole('button', { name: 'Resolve thread' }));
      expect(getByText(/resolved/, { selector: 'span' })).toBeTruthy();
    });

    it('reopens, reports false and brings the reply box back', () => {
      const onResolveChange = jest.fn();
      const { getByRole, getByLabelText } = setup({ onResolveChange, defaultResolved: true });
      fireEvent.click(getByRole('button', { name: 'Reopen thread' }));
      expect(onResolveChange).toHaveBeenCalledWith(false);
      expect(getByLabelText('Reply')).toBeTruthy();
    });

    it('can start resolved', () => {
      const { getByRole, queryByLabelText } = setup({ defaultResolved: true });
      expect(getByRole('button', { name: 'Reopen thread' })).toBeTruthy();
      expect(queryByLabelText('Reply')).toBeNull();
    });

    it('keeps an unsent draft while resolved and restores it on reopen, without sending it', () => {
      const onReply = jest.fn();
      const r = setup({ onReply });
      write(r, 'half written');
      fireEvent.click(r.getByRole('button', { name: 'Resolve thread' }));
      fireEvent.click(r.getByRole('button', { name: 'Reopen thread' }));
      expect(onReply).not.toHaveBeenCalled();
      expect(reply(r).value).toBe('half written');
    });
  });

  describe('composition', () => {
    it.each([
      ['Header', () => <ReviewThread.Header count={1} />],
      ['Reply', () => <ReviewThread.Reply />],
    ])('refuses to render %s outside its parent', (_name, part) => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      expect(() => render(part())).toThrow(/inside <ReviewThread>/);
      spy.mockRestore();
    });
  });

  describe('accessibility', () => {
    it.each([
      ['open', {}],
      ['resolved', { defaultResolved: true }],
    ])('has no axe violations (%s)', async (_n, props) => {
      const { container } = setup(props);
      await expectNoA11yViolations(container);
    });

    it('has no axe violations with a draft typed', async () => {
      const r = setup();
      write(r, 'A draft reply');
      await expectNoA11yViolations(r.container);
    });
  });
});
