/**
 * Employee Export API Route
 *
 * Handles exporting employee data in various formats (JSON, CSV).
 * Supports filtering and custom field selection.
 *
 * @module api/employees/export
 */
import { z } from "zod";

import { NextRequest } from "next/server";

import { ErrorCodes, errorResponse, handleApiError } from "@/lib/api-response";
import connectDB from "@/lib/mongodb";
import { Employee } from "@/models";

/**
 * Query parameters schema for export requests
 */
const exportQuerySchema = z.object({
  format: z.enum(["json", "csv"]).default("json"),
  department: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  fields: z.string().optional(), // Comma-separated field names
  minSalary: z.coerce.number().positive().optional(),
  maxSalary: z.coerce.number().positive().optional(),
});

/**
 * GET /api/employees/export
 * Export employee data in specified format
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const query = exportQuerySchema.parse(queryParams);

    // Build filters
    const filters: any = {};
    if (query.department) filters.department = query.department;
    if (query.isActive !== undefined) filters.isActive = query.isActive;
    if (query.minSalary || query.maxSalary) {
      filters.salary = {};
      if (query.minSalary) filters.salary.$gte = query.minSalary;
      if (query.maxSalary) filters.salary.$lte = query.maxSalary;
    }

    // Parse fields if provided
    const selectedFields = query.fields
      ? query.fields.split(",").map((f) => f.trim())
      : null;

    // Fetch data
    let employeesQuery = Employee.find(filters);

    // Apply field selection if specified
    if (selectedFields) {
      const projection = selectedFields.reduce((acc, field) => {
        acc[field] = 1;
        return acc;
      }, {} as any);
      employeesQuery = employeesQuery.select(projection);
    }

    const employees = (await employeesQuery.lean()) as any[];

    if (query.format === "csv") {
      const csvData = convertToCSV(employees, selectedFields);

      return new Response(csvData, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="employees-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // JSON format
    return new Response(JSON.stringify(employees, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="employees-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Convert employee data to CSV format
 */
function convertToCSV(
  employees: any[],
  selectedFields?: string[] | null
): string {
  if (employees.length === 0) {
    return "";
  }

  // Get headers from first employee or use selected fields
  const headers =
    selectedFields ||
    Object.keys(employees[0]).filter((key) => !["_id", "__v"].includes(key));

  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...employees.map((emp) =>
      headers
        .map((header) => {
          const value = emp[header];

          // Handle arrays and special characters
          if (Array.isArray(value)) {
            return `"${value.join("; ")}"`;
          }

          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes("\""))
          ) {
            return `"${value.replace(/"/g, "\"\"")}"`;
          }

          if (value instanceof Date) {
            return value.toISOString().split("T")[0];
          }

          return value ?? "";
        })
        .join(",")
    ),
  ].join("\n");

  return csvContent;
}

/**
 * POST /api/employees/export
 * Export specific employees by IDs
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { ids, format = "json", fields } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse(
        "Export requires an array of employee IDs",
        400,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    // Validate format
    if (!["json", "csv"].includes(format)) {
      return errorResponse(
        "Format must be either \"json\" or \"csv\"",
        400,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    // Fetch specific employees
    let employeeQuery = Employee.find({ id: { $in: ids } });

    // Apply field selection if specified
    if (fields && Array.isArray(fields)) {
      const projection = fields.reduce((acc, field) => {
        acc[field] = 1;
        return acc;
      }, {} as any);
      employeeQuery = employeeQuery.select(projection);
    }

    const employees = (await employeeQuery.lean()) as any[];

    if (format === "csv") {
      const csvData = convertToCSV(employees, fields);

      return new Response(csvData, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="selected-employees-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // JSON format
    return new Response(JSON.stringify(employees, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="selected-employees-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
