import axe from 'axe-core';

/**
 * Runs axe-core on a rendered element and fails with a readable list of violations.
 * Colour contrast is skipped because jsdom has no layout or computed colours; that rule
 * runs in the browser through the Storybook Accessibility panel and the test-runner.
 * `region` is skipped because components are tested outside a page landmark.
 */
export async function expectNoA11yViolations(element: Element) {
  const results = await axe.run(element, {
    rules: {
      'color-contrast': { enabled: false },
      region: { enabled: false },
    },
  });
  const messages = results.violations.map(
    (v) => `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.map((n) => n.html).join('\n  ')}`
  );
  expect(messages).toEqual([]);
}
