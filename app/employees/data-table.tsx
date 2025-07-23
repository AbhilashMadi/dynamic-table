"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  Download,
  Filter,
  Plus,
  RefreshCw,
  Settings2,
  Upload,
} from "lucide-react";

import * as React from "react";

import { useTheme } from "next-themes";

import RestoreIcon, { MoonIcon, SunIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Department, Employee } from "@/schemas/employee-schema";

import { columnPresets } from "./columns";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onDataChange?: (data: TData[]) => void;
  onAddNew?: () => void;
  onExport?: (format: "csv" | "json" | "excel") => void;
  onImport?: (file: File) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

const departments: Department[] = [
  "Engineering",
  "Marketing",
  "Sales",
  "HR",
  "Finance",
  "Design",
  "Product",
  "Operations",
  "Legal",
  "Customer Success",
  "Security",
];

export function DataTable<TData extends Employee, TValue>({
  columns,
  data,
  onDataChange,
  onAddNew,
  onExport,
  onImport,
  onRefresh,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [viewPreset, setViewPreset] = React.useState("default");

  // Advanced filters state
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [departmentFilter, setDepartmentFilter] = React.useState<string[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [salaryRange, setSalaryRange] = React.useState<[number, number]>([
    0, 300000,
  ]);
  const [ratingRange, setRatingRange] = React.useState<[number, number]>([
    0, 5,
  ]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  // Handle mounting for theme
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Apply view preset
  React.useEffect(() => {
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

  // Apply advanced filters
  React.useEffect(() => {
    const filters: ColumnFiltersState = [];

    if (departmentFilter.length > 0) {
      filters.push({
        id: "department",
        value: departmentFilter,
      });
    }

    if (statusFilter !== "all") {
      filters.push({
        id: "isActive",
        value: statusFilter,
      });
    }

    // Apply salary range filter
    table.getColumn("salary")?.setFilterValue((value: number) => {
      return value >= salaryRange[0] && value <= salaryRange[1];
    });

    // Apply rating range filter
    table.getColumn("performanceRating")?.setFilterValue((value: number) => {
      return value >= ratingRange[0] && value <= ratingRange[1];
    });

    setColumnFilters(filters);
  }, [departmentFilter, statusFilter, salaryRange, ratingRange, table]);

  const selectedCount = Object.keys(rowSelection).length;
  const totalCount = data.length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4">
        {/* Top toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search all columns..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="w-64"
            />
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Advanced Filters</SheetTitle>
                  <SheetDescription>
                    Filter employees by various criteria
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {/* Department filter */}
                  <div className="space-y-2">
                    <Label>Departments</Label>
                    <div className="space-y-2">
                      {departments.map((dept) => (
                        <div key={dept} className="flex items-center space-x-2">
                          <Checkbox
                            checked={departmentFilter.includes(dept)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setDepartmentFilter([
                                  ...departmentFilter,
                                  dept,
                                ]);
                              } else {
                                setDepartmentFilter(
                                  departmentFilter.filter((d) => d !== dept)
                                );
                              }
                            }}
                          />
                          <Label className="text-sm font-normal">{dept}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status filter */}
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Salary range */}
                  <div className="space-y-2">
                    <Label>Salary Range</Label>
                    <div className="text-muted-foreground flex items-center justify-between text-sm">
                      <span>${salaryRange[0].toLocaleString()}</span>
                      <span>${salaryRange[1].toLocaleString()}</span>
                    </div>
                    <Slider
                      value={salaryRange}
                      onValueChange={setSalaryRange}
                      min={0}
                      max={300000}
                      step={5000}
                      className="mt-2"
                    />
                  </div>

                  {/* Rating range */}
                  <div className="space-y-2">
                    <Label>Performance Rating</Label>
                    <div className="text-muted-foreground flex items-center justify-between text-sm">
                      <span>{ratingRange[0].toFixed(1)}</span>
                      <span>{ratingRange[1].toFixed(1)}</span>
                    </div>
                    <Slider
                      value={ratingRange}
                      onValueChange={setRatingRange}
                      min={0}
                      max={5}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>

                  {/* Clear filters */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDepartmentFilter([]);
                      setStatusFilter("all");
                      setSalaryRange([0, 300000]);
                      setRatingRange([0, 5]);
                    }}
                    className="w-full"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-2">
            {/* View preset selector */}
            {mounted ? (
              <Tabs value={theme || "system"} onValueChange={setTheme}>
                <TabsList>
                  <TabsTrigger value="light">
                    <SunIcon className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="dark">
                    <MoonIcon className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="system">
                    <RestoreIcon className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            ) : (
              <div className="h-9 w-[150px]" />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="mr-2 h-4 w-4" />
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>View Preset</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={viewPreset}
                  onValueChange={setViewPreset}
                >
                  <DropdownMenuRadioItem value="default">
                    Default
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="detailed">
                    Detailed
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="compact">
                    Compact
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Column visibility */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Export */}
            {onExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onExport("csv")}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport("json")}>
                    Export as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport("excel")}>
                    Export as Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Import */}
            {onImport && (
              <Button variant="outline" size="sm" asChild>
                <label>
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv,.json,.xlsx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onImport(file);
                    }}
                  />
                </label>
              </Button>
            )}

            {/* Refresh */}
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw
                  className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")}
                />
                Refresh
              </Button>
            )}

            {/* Add new */}
            {onAddNew && (
              <Button onClick={onAddNew} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            )}
          </div>
        </div>

        {/* Selection info */}
        {selectedCount > 0 && (
          <div className="bg-muted flex items-center justify-between rounded-lg px-4 py-2">
            <div className="text-muted-foreground text-sm">
              {selectedCount} of {totalCount} row(s) selected
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRowSelection({})}
              >
                Clear selection
              </Button>
              <Button variant="destructive" size="sm">
                Delete selected
              </Button>
            </div>
          </div>
        )}

        {/* Active filters */}
        {(departmentFilter.length > 0 ||
          statusFilter !== "all" ||
          salaryRange[0] > 0 ||
          salaryRange[1] < 300000 ||
          ratingRange[0] > 0 ||
          ratingRange[1] < 5) && (
          <div className="flex flex-wrap gap-2">
            {departmentFilter.map((dept) => (
              <Badge
                key={dept}
                variant="secondary"
                className="cursor-pointer"
                onClick={() =>
                  setDepartmentFilter(
                    departmentFilter.filter((d) => d !== dept)
                  )
                }
              >
                {dept} ×
              </Badge>
            ))}
            {statusFilter !== "all" && (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => setStatusFilter("all")}
              >
                Status: {statusFilter} ×
              </Badge>
            )}
            {(salaryRange[0] > 0 || salaryRange[1] < 300000) && (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => setSalaryRange([0, 300000])}
              >
                Salary: ${salaryRange[0].toLocaleString()} - $
                {salaryRange[1].toLocaleString()} ×
              </Badge>
            )}
            {(ratingRange[0] > 0 || ratingRange[1] < 5) && (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => setRatingRange([0, 5])}
              >
                Rating: {ratingRange[0].toFixed(1)} -{" "}
                {ratingRange[1].toFixed(1)} ×
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Table */}
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

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          Showing{" "}
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}{" "}
          to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            totalCount
          )}{" "}
          of {totalCount} results
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              Last
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
