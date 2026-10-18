import type { ReactNode } from 'react';

/**
 * Lays several states of one component side by side, each under a caption.
 * One story built from this gives Chromatic a single snapshot that shows every state,
 * so a visual regression in any of them is caught without a snapshot per state.
 */
export function StateGrid({ children, min = 220 }: { children: ReactNode; min?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`, gap: 24, alignItems: 'start' }}>
      {children}
    </div>
  );
}

export function State({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure data-state={label} style={{ margin: 0, minWidth: 0 }}>
      <figcaption style={{ font: '500 11px/1.4 ui-monospace, monospace', letterSpacing: '0.04em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 8 }}>
        {label}
      </figcaption>
      {children}
    </figure>
  );
}
