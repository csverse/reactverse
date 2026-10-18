import { Button, Group } from '@mantine/core';
import { createContext, ReactNode, useContext, useState } from 'react';
import { FilterTag } from '../../atoms/filter-tag/FilterTag';
import { SearchField } from '../../molecules/search-field/SearchField';
import { StatusFilter, StatusFilterProps, StatusFilterValue } from '../../molecules/status-filter/StatusFilter';

export interface Filters {
  query: string;
  status: StatusFilterValue;
  tags: string[];
}

export const EMPTY_FILTERS: Filters = { query: '', status: 'all', tags: [] };

interface BarContext {
  filters: Filters;
  /** Bumped by Reset so the search field, which owns its text, remounts empty. */
  resets: number;
  update: (patch: Partial<Filters>) => void;
  reset: () => void;
}

const Ctx = createContext<BarContext | null>(null);

const useBar = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('FilterBar parts must be rendered inside <FilterBar>.');
  return ctx;
};

export interface FilterBarProps {
  defaultFilters?: Partial<Filters>;
  /** Called with the complete filter state after every change, including Reset. */
  onChange?: (filters: Filters) => void;
  children: ReactNode;
}

function Root({ defaultFilters, onChange, children }: FilterBarProps) {
  const [filters, setFilters] = useState<Filters>({ ...EMPTY_FILTERS, ...defaultFilters });
  const [resets, setResets] = useState(0);

  const commit = (next: Filters) => {
    setFilters(next);
    onChange?.(next);
  };

  return (
    <Ctx.Provider
      value={{
        filters,
        resets,
        update: (patch) => commit({ ...filters, ...patch }),
        reset: () => {
          setResets((n) => n + 1);
          commit(EMPTY_FILTERS);
        },
      }}
    >
      <Group role="search" aria-label="Filter builds" gap="md" align="center">
        {children}
      </Group>
    </Ctx.Provider>
  );
}

function Search() {
  const { filters, resets, update } = useBar();
  return <SearchField key={resets} defaultValue={filters.query} onChange={(query) => update({ query })} />;
}

function Status({ counts }: Pick<StatusFilterProps, 'counts'>) {
  const { filters, update } = useBar();
  return <StatusFilter counts={counts} value={filters.status} onChange={(status) => update({ status })} />;
}

function Tags() {
  const { filters, update } = useBar();
  if (filters.tags.length === 0) return null;
  return (
    <Group gap="xs" role="list" aria-label="Active filters">
      {filters.tags.map((tag) => (
        <div role="listitem" key={tag}>
          <FilterTag label={tag} onRemove={(t) => update({ tags: filters.tags.filter((x) => x !== t) })} />
        </div>
      ))}
    </Group>
  );
}

function Reset() {
  const { filters, reset } = useBar();
  const active = filters.query !== '' || filters.status !== 'all' || filters.tags.length > 0;
  if (!active) return null;
  return (
    <Button variant="subtle" size="compact-sm" onClick={reset}>
      Clear all filters
    </Button>
  );
}

export const FilterBar = Object.assign(Root, { Search, Status, Tags, Reset });

export default FilterBar;
