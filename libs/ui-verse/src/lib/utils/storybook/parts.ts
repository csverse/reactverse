import type { ComponentType } from 'react';

/**
 * Storybook types `subcomponents` as components with unknown props, which rejects
 * compound parts that declare their own. The cast only satisfies that type.
 */
export const parts = (components: Record<string, unknown>) =>
  components as Record<string, ComponentType<unknown>>;
