import { fireEvent, render } from '@testing-library/react';
import { renderWithTheme } from '../../utils/test/renderWithTheme';
import { expectNoA11yViolations } from '../../utils/test/a11y';
import { ChangeReviewCard } from './ChangeReviewCard';

type Props = Partial<React.ComponentProps<typeof ChangeReviewCard>>;

const card = (props: Props = {}, id = 'c1', title = 'Tabs / Default') => (
  <ChangeReviewCard id={id} title={title} {...props}>
    <ChangeReviewCard.Preview />
    <ChangeReviewCard.Meta>Light · Chrome</ChangeReviewCard.Meta>
    <ChangeReviewCard.Actions />
  </ChangeReviewCard>
);
const setup = (props: Props = {}) => renderWithTheme(card(props));

describe('ChangeReviewCard', () => {
  describe('structure', () => {
    it('is an article named after its story', () => {
      const { getByRole } = setup();
      expect(getByRole('article', { name: 'Change in Tabs / Default' })).toBeTruthy();
    });

    it('shows the story title and the detail', () => {
      const { getByText } = setup();
      expect(getByText('Tabs / Default')).toBeTruthy();
      expect(getByText('Light · Chrome')).toBeTruthy();
    });

    it('starts pending with Approve and Deny', () => {
      const { getByRole, getByText } = setup();
      expect(getByText('Needs review')).toBeTruthy();
      expect(getByRole('button', { name: 'Approve Tabs / Default' })).toBeTruthy();
      expect(getByRole('button', { name: 'Deny Tabs / Default' })).toBeTruthy();
    });

    it('labels both preview panels', () => {
      const { getByRole } = setup();
      expect(getByRole('img', { name: 'Baseline snapshot' })).toBeTruthy();
      expect(getByRole('img', { name: 'Change snapshot' })).toBeTruthy();
    });

    it('captions the panels', () => {
      const { getByText } = setup();
      expect(getByText('Baseline')).toBeTruthy();
      expect(getByText('Change')).toBeTruthy();
    });

    it.each(['identical', 'shifted', 'recolored'] as const)('renders the %s preview', (variant) => {
      const { getAllByRole } = renderWithTheme(
        <ChangeReviewCard id="x" title="X">
          <ChangeReviewCard.Preview variant={variant} />
        </ChangeReviewCard>
      );
      expect(getAllByRole('img')).toHaveLength(2);
    });

    it('works without a preview', () => {
      const { queryByRole, getByRole } = renderWithTheme(
        <ChangeReviewCard id="x" title="X">
          <ChangeReviewCard.Meta />
          <ChangeReviewCard.Actions />
        </ChangeReviewCard>
      );
      expect(queryByRole('img')).toBeNull();
      expect(getByRole('button', { name: 'Approve X' })).toBeTruthy();
    });
  });

  describe('deciding', () => {
    it('approves, reports the decision for this card, and shows the badge', () => {
      const onDecision = jest.fn();
      const { getByRole, getByText } = setup({ onDecision });
      fireEvent.click(getByRole('button', { name: 'Approve Tabs / Default' }));
      expect(onDecision).toHaveBeenCalledTimes(1);
      expect(onDecision).toHaveBeenCalledWith('c1', 'approved');
      expect(getByText('Approved')).toBeTruthy();
    });

    it('denies, reports the decision and shows the badge', () => {
      const onDecision = jest.fn();
      const { getByRole, getByText } = setup({ onDecision });
      fireEvent.click(getByRole('button', { name: 'Deny Tabs / Default' }));
      expect(onDecision).toHaveBeenCalledWith('c1', 'denied');
      expect(getByText('Denied')).toBeTruthy();
    });

    it('replaces Approve and Deny with Undo once decided', () => {
      const { getByRole, queryByRole } = setup();
      fireEvent.click(getByRole('button', { name: 'Approve Tabs / Default' }));
      expect(queryByRole('button', { name: /^Approve/ })).toBeNull();
      expect(queryByRole('button', { name: /^Deny/ })).toBeNull();
      expect(getByRole('button', { name: 'Undo decision' })).toBeTruthy();
    });

    it('undo returns to pending, reports it, and restores both buttons', () => {
      const onDecision = jest.fn();
      const { getByRole, getByText } = setup({ onDecision, defaultDecision: 'denied' });
      fireEvent.click(getByRole('button', { name: 'Undo decision' }));
      expect(onDecision).toHaveBeenCalledWith('c1', 'pending');
      expect(getByText('Needs review')).toBeTruthy();
      expect(getByRole('button', { name: 'Approve Tabs / Default' })).toBeTruthy();
    });

    it('can change its mind more than once', () => {
      const onDecision = jest.fn();
      const { getByRole } = setup({ onDecision });
      fireEvent.click(getByRole('button', { name: 'Approve Tabs / Default' }));
      fireEvent.click(getByRole('button', { name: 'Undo decision' }));
      fireEvent.click(getByRole('button', { name: 'Deny Tabs / Default' }));
      expect(onDecision.mock.calls.map((c) => c[1])).toEqual(['approved', 'pending', 'denied']);
    });

    it.each([
      ['approved', 'Approved'],
      ['denied', 'Denied'],
    ] as const)('can start %s', (decision, badge) => {
      const { getByText, getByRole } = setup({ defaultDecision: decision });
      expect(getByText(badge)).toBeTruthy();
      expect(getByRole('button', { name: 'Undo decision' })).toBeTruthy();
    });

    it('does not throw without onDecision', () => {
      const { getByRole } = setup();
      expect(() => fireEvent.click(getByRole('button', { name: 'Approve Tabs / Default' }))).not.toThrow();
    });
  });

  describe('several cards', () => {
    it('decide independently and report their own ids', () => {
      const onDecision = jest.fn();
      const { getByRole, getAllByText } = renderWithTheme(
        <>
          {card({ onDecision }, 'a', 'Alpha')}
          {card({ onDecision }, 'b', 'Beta')}
        </>
      );
      fireEvent.click(getByRole('button', { name: 'Approve Alpha' }));
      expect(onDecision).toHaveBeenCalledWith('a', 'approved');
      expect(getAllByText('Needs review')).toHaveLength(1);
      expect(getByRole('button', { name: 'Approve Beta' })).toBeTruthy();
    });
  });

  describe('composition', () => {
    it.each([
      ['Meta', () => <ChangeReviewCard.Meta />],
      ['Actions', () => <ChangeReviewCard.Actions />],
    ])('refuses to render %s outside its parent', (_name, part) => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      expect(() => render(part())).toThrow(/inside <ChangeReviewCard>/);
      spy.mockRestore();
    });

    it('lets Preview stand alone, since it needs nothing from the card', () => {
      const { getAllByRole } = renderWithTheme(<ChangeReviewCard.Preview />);
      expect(getAllByRole('img')).toHaveLength(2);
    });
  });

  describe('accessibility', () => {
    it.each([
      ['pending', {}],
      ['approved', { defaultDecision: 'approved' as const }],
      ['denied', { defaultDecision: 'denied' as const }],
    ])('has no axe violations (%s)', async (_n, props) => {
      const { container } = setup(props);
      await expectNoA11yViolations(container);
    });
  });
});
