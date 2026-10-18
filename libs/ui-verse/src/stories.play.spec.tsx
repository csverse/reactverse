/**
 * Runs every story's `play` function in jsdom, through the real preview decorators.
 *
 * This is the fast first line of defence: it catches wrong roles, missing elements, wrong
 * payloads and broken flows in seconds, before a Chromatic or test-runner build. It cannot
 * replace the browser run, because jsdom has no layout, no real focus rules for some widgets and
 * no CSS, so a story can pass here and still need a look in Storybook.
 */
import { readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { render } from '@testing-library/react';
import { composeStories, setProjectAnnotations } from '@storybook/react';
import preview from '../.storybook/preview';

setProjectAnnotations(preview);
jest.setTimeout(20000);

const root = join(__dirname, 'lib');
const storyFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return storyFiles(path);
    return path.endsWith('.stories.tsx') ? [path] : [];
  });

for (const file of storyFiles(root).sort()) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const stories = composeStories(require(file));
  describe(relative(root, file), () => {
    for (const [name, Story] of Object.entries(stories)) {
      // Needs a real image request to fail. jsdom never loads images, so it cannot reach the fallback.
      const needsRealImageLoad = name === 'BrokenImage';
      (needsRealImageLoad ? it.skip : it)(name, async () => {
        const { container } = render(<Story />);
        await Story.play?.({
          canvasElement: container,
          args: Story.args,
          // Storybook labels steps in the Interactions panel; here a step is just a function call.
          step: async (_label: string, run: (ctx: unknown) => unknown) => run({}),
        } as never);
      });
    }
  });
}
