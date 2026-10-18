import { fireEvent } from '@testing-library/react';
import { renderWithTheme, visibleText } from '../../utils/test/renderWithTheme';
import { expectNoA11yViolations } from '../../utils/test/a11y';
import { CommentCard, CommentCardProps } from './CommentCard';

const base: CommentCardProps = {
  author: { name: 'Priya Raman' },
  body: 'The focus ring on the second tab is clipped in Firefox.',
  createdAt: '2026-10-18T09:10:00Z',
  now: '2026-10-18T12:00:00Z',
};
const setup = (props: Partial<CommentCardProps> = {}) => renderWithTheme(<CommentCard {...base} {...props} />);

describe('CommentCard', () => {
  describe('content', () => {
    it('is an article named after its author', () => {
      const { getByRole } = setup();
      expect(getByRole('article', { name: 'Comment by Priya Raman' })).toBeTruthy();
    });

    it('shows the author, the body and a relative time', () => {
      const { container, getByText } = setup();
      expect(getByText('Priya Raman')).toBeTruthy();
      expect(getByText(base.body)).toBeTruthy();
      expect(visibleText(container)).toContain('2 hours ago');
    });

    it('shows the author initials when there is no photo', () => {
      const { getByText } = setup();
      expect(getByText('PR')).toBeTruthy();
    });

    it('keeps a long body whole', () => {
      const body = 'Needs a closer look. '.repeat(40).trim();
      const { getByText } = setup({ body });
      expect(getByText(body)).toBeTruthy();
    });

    it('does not interpret HTML in the body', () => {
      const { getByText, container } = setup({ body: '<b>bold</b>' });
      expect(getByText('<b>bold</b>')).toBeTruthy();
      expect(container.querySelector('b')).toBeNull();
    });
  });

  describe('resolving', () => {
    it('has no button without onResolve', () => {
      const { queryByRole } = setup();
      expect(queryByRole('button')).toBeNull();
    });

    it('starts open: shows Resolve and no badge', () => {
      const { getByRole, queryByText } = setup({ onResolve: jest.fn() });
      expect(getByRole('button', { name: 'Resolve' })).toBeTruthy();
      expect(queryByText('Resolved')).toBeNull();
    });

    it('can start resolved: shows Reopen and the badge', () => {
      const { getByRole, getByText } = setup({ resolved: true, onResolve: jest.fn() });
      expect(getByRole('button', { name: 'Reopen' })).toBeTruthy();
      expect(getByText('Resolved')).toBeTruthy();
    });

    it('resolves, reports true and flips the button', () => {
      const onResolve = jest.fn();
      const { getByRole, getByText } = setup({ onResolve });
      fireEvent.click(getByRole('button', { name: 'Resolve' }));
      expect(onResolve).toHaveBeenCalledTimes(1);
      expect(onResolve).toHaveBeenLastCalledWith(true);
      expect(getByText('Resolved')).toBeTruthy();
      expect(getByRole('button', { name: 'Reopen' })).toBeTruthy();
    });

    it('reopens, reports false and removes the badge', () => {
      const onResolve = jest.fn();
      const { getByRole, queryByText } = setup({ resolved: true, onResolve });
      fireEvent.click(getByRole('button', { name: 'Reopen' }));
      expect(onResolve).toHaveBeenLastCalledWith(false);
      expect(queryByText('Resolved')).toBeNull();
    });

    it('can be resolved and reopened repeatedly', () => {
      const onResolve = jest.fn();
      const { getByRole } = setup({ onResolve });
      fireEvent.click(getByRole('button', { name: 'Resolve' }));
      fireEvent.click(getByRole('button', { name: 'Reopen' }));
      fireEvent.click(getByRole('button', { name: 'Resolve' }));
      expect(onResolve.mock.calls.map((c) => c[0])).toEqual([true, false, true]);
    });
  });

  describe('accessibility', () => {
    it.each([
      ['read-only', {}],
      ['open', { onResolve: jest.fn() }],
      ['resolved', { resolved: true, onResolve: jest.fn() }],
      ['long name', { author: { name: 'Okonkwo Adeyemi-Featherstonehaugh' } }],
    ])('has no axe violations (%s)', async (_n, props) => {
      const { container } = setup(props);
      await expectNoA11yViolations(container);
    });
  });
});
