"use client";

import { ColumnDef, flexRender } from "@tanstack/react-table";

import * as React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Employee } from "@/schemas/employee-schema";

import { FilterBadges } from "./filter-badges";
import { SelectionBar } from "./selection-bar";
import { TablePagination } from "./table-pagination";
import { TableToolbar } from "./table-toolbar";
import { useTableFilters } from "./use-table-filters";
import { useTableState } from "./use-table-state";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onDataChange?: (data: TData[]) => void;
  onAddNew?: () => void;
  onExport?: (format: "csv" | "json" | "excel") => void;
  onImport?: (file: File) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function DataTable<TData extends Employee, TValue>({
  columns,
  data,
  onAddNew,
  onExport,
  onImport,
  onRefresh,
  isLoading = false,
  pagination,
  onPageChange,
  onPageSizeChange,
  searchQuery = "",
  onSearchChange,
}: DataTableProps<TData, TValue>) {
  const [filterOpen, setFilterOpen] = React.useState(false);

  const {
    globalFilter,
    setGlobalFilter,
    departmentFilter,
    setDepartmentFilter,
    statusFilter,
    setStatusFilter,
    salaryRange,
    setSalaryRange,
    ratingRange,
    setRatingRange,
    columnFilters,
    clearAllFilters,
    hasActiveFilters,
  } = useTableFilters();

  // Use server-side search if onSearchChange is provided
  React.useEffect(() => {
    if (onSearchChange && globalFilter !== searchQuery) {
      setGlobalFilter(searchQuery);
    }
  }, [searchQuery, onSearchChange, setGlobalFilter]);

  const handleGlobalFilterChange = (value: string) => {
    setGlobalFilter(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const {
    table,
    rowSelection,
    setRowSelection,
    viewPreset,
    setViewPreset,
    selectedCount,
    totalCount,
  } = useTableState({
    data,
    columns,
    globalFilter,
    columnFilters,
    pagination,
    onPageChange,
    onPageSizeChange,
  });

  // Apply custom filters for salary and rating ranges
  React.useEffect(() => {
    table.getColumn("salary")?.setFilterValue((value: number) => {
      return value >= salaryRange[0] && value <= salaryRange[1];
    });

    table.getColumn("performanceRating")?.setFilterValue((value: number) => {
      return value >= ratingRange[0] && value <= ratingRange[1];
    });
  }, [salaryRange, ratingRange, table]);

  const handleDeleteSelected = () => {
    console.log("Delete selected rows:", Object.keys(rowSelection));
    // Implement delete logic here
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <TableToolbar
          globalFilter={globalFilter}
          onGlobalFilterChange={handleGlobalFilterChange}
          viewPreset={viewPreset}
          onViewPresetChange={setViewPreset}
          filterOpen={filterOpen}
          onFilterOpenChange={setFilterOpen}
          table={table}
          onAddNew={onAddNew}
          onExport={onExport}
          onImport={onImport}
          onRefresh={onRefresh}
          isLoading={isLoading}
          departmentFilter={departmentFilter}
          onDepartmentFilterChange={setDepartmentFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          salaryRange={salaryRange}
          onSalaryRangeChange={setSalaryRange}
          ratingRange={ratingRange}
          onRatingRangeChange={setRatingRange}
          onClearAllFilters={clearAllFilters}
        />

        <SelectionBar
          selectedCount={selectedCount}
          totalCount={totalCount}
          onClearSelection={() => setRowSelection({})}
          onDeleteSelected={handleDeleteSelected}
        />

        {hasActiveFilters && (
          <FilterBadges
            departmentFilter={departmentFilter}
            onRemoveDepartment={(dept) =>
              setDepartmentFilter(departmentFilter.filter((d) => d !== dept))
            }
            statusFilter={statusFilter}
            onRemoveStatus={() => setStatusFilter("all")}
            salaryRange={salaryRange}
            onRemoveSalaryRange={() => setSalaryRange([0, 300000])}
            ratingRange={ratingRange}
            onRemoveRatingRange={() => setRatingRange([0, 5])}
          />
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {isLoading ? "Loading..." : "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination table={table} totalCount={totalCount} />
    </div>
  );
}
