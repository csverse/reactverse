import type { BuildStatus } from '../badge/StatusBadge';

export interface Build {
  id: string;
  number: number;
  branch: string;
  commit: string;
  author: string;
  status: BuildStatus;
  snapshots: number;
  changes: number;
  /** Seconds. */
  duration: number;
}

export const SAMPLE_BUILDS: Build[] = [
  { id: 'b482', number: 482, branch: 'main', commit: 'a91c0de', author: 'Priya Raman', status: 'accepted', snapshots: 126, changes: 0, duration: 214 },
  { id: 'b481', number: 481, branch: 'feature/tabs-keyboard-nav', commit: '4be7721', author: 'Tomás Herrera', status: 'pending', snapshots: 126, changes: 14, duration: 247 },
  { id: 'b480', number: 480, branch: 'fix/modal-focus-trap', commit: '77d30af', author: 'Mei Lin', status: 'changed', snapshots: 118, changes: 3, duration: 198 },
  { id: 'b479', number: 479, branch: 'chore/bump-mantine-7-10', commit: 'c0ffee1', author: 'Okonkwo Adeyemi', status: 'denied', snapshots: 126, changes: 41, duration: 262 },
  { id: 'b478', number: 478, branch: 'feature/redesign-checkout-flow-with-saved-payment-methods', commit: '1f2e3d4', author: 'Sara Lindqvist', status: 'building', snapshots: 0, changes: 0, duration: 31 },
  { id: 'b477', number: 477, branch: 'main', commit: '9a8b7c6', author: 'Dev Patel', status: 'broken', snapshots: 0, changes: 0, duration: 12 },
];

export const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`;
};
