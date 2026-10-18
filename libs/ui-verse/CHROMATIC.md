# Chromatic testing in ui-verse

Ten "Review Desk" components exist to exercise Chromatic. Their copy is about
Chromatic itself (builds, baselines, reviewers) so every story reads as real content.

## Feature to story map

| Chromatic capability | Where to see it |
| --- | --- |
| Visual snapshots (every story, light + dark by default) | all stories; defaults in `.storybook/preview.tsx` |
| Modes (theme x viewport) | `RESPONSIVE_MODES` in `src/lib/utils/storybook/chromatic.ts`, used by BuildsTable, BuildTabs, SignInForm, AcceptChangesModal, BrowserMatrix |
| Responsive viewports | `StatusBadge/Matrix`, `BuildsTable/*` (horizontal scroller at 320) |
| Interaction tests (`play`) | `BaselineAlert/Dismissed`, `BuildTabs/KeyboardNavigation`, `AcceptChangesModal/OpenedViaTrigger`, `SignInForm/*`, `BrowserMatrix/ExpandAndCollapse`, `BuildsTable/SortByBranch` |
| Hover and focus states | `Hint/TooltipOnHover`, `Hint/TooltipOnKeyboardFocus`, `SettingToggle/FocusedCheckbox` |
| Accessibility (axe) | addon-a11y on every story (config in `.storybook/preview.tsx`); the same rules gate `npm run test-storybook` via `.storybook/test-runner.ts`; `SettingToggle/A11yViolationDemo` fails on purpose |
| Actions panel | callbacks are spies from `src/lib/utils/storybook/spy.ts`: logged in Actions and asserted in `play` |
| Animation handling | `BrowserMatrix/AnimatedExpand` (`pauseAnimationAtEnd`, `delay`); global `pauseAnimationAtEnd` |
| Asset loading | `ReviewerAvatar/BrokenImage` (`delay`) |
| Flake control | `BuildsTable` `diffThreshold`; `BuildsTable/WithIgnoredRegion` (`data-chromatic="ignore"`) |
| Skipping a story | `BuildsTable/NoSnapshot` (`disableSnapshot`) |
| TurboSnap | `npm run build-storybook:turbosnap`, then `onlyChanged` (CI does both) |
| Figma review | `figma()` helper, inactive until `FIGMA_FILE_KEY` is set (no Figma file yet) |
| Unit tests (non-visual baseline) | `*.spec.tsx`, run with `npx nx test ui-verse` |

## One-time setup

1. `npm install` (adds `@storybook/addon-a11y` and `axe-playwright`; `@storybook/manager-api` and `@storybook/theming` are pinned to `7.6.19` to match Storybook).
2. Create a project at chromatic.com, copy its token, and add it as the GitHub secret `CHROMATIC_PROJECT_TOKEN`.
3. Browsers (Chrome, Firefox, Safari, Edge) are chosen in the Chromatic project settings, not in code.
4. Figma is optional and off until you set `FIGMA_FILE_KEY` in `src/lib/utils/storybook/chromatic.ts`.

## First baseline (run these yourself)

```sh
npm run build-storybook:turbosnap
CHROMATIC_PROJECT_TOKEN=<token> npm run chromatic
```

The first build has nothing to compare against, so every snapshot becomes the baseline.
Edit a component (for example the `accepted` colour in `StatusBadge.tsx`) and build again to see diffs.

## Review flow in Chromatic

1. Open the build from the PR check. Changed snapshots are listed per story, per browser, per mode.
2. Assign reviewers on the PR's UI Review. Each reviewer approves or denies each change.
3. Comment on a snapshot to start a thread; resolve it when addressed.
4. When every change is approved the build is accepted and becomes the new baseline for that branch.
5. `autoAcceptChanges: master` accepts changes automatically after merge.

## What Chromatic does not do with Figma

Chromatic compares each build with the previous accepted build. It does not diff
against Figma pixels. The design addon shows the Figma frame beside the story so a
reviewer can compare by eye.

## Optional: end-to-end snapshots

To archive Playwright or Cypress runs, add `@chromatic-com/playwright` or
`@chromatic-com/cypress` and import `test` from that package in `apps/uiverse-e2e`.
Chromatic then snapshots the DOM at the end of each test. Not installed here.

## Known gaps to check on first run

- `node_modules` was not installed when this was written, so nothing was typechecked or run.
- `--stats-json` for TurboSnap on the Vite builder depends on the Storybook 7.6 build flags; if the stats file is missing from `storybook-static`, Chromatic falls back to snapshotting everything.
- The `@chromatic-com/storybook` panel addon is not installed (compatibility with Storybook 7.6 not verified). CLI and GitHub Action work without it.
