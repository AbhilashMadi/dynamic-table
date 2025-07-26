"use client";

import { useEffect, useState } from "react";

import { useDebounce } from "@/lib/use-debounce";
import { Employee } from "@/schemas/employee-schema";

import { columns } from "./(employees)/columns";
import { DataTable } from "./(employees)/data-table";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    pageCount: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchEmployees = async (
    page: number = 1,
    pageSize: number = 10,
    search?: string
  ) => {
    try {
      setIsLoading(true);

      // Get filters from localStorage
      const savedFilters = localStorage.getItem("employeeFilters");

      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
      });

      if (savedFilters) {
        params.append("filters", savedFilters);
      }

      // Add search query if provided
      if (search) {
        params.append("search", search);
      }

      const response = await fetch(`/api/employees?${params}`);
      const data = await response.json();

      if (data.success) {
        setEmployees(data.data);

        // Update pagination from API response
        if (data.meta?.pagination) {
          setPagination({
            page: data.meta.pagination.page,
            pageSize: data.meta.pagination.limit,
            total: data.meta.pagination.total,
            pageCount: data.meta.pagination.pages,
          });
        }
      } else {
        console.error("Failed to fetch employees:", data.error);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(pagination.page, pagination.pageSize);
  }, []);

  useEffect(() => {
    if (debouncedSearchQuery !== undefined) {
      fetchEmployees(1, pagination.pageSize, debouncedSearchQuery);
    }
  }, [debouncedSearchQuery]);

  const handlePageChange = (newPage: number) => {
    fetchEmployees(newPage, pagination.pageSize, debouncedSearchQuery);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    // When page size changes, reset to page 1
    fetchEmployees(1, newPageSize, debouncedSearchQuery);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <main className="flex-center min-h-dvh">
      <DataTable
        columns={columns}
        data={employees}
        onAddNew={() => console.log("Add new employee")}
        onExport={(format) => console.log(`Export as ${format}`)}
        onImport={(file) => console.log("Import file:", file.name)}
        onRefresh={() =>
          fetchEmployees(
            pagination.page,
            pagination.pageSize,
            debouncedSearchQuery
          )
        }
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
      />
    </main>
  );
}
