import React from 'react';
import type { Preview } from '@storybook/react';
import { DirectionProvider, MantineProvider } from '@mantine/core';
import '../src/global.scss';
import '@mantine/core/styles.css';
import { THEME_MODES } from '../src/lib/utils/storybook/chromatic';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Colour scheme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
    direction: {
      description: 'Text direction',
      defaultValue: 'ltr',
      toolbar: {
        title: 'Direction',
        icon: 'transfer',
        items: ['ltr', 'rtl'],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    a11y: {
      // Check the whole page, so portalled UI (modal, popover, tooltip) is included.
      element: 'body',
      config: {
        rules: [
          // Stories render components in isolation, outside page landmarks.
          { id: 'region', enabled: false },
        ],
      },
    },
    chromatic: {
      modes: THEME_MODES,
      // Freeze CSS animations at their last frame so snapshots are stable.
      pauseAnimationAtEnd: true,
    },
  },
  decorators: [
    (Story, context) => {
      const direction = (context.globals.direction as 'ltr' | 'rtl') ?? 'ltr';
      return (
        // `key` remounts the provider when the toolbar or a Chromatic mode changes direction,
        // because DirectionProvider only reads its initial value once.
        <DirectionProvider key={direction} initialDirection={direction} detectDirection={false}>
          <MantineProvider forceColorScheme={(context.globals.theme as 'light' | 'dark') ?? 'light'}>
            <div dir={direction} style={{ padding: 16 }}>
              <Story />
            </div>
          </MantineProvider>
        </DirectionProvider>
      );
    },
  ],
};

export default preview;
