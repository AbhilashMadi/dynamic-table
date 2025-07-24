import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useState, useEffect } from "react";

import { columnPresets } from "./columns";

interface UseTableStateProps<TData, TValue = any> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  globalFilter: string;
  columnFilters: any[];
}

export function useTableState<TData, TValue = any>({
  data,
  columns,
  globalFilter,
  columnFilters,
}: UseTableStateProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [viewPreset, setViewPreset] = useState("default");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: () => { },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: () => { },
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  useEffect(() => {
    const preset = columnPresets[viewPreset as keyof typeof columnPresets];
    if (preset) {
      const visibility: VisibilityState = {};
      columns.forEach((column) => {
        if ("accessorKey" in column && column.accessorKey) {
          visibility[column.accessorKey as string] = preset.includes(
            column.accessorKey as string
          );
        }
        if (column.id) {
          visibility[column.id] = preset.includes(column.id);
        }
      });
      setColumnVisibility(visibility);
    }
  }, [viewPreset, columns]);

  const selectedCount = Object.keys(rowSelection).length;
  const totalCount = data.length;

  return {
    table,
    sorting,
    setSorting,
    columnVisibility,
    setColumnVisibility,
    rowSelection,
    setRowSelection,
    viewPreset,
    setViewPreset,
    selectedCount,
    totalCount,
  };
}