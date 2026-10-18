import type { TestRunnerConfig } from '@storybook/test-runner';
import { getStoryContext } from '@storybook/test-runner';
import { checkA11y, configureAxe, injectAxe } from 'axe-playwright';

/**
 * Runs after every story's `play` function has finished. Each story is
 * checked with axe, using the same rules as the Accessibility panel
 * (`parameters.a11y.config` in preview.tsx). Opt a story out with
 * `parameters: { a11yTestRunner: { skip: true } }`.
 */
const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page, context) {
    const story = await getStoryContext(page, context);
    if (story.parameters?.a11yTestRunner?.skip) return;

    await configureAxe(page, { rules: story.parameters?.a11y?.config?.rules });
    await checkA11y(page, 'body', {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  },
};

export default config;
