/**
 * Declares callback props as "Events" in the Controls and docs tables, with a
 * description of when each fires. Pair with `spy()` in `args` so the calls
 * also appear in the Actions panel.
 */
export const events = (docs: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(docs).map(([name, description]) => [
      name,
      { description, control: false, table: { category: 'Events' } },
    ])
  );
