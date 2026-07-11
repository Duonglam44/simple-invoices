import { DEFAULT_ORDERING, DEFAULT_SORT_BY } from "@/constants/invoice";

export { DEFAULT_SORT_BY, DEFAULT_ORDERING };

export interface SortState {
  sortBy: string;
  ordering: "ASCENDING" | "DESCENDING";
}

export function nextSort(current: SortState, field: string): SortState {
  if (current.sortBy !== field) {
    return { sortBy: field, ordering: DEFAULT_ORDERING };
  }
  return {
    sortBy: field,
    ordering: current.ordering === "DESCENDING" ? "ASCENDING" : "DESCENDING",
  };
}

/** Reads the current sort state from URL search params, with defaults. */
export function sortStateFromParams(params: URLSearchParams): SortState {
  return {
    sortBy: params.get("sortBy") ?? DEFAULT_SORT_BY,
    ordering: params.get("ordering") === "ASCENDING" ? "ASCENDING" : "DESCENDING",
  };
}
