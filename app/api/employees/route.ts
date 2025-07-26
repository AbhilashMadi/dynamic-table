/**
 * Employee API Routes
 *
 * RESTful API endpoints for employee management with full CRUD operations.
 * Supports pagination, filtering, search, and bulk operations.
 *
 * @module api/employees
 */
import { z } from "zod";

import { NextRequest } from "next/server";

import {
  ErrorCodes,
  errorResponse,
  handleApiError,
  successResponse,
} from "@/lib/api-response";
import connectDB from "@/lib/mongodb";
import {
  Employee,
  type EmployeeInput,
  employeeValidationSchema,
} from "@/models";

/**
 * Query parameters schema for GET requests
 */
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  department: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  minSalary: z.coerce.number().positive().optional(),
  maxSalary: z.coerce.number().positive().optional(),
  skills: z.string().optional(),
  sortBy: z
    .enum(["firstName", "lastName", "salary", "startDate", "department"])
    .default("lastName"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

/**
 * GET /api/employees
 * Retrieve employees with pagination, filtering, and search
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const query = querySchema.parse(queryParams);

    // Parse skills if provided
    const skills = query.skills
      ? query.skills.split(",").map((s) => s.trim())
      : undefined;

    // Build query filters
    const filters: any = {};
    if (query.isActive !== undefined) filters.isActive = query.isActive;
    if (query.department) filters.department = query.department;
    if (query.search) {
      filters.$or = [
        { firstName: { $regex: query.search, $options: "i" } },
        { lastName: { $regex: query.search, $options: "i" } },
        { email: { $regex: query.search, $options: "i" } },
        { id: { $regex: query.search, $options: "i" } },
      ];
    }
    if (query.minSalary || query.maxSalary) {
      filters.salary = {};
      if (query.minSalary) filters.salary.$gte = query.minSalary;
      if (query.maxSalary) filters.salary.$lte = query.maxSalary;
    }
    if (skills && skills.length > 0) {
      filters.skills = { $in: skills };
    }

    // Apply sorting
    const sortOrder = query.sortOrder === "desc" ? -1 : 1;
    const sortQuery: any = {};
    sortQuery[query.sortBy] = sortOrder;

    const skip = (query.page - 1) * query.limit;

    const [employees, total] = await Promise.all([
      Employee.find(filters)
        .sort(sortQuery)
        .skip(skip)
        .limit(query.limit)
        .lean(),
      Employee.countDocuments(filters),
    ]);

    return successResponse(employees, 200, {
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/employees
 * Create new employee(s) - supports single employee or bulk creation
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Check if it's bulk creation (array) or single employee
    const isBulk = Array.isArray(body);
    const employeesData = isBulk ? body : [body];

    // Validate each employee data
    const validatedEmployees: EmployeeInput[] = [];
    for (const employeeData of employeesData) {
      try {
        const validatedEmployee = employeeValidationSchema.parse(employeeData);
        validatedEmployees.push(validatedEmployee);
      } catch (err) {
        return handleApiError(err);
      }
    }

    // Generate IDs for employees that don't have them
    const employeesWithIds = await Promise.all(
      validatedEmployees.map(async (emp) => {
        if (!emp.id || emp.id === "") {
          const newId = await Employee.generateEmployeeId();
          return { ...emp, id: newId };
        }
        return emp;
      })
    );

    // Create employees
    let createdEmployees;
    if (isBulk) {
      createdEmployees = await Employee.insertMany(employeesWithIds);
    } else {
      const employee = new Employee(employeesWithIds[0]);
      createdEmployees = [await employee.save()];
    }

    const response = isBulk ? createdEmployees : createdEmployees[0];

    return successResponse(response, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/employees
 * Bulk update employees
 */
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    if (!Array.isArray(body)) {
      return errorResponse(
        "Bulk update requires an array of employee updates",
        400,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    const updateSchema = z.object({
      id: z.string(),
      updates: employeeValidationSchema.partial(),
    });

    const updates = body.map((item) => updateSchema.parse(item));
    const results = [];

    for (const { id, updates: employeeUpdates } of updates) {
      const updatedEmployee = await Employee.findOneAndUpdate(
        { id },
        employeeUpdates,
        { new: true, runValidators: true }
      );

      if (!updatedEmployee) {
        results.push({ id, success: false, error: "Employee not found" });
      } else {
        results.push({ id, success: true, data: updatedEmployee });
      }
    }

    return successResponse(results);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/employees
 * Bulk delete employees (soft delete by setting isActive to false)
 */
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { ids, permanent = false } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse(
        "Delete operation requires an array of employee IDs",
        400,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    let result;
    if (permanent) {
      // Permanent deletion
      result = await Employee.deleteMany({ id: { $in: ids } });
    } else {
      // Soft delete
      result = await Employee.updateMany(
        { id: { $in: ids } },
        { isActive: false }
      );
    }

    const count = permanent
      ? (result as any).deletedCount
      : (result as any).modifiedCount;

    return successResponse({
      deletedCount: count,
      permanent,
      ids,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
