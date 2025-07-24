import { ColumnFiltersState } from "@tanstack/react-table";

import { useEffect, useState } from "react";

import { Department } from "@/schemas/employee-schema";

export const departments: Department[] = [
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

interface UseTableFiltersReturn {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  departmentFilter: string[];
  setDepartmentFilter: (value: string[]) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  salaryRange: [number, number];
  setSalaryRange: (value: [number, number]) => void;
  ratingRange: [number, number];
  setRatingRange: (value: [number, number]) => void;
  columnFilters: ColumnFiltersState;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
}

export function useTableFilters(): UseTableFiltersReturn {
  const [globalFilter, setGlobalFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 300000]);
  const [ratingRange, setRatingRange] = useState<[number, number]>([0, 5]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  useEffect(() => {
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

    setColumnFilters(filters);
  }, [departmentFilter, statusFilter]);

  const clearAllFilters = () => {
    setDepartmentFilter([]);
    setStatusFilter("all");
    setSalaryRange([0, 300000]);
    setRatingRange([0, 5]);
  };

  const hasActiveFilters =
    departmentFilter.length > 0 ||
    statusFilter !== "all" ||
    salaryRange[0] > 0 ||
    salaryRange[1] < 300000 ||
    ratingRange[0] > 0 ||
    ratingRange[1] < 5;

  return {
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
  };
}
