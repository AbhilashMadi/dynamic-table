import {
  ColumnDef,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { useEffect, useState } from "react";

import { columnPresets } from "./columns";

interface UseTableStateProps<TData, TValue = any> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  globalFilter: string;
  columnFilters: any[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function useTableState<TData, TValue = any>({
  data,
  columns,
  globalFilter,
  columnFilters,
  pagination,
  onPageChange,
  onPageSizeChange,
}: UseTableStateProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [viewPreset, setViewPreset] = useState("default");

  // Use manual pagination if pagination prop is provided
  const manualPagination = pagination ? {
    manualPagination: true,
    pageCount: pagination.pageCount,
    onPaginationChange: (updater: any) => {
      if (typeof updater === 'function') {
        const newPaginationState = updater({
          pageIndex: pagination.page - 1,
          pageSize: pagination.pageSize,
        });
        
        if (newPaginationState.pageIndex !== pagination.page - 1 && onPageChange) {
          onPageChange(newPaginationState.pageIndex + 1);
        }
        
        if (newPaginationState.pageSize !== pagination.pageSize && onPageSizeChange) {
          onPageSizeChange(newPaginationState.pageSize);
        }
      }
    },
  } : {};

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: () => {},
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: () => {},
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      ...(pagination ? {
        pagination: {
          pageIndex: pagination.page - 1,
          pageSize: pagination.pageSize,
        },
      } : {}),
    },
    ...manualPagination,
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
  // Use server-side total if available, otherwise use client-side count
  const totalCount = pagination?.total || data.length;

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
