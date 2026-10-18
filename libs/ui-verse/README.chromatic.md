# Chromatic testing: step-by-step setup

Run every command from the repo root (`reactverse/`) unless it says otherwise.
For what each story demonstrates, see [CHROMATIC.md](./CHROMATIC.md).

## 1. Install dependencies

```sh
npm install
```

`@storybook/manager-api` and `@storybook/theming` are pinned to `7.6.19` in the root
`package.json` so they match Storybook 7.6. (They used to be `^8.1.3`, which npm rejected
and which broke the docs pages.) Delete `node_modules` and `package-lock.json` first if an
earlier install left a mix of versions.

Then in VS Code run **Developer: Reload Window**, so the Tailwind extension reloads
its config now that `node_modules` exists.

## 2. Check the code compiles and unit tests pass

```sh
npx nx test ui-verse
```

Every new component has a `*.spec.tsx`. Fix or report any failure before going on.

## 3. Look at the stories locally

```sh
npx nx run ui-verse:storybook
```

Open http://localhost:6006 and use the sidebar group **Review Desk**.

- The **Theme** toolbar button switches light and dark.
- The **Interactions** panel shows each `play` function step by step.
- The **Accessibility** panel shows axe results. `SettingToggle > A11yViolationDemo` should list a violation on purpose.

### What to look at in each panel

- **Interactions:** open any story whose name describes an action (`SortByBranch`,
  `ConfirmedWithButton`, `KeyboardNavigation`, ...). The panel lists each `step`,
  every assertion, and lets you rewind. Stories without a `play` function (plain
  visual states) show "No interactions"; that is expected for them.
- **Actions:** every callback prop is a spy (`src/lib/utils/storybook/spy.ts`), so each
  call is logged here. Components with callbacks: BaselineAlert `onClose`,
  SettingToggle `onChange`, BuildTabs `onChange`, AcceptChangesModal `onClose` and
  `onConfirm`, HintPopover `onChange`, BrowserMatrix `onChange`, BuildsTable
  `onSortChange`, SignInForm `onSubmit`, StatusBadge `onClick` and ReviewerAvatar `onClick`.
  The panel only lists calls that happen, so a purely visual story (nothing clicked) leaves
  it empty; open a story with a `play` function, or click in the canvas. Every callback is
  also listed under **Events** in the Controls tab and the docs table.
- **Accessibility:** axe runs on the whole page for every story (so modals and
  popovers are included). The `region` rule is off because stories are isolated
  components. `SettingToggle > A11yViolationDemo` fails on purpose.

## 4. Get a Chromatic project token

1. Sign in at https://www.chromatic.com with GitHub.
2. Open the existing ui-verse project (linked from `libs/ui-verse/README.md`), or add a new project.
3. Open **Manage > Configure** and copy the **project token**.
4. In Chromatic project settings, choose the browsers to test (Chrome, Firefox, Safari, Edge). This is where cross-browser testing is switched on; there is no code for it.
5. Turn on **Accessibility tests** in the same settings if it is offered on your plan.

## 5. Create the first baseline

```sh
npm run build-storybook
CHROMATIC_PROJECT_TOKEN=<your-token> npm run chromatic
```

The first build has nothing to compare against, so every snapshot is accepted as the
baseline. When it finishes, open the build link it prints.

## 6. Make a change and see a diff

1. Edit `src/lib/badge/StatusBadge.tsx` and change the colour for `accepted` from `green` to `teal`.
2. Run step 5 again.
3. In Chromatic the build shows **changes found**. Open it and compare each snapshot
   (per story, per browser, per light/dark mode).
4. **Accept** the changes to make them the new baseline, or **Deny** them.
5. Revert the edit, build again, and you get a diff back to the old look.

## 7. Try the review flow

On a pull request (with the CI from step 8):

1. Open the Chromatic check on the PR.
2. Assign reviewers under **UI Review**.
3. Each reviewer approves or denies every change.
4. Leave a comment on a snapshot to start a thread, then resolve it.
5. When everything is approved the build is accepted.

## 8. Turn on CI

1. In GitHub open **Settings > Secrets and variables > Actions**.
2. Add a repository secret named `CHROMATIC_PROJECT_TOKEN` with the token from step 4.
3. Chromatic only runs when the commit message contains one of these (this is how the
   repo worked originally):
   - `--publish=storybook-chromatic`: builds Storybook and publishes it to Chromatic.
   - `--publish=ui-verse --version=<x.y.z>`: builds Storybook, publishes to Chromatic,
     then builds and publishes `ui-verse` to npm.

   Example: `git commit -m "Add showcase components --publish=storybook-chromatic"`, then push to `master`.
   Commits without those flags skip Chromatic.

## 9. Figma (optional, skipped for now)

There is no Figma file yet, so nothing Figma-related is active: `figma()` in
`src/lib/utils/storybook/chromatic.ts` returns nothing while `FIGMA_FILE_KEY` is empty.
The stories are already wired for it. When a Figma file exists:

1. Set `FIGMA_FILE_KEY` in that file to the key from the Figma URL (the part after `/file/` or `/design/`).
2. In each `*.stories.tsx`, change the id passed to `figma('1:2')` to the real frame's node id.
3. Install `@storybook/addon-designs@^7.0.9` and add it to `addons` in `.storybook/main.ts`.
4. Open a story: the **Design** panel shows the Figma frame next to it.

Chromatic does not compare against Figma pixels. It compares each build with the
previous accepted build, so everything above works without Figma.

## Run the same checks in the terminal

With Storybook running (step 3), in another terminal:

```sh
npm run test-storybook
```

This runs every `play` function and then axe on each story (`.storybook/test-runner.ts`).
A story with a real accessibility violation fails with the rule, the element and a
link to the fix. Opt a story out with `parameters: { a11yTestRunner: { skip: true } }`.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `ERESOLVE` on `npm i` | Check `@storybook/*` versions in the root `package.json` all match `7.6.19`. |
| Tailwind extension: `Can't resolve '@nx/react/tailwind'` | Install finished? Reload the VS Code window. |
| Storybook fails on `@storybook/addon-a11y` | The install in step 1 did not finish; rerun it. |
| Chromatic says every story changed after a font edit | Web fonts load from Google Fonts; check the build had network access, or set `chromatic.delay` on affected stories. |
| `test-storybook` fails with accessibility violations | Expected on first run if a Mantine colour or variant misses contrast. The report names the rule and element; send it to me or fix the component. |
| `test-storybook` cannot connect | It needs a running Storybook on port 6006 (step 3) or the static build served as in the CI workflow. |

## Not set up (optional)

- `@chromatic-com/storybook` panel addon: not installed, compatibility with Storybook 7.6 unverified.
- Playwright / Cypress snapshot archiving: add `@chromatic-com/playwright` or `@chromatic-com/cypress` and use it in `apps/uiverse-e2e`.
