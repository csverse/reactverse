import { fireEvent, render } from '@testing-library/react';
import { renderWithTheme, visibleText } from '../../utils/test/renderWithTheme';
import { expectNoA11yViolations } from '../../utils/test/a11y';
import { BuildSummary, BuildSummaryProps } from './BuildSummary';

const root = (props: Partial<Omit<BuildSummaryProps, 'children'>> = {}, children?: React.ReactNode) => (
  <BuildSummary status="pending" number={481} branch="feature/tabs" {...props}>
    {children ?? <BuildSummary.Heading />}
  </BuildSummary>
);

describe('BuildSummary', () => {
  describe('structure', () => {
    it('is a section named after the build', () => {
      const { getByRole } = renderWithTheme(root());
      expect(getByRole('region', { name: 'Build 481 summary' })).toBeTruthy();
    });

    it('follows the build number', () => {
      const { getByRole } = renderWithTheme(root({ number: 7 }));
      expect(getByRole('region', { name: 'Build 7 summary' })).toBeTruthy();
    });
  });

  describe('Heading', () => {
    it('shows the number as a level 3 heading', () => {
      const { getByRole } = renderWithTheme(root());
      expect(getByRole('heading', { level: 3, name: /Build #481/ })).toBeTruthy();
    });

    it('shows the branch', () => {
      const { getByText } = renderWithTheme(root({ branch: 'feature/tabs' }));
      expect(getByText('feature/tabs')).toBeTruthy();
    });

    it.each([
      ['accepted', 'Accepted'],
      ['changed', 'Changes found'],
      ['denied', 'Denied'],
      ['building', 'In progress'],
      ['pending', 'Needs review'],
      ['broken', 'Build failed'],
    ] as const)('shows the %s status as "%s"', (status, label) => {
      const { getByText } = renderWithTheme(root({ status }));
      expect(getByText(label)).toBeTruthy();
    });

    it('has no View build button without onView', () => {
      const { queryByRole } = renderWithTheme(root());
      expect(queryByRole('button', { name: 'View build' })).toBeNull();
    });

    it('reports the build number when View build is pressed', () => {
      const onView = jest.fn();
      const { getByRole } = renderWithTheme(root({}, <BuildSummary.Heading onView={onView} />));
      fireEvent.click(getByRole('button', { name: 'View build' }));
      expect(onView).toHaveBeenCalledTimes(1);
      expect(onView).toHaveBeenCalledWith(481);
    });
  });

  describe('Stats and Progress', () => {
    it('shows each stat', () => {
      const { getByText } = renderWithTheme(
        root({}, (
          <BuildSummary.Stats>
            <BuildSummary.Stat label="Stories" value={98} />
            <BuildSummary.Stat label="Snapshots" value={434} />
          </BuildSummary.Stats>
        ))
      );
      expect(getByText('98')).toBeTruthy();
      expect(getByText('434')).toBeTruthy();
    });

    it('passes deltas through to the stat', () => {
      const { container } = renderWithTheme(
        root({}, (
          <BuildSummary.Stats>
            <BuildSummary.Stat label="Changes" value={14} delta={-3} goodWhen="down" />
          </BuildSummary.Stats>
        ))
      );
      expect(visibleText(container)).toContain('Down');
    });

    it('shows the progress as a progressbar', () => {
      const { getByRole } = renderWithTheme(root({}, <BuildSummary.Progress done={63} total={126} />));
      expect(getByRole('progressbar').getAttribute('aria-valuenow')).toBe('50');
    });

    it('can be composed from any subset of parts', () => {
      const { queryByRole, getByRole } = renderWithTheme(root({}, <BuildSummary.Progress done={1} total={2} />));
      expect(queryByRole('heading')).toBeNull();
      expect(getByRole('progressbar')).toBeTruthy();
    });
  });

  describe('composition', () => {
    it('refuses to render Heading outside its parent', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      expect(() => render(<BuildSummary.Heading />)).toThrow(/inside <BuildSummary>/);
      spy.mockRestore();
    });
  });

  describe('accessibility', () => {
    const full = (status: BuildSummaryProps['status']) =>
      root({ status }, (
        <>
          <BuildSummary.Heading onView={() => undefined} />
          <BuildSummary.Stats>
            <BuildSummary.Stat label="Stories" value={98} />
            <BuildSummary.Stat label="Changes" value={14} delta={-3} goodWhen="down" />
          </BuildSummary.Stats>
          <BuildSummary.Progress done={90} total={126} failed={status === 'broken' ? 36 : 0} />
        </>
      ));

    it.each(['pending', 'accepted', 'broken', 'building'] as const)('has no axe violations (%s)', async (status) => {
      const { container } = renderWithTheme(full(status));
      await expectNoA11yViolations(container);
    });
  });
});
