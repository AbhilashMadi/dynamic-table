"use client";

import {
  ChevronDown,
  Download,
  Filter,
  Plus,
  RefreshCw,
  Settings2,
  Upload,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import RestoreIcon, { MoonIcon, SunIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { AdvancedFilters } from "./advanced-filters";

interface TableToolbarProps {
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  viewPreset: string;
  onViewPresetChange: (value: string) => void;
  filterOpen: boolean;
  onFilterOpenChange: (open: boolean) => void;
  table: any;
  onAddNew?: () => void;
  onExport?: (format: "csv" | "json" | "excel") => void;
  onImport?: (file: File) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  departmentFilter: string[];
  onDepartmentFilterChange: (value: string[]) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  salaryRange: [number, number];
  onSalaryRangeChange: (value: [number, number]) => void;
  ratingRange: [number, number];
  onRatingRangeChange: (value: [number, number]) => void;
  onClearAllFilters: () => void;
}

export function TableToolbar({
  globalFilter,
  onGlobalFilterChange,
  viewPreset,
  onViewPresetChange,
  filterOpen,
  onFilterOpenChange,
  table,
  onAddNew,
  onExport,
  onImport,
  onRefresh,
  isLoading = false,
  departmentFilter,
  onDepartmentFilterChange,
  statusFilter,
  onStatusFilterChange,
  salaryRange,
  onSalaryRangeChange,
  ratingRange,
  onRatingRangeChange,
  onClearAllFilters,
}: TableToolbarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search all columns..."
          value={globalFilter}
          onChange={(event) => onGlobalFilterChange(event.target.value)}
          className="w-64"
        />
        <Sheet open={filterOpen} onOpenChange={onFilterOpenChange}>
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
            <AdvancedFilters
              departmentFilter={departmentFilter}
              onDepartmentFilterChange={onDepartmentFilterChange}
              statusFilter={statusFilter}
              onStatusFilterChange={onStatusFilterChange}
              salaryRange={salaryRange}
              onSalaryRangeChange={onSalaryRangeChange}
              ratingRange={ratingRange}
              onRatingRangeChange={onRatingRangeChange}
              onClearAllFilters={onClearAllFilters}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-2">
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
              onValueChange={onViewPresetChange}
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
              .filter((column: any) => column.getCanHide())
              .map((column: any) => {
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

        {onAddNew && (
          <Button onClick={onAddNew} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        )}
      </div>
    </div>
  );
}