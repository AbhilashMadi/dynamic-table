import mockData from "@/mock-data.json";
import { Employee } from "@/schemas/employee-schema";

export interface EmployeeFilters {
  departments?: string[];
  status?: "all" | "active" | "inactive";
  salaryRange?: [number, number];
  ratingRange?: [number, number];
  search?: string;
}

export interface EmployeeServiceOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: EmployeeFilters;
}

export class EmployeeService {
  private static employees: Employee[] = mockData as Employee[];

  static async getEmployees(
    options: EmployeeServiceOptions = {}
  ): Promise<{ data: Employee[]; total: number }> {
    const {
      page = 0,
      pageSize = 10,
      sortBy,
      sortOrder = "asc",
      filters = {},
    } = options;

    let filteredData = [...this.employees];

    // Apply filters
    if (filters.departments && filters.departments.length > 0) {
      filteredData = filteredData.filter((emp) =>
        filters.departments!.includes(emp.department)
      );
    }

    if (filters.status && filters.status !== "all") {
      filteredData = filteredData.filter(
        (emp) => emp.isActive === (filters.status === "active")
      );
    }

    if (filters.salaryRange) {
      filteredData = filteredData.filter(
        (emp) =>
          emp.salary >= filters.salaryRange![0] &&
          emp.salary <= filters.salaryRange![1]
      );
    }

    if (filters.ratingRange) {
      filteredData = filteredData.filter(
        (emp) =>
          emp.performanceRating >= filters.ratingRange![0] &&
          emp.performanceRating <= filters.ratingRange![1]
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredData = filteredData.filter(
        (emp) =>
          emp.firstName.toLowerCase().includes(searchLower) ||
          emp.lastName.toLowerCase().includes(searchLower) ||
          emp.email.toLowerCase().includes(searchLower) ||
          emp.department.toLowerCase().includes(searchLower) ||
          emp.position.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    if (sortBy) {
      filteredData.sort((a, b) => {
        const aValue = a[sortBy as keyof Employee];
        const bValue = b[sortBy as keyof Employee];

        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    // Apply pagination
    const start = page * pageSize;
    const end = start + pageSize;
    const paginatedData = filteredData.slice(start, end);

    return {
      data: paginatedData,
      total: filteredData.length,
    };
  }

  static async addEmployee(employee: Omit<Employee, "id">): Promise<Employee> {
    const newEmployee: Employee = {
      ...employee,
      id: `EMP${String(this.employees.length + 1).padStart(3, "0")}`,
    };
    this.employees.push(newEmployee);
    return newEmployee;
  }

  static async updateEmployee(
    id: string,
    updates: Partial<Employee>
  ): Promise<Employee | null> {
    const index = this.employees.findIndex((emp) => emp.id === id);
    if (index === -1) return null;

    this.employees[index] = { ...this.employees[index], ...updates };
    return this.employees[index];
  }

  static async deleteEmployee(id: string): Promise<boolean> {
    const index = this.employees.findIndex((emp) => emp.id === id);
    if (index === -1) return false;

    this.employees.splice(index, 1);
    return true;
  }

  static async deleteMultipleEmployees(ids: string[]): Promise<number> {
    const initialLength = this.employees.length;
    this.employees = this.employees.filter((emp) => !ids.includes(emp.id));
    return initialLength - this.employees.length;
  }

  static async exportEmployees(
    format: "csv" | "json" | "excel",
    employees: Employee[]
  ): Promise<Blob> {
    switch (format) {
      case "json":
        return new Blob([JSON.stringify(employees, null, 2)], {
          type: "application/json",
        });

      case "csv": {
        const headers = Object.keys(employees[0]).join(",");
        const rows = employees.map((emp) =>
          Object.values(emp)
            .map((val) =>
              typeof val === "string" && val.includes(",") ? `"${val}"` : val
            )
            .join(",")
        );
        const csv = [headers, ...rows].join("\n");
        return new Blob([csv], { type: "text/csv" });
      }

      case "excel":
        // For now, we'll return CSV format for Excel
        // In a real app, you'd use a library like xlsx
        const headers = Object.keys(employees[0]).join("\t");
        const rows = employees.map((emp) => Object.values(emp).join("\t"));
        const tsv = [headers, ...rows].join("\n");
        return new Blob([tsv], { type: "application/vnd.ms-excel" });

      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
}
