import { Badge, Tabs } from '@mantine/core';
import type { ReactNode } from 'react';

export interface BuildTab {
  value: string;
  label: string;
  /** Shown as a badge next to the label. */
  count?: number;
  disabled?: boolean;
  content: ReactNode;
}

export interface BuildTabsProps {
  tabs: BuildTab[];
  defaultValue?: string;
  onChange?: (value: string | null) => void;
}

export function BuildTabs({ tabs, defaultValue, onChange }: BuildTabsProps) {
  return (
    <Tabs defaultValue={defaultValue ?? tabs[0]?.value} onChange={onChange}>
      <Tabs.List style={{ flexWrap: 'nowrap', overflowX: 'auto' }}>
        {tabs.map((t) => (
          <Tabs.Tab
            key={t.value}
            value={t.value}
            disabled={t.disabled}
            rightSection={
              t.count !== undefined ? (
                <Badge size="sm" variant="light">
                  {t.count}
                </Badge>
              ) : undefined
            }
          >
            {t.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {tabs.map((t) => (
        <Tabs.Panel key={t.value} value={t.value} pt="md">
          {t.content}
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}

export default BuildTabs;
