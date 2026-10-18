/**
 * Shared Chromatic parameters. Modes are theme x viewport combinations;
 * each mode listed on a story produces one snapshot per browser.
 */
export const MODES = {
  light: { theme: 'light' },
  dark: { theme: 'dark' },
  'light-mobile': { theme: 'light', viewport: 320 },
  'dark-mobile': { theme: 'dark', viewport: 320 },
  'light-tablet': { theme: 'light', viewport: 768 },
  'light-desktop': { theme: 'light', viewport: 1200 },
  'dark-desktop': { theme: 'dark', viewport: 1200 },
  'light-rtl': { theme: 'light', direction: 'rtl' },
  'dark-rtl': { theme: 'dark', direction: 'rtl' },
} as const;

/** Light + dark at default width: the baseline for every story. */
export const THEME_MODES = {
  light: MODES.light,
  dark: MODES.dark,
};

/** Light and dark across mobile, tablet and desktop. */
export const RESPONSIVE_MODES = {
  'light-mobile': MODES['light-mobile'],
  'dark-mobile': MODES['dark-mobile'],
  'light-tablet': MODES['light-tablet'],
  'light-desktop': MODES['light-desktop'],
  'dark-desktop': MODES['dark-desktop'],
};

/**
 * Set this to your Figma file key to turn on the Design panel. While it is
 * empty, `figma()` adds nothing, so stories carry no Figma links.
 * Chromatic does not diff against Figma; the panel only shows the frame
 * beside the story for reviewers.
 */
export const FIGMA_FILE_KEY = '';

export const figma = (frame: string) =>
  FIGMA_FILE_KEY
    ? {
        design: {
          type: 'figma' as const,
          url: `https://www.figma.com/file/${FIGMA_FILE_KEY}/ui-verse?node-id=${encodeURIComponent(
            frame
          )}`,
        },
      }
    : {};

/** Right-to-left layout in both themes, for components whose layout is directional. */
export const RTL_MODES = {
  'light-rtl': MODES['light-rtl'],
  'dark-rtl': MODES['dark-rtl'],
};

/** Responsive modes plus right-to-left. Use on the states matrix of directional components. */
export const MATRIX_RTL_MODES = { ...RESPONSIVE_MODES, ...RTL_MODES };

/** Alias used by states-matrix stories: the widest, most useful set of snapshots for one story. */
export const MATRIX_MODES = RESPONSIVE_MODES;

/**
 * For stories that test behaviour only (keyboard, naming, callbacks) and look the same as another
 * story. They still run their `play` function in the test-runner; Chromatic just does not
 * photograph them, which keeps the snapshot count to distinct visual states.
 */
export const BEHAVIOUR_ONLY = { chromatic: { disableSnapshot: true } };
