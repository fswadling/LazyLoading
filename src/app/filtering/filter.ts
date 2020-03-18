import { FilterDescriptor2 } from "./filter-descriptor-2";

export function filter<TRow>(rows: TRow[], filterDescriptors: FilterDescriptor2[]) {
  return rows.filter(row => filterFunction(row, filterDescriptors));
}

function filterFunction<TRow>(row: TRow, filterDescriptors: FilterDescriptor2[]): boolean {
  let retval = true;
  for (const filter of filterDescriptors) {
    if (!(filter.field in row)) {
      throw new Error('Filter field does not apply to this row');
    }

    const entry = row[filter.field];

    if (!filterAllowsRow(entry, filter)) {
      retval = false;
      break;
    }
  }
  return retval;
}

// note the filter object has entries for value, values and range. this is purely for JSON persistance purposes
// ideally this would be a discriminated union. Only one is intended to be used per filter. Unused entries should
// be left undefined
function filterAllowsRow<TRow>(entry: any, filter: FilterDescriptor2): boolean {
  if (filter.value) {
    return filter.value === entry;
  }

  if (filter.values) {
    return filter.values.some(value => value === entry);
  }

  if (filter.range) {
    return filter.range.from < entry && filter.range.to > entry;
  }
}