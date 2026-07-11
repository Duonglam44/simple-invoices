import { create } from "zustand";
import type { InvoiceFormInput } from "@/validation/invoice";
import type { InvoiceListItem } from "@/lib/types";

export type SelectionMode = "include" | "exclude";

interface InvoiceUiState {
  selectionMode: SelectionMode;
  selected: Record<string, InvoiceListItem>;
  toggleSelected: (invoice: InvoiceListItem) => void;
  selectAllMatching: () => void;
  clearSelected: () => void;
  isCreateOpen: boolean;
  openCreate: () => void;
  closeCreate: () => void;
  draft: InvoiceFormInput | null;
  setDraft: (draft: InvoiceFormInput) => void;
  clearDraft: () => void;
}

export const useInvoiceUiStore = create<InvoiceUiState>((set) => ({
  selectionMode: "include",
  selected: {},
  toggleSelected: (invoice) =>
    set((state) => {
      const selected = { ...state.selected };
      if (selected[invoice.invoiceId]) delete selected[invoice.invoiceId];
      else selected[invoice.invoiceId] = invoice;
      return { selected };
    }),
  selectAllMatching: () => set({ selectionMode: "exclude", selected: {} }),
  clearSelected: () => set({ selectionMode: "include", selected: {} }),
  isCreateOpen: false,
  openCreate: () => set({ isCreateOpen: true }),
  closeCreate: () => set({ isCreateOpen: false }),
  draft: null,
  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: null }),
}));

export function isRowSelected(
  mode: SelectionMode,
  selected: Record<string, unknown>,
  invoiceId: string,
): boolean {
  const inMap = Boolean(selected[invoiceId]);
  return mode === "include" ? inMap : !inMap;
}

export function selectedCount(
  mode: SelectionMode,
  selected: Record<string, unknown>,
  totalRecords: number,
): number {
  const mapSize = Object.keys(selected).length;
  return mode === "include" ? mapSize : Math.max(totalRecords - mapSize, 0);
}

export function headerSelectionState(
  mode: SelectionMode,
  selected: Record<string, unknown>,
  totalRecords: number,
): boolean | "indeterminate" {
  const count = selectedCount(mode, selected, totalRecords);
  if (totalRecords === 0 || count === 0) return false;
  return count >= totalRecords ? true : "indeterminate";
}
