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
