/**
 * Individual Employee API Routes
 *
 * RESTful API endpoints for single employee operations.
 * Handles CRUD operations for individual employees by ID.
 *
 * @module api/employees/[id]
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
 * Route parameters schema
 */
const paramsSchema = z.object({
  id: z.string().min(1, "Employee ID is required"),
});

/**
 * GET /api/employees/[id]
 * Retrieve a single employee by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = paramsSchema.parse(params);

    const employee = await Employee.findOne({ id }).lean();

    if (!employee) {
      return errorResponse("Employee not found", 404, ErrorCodes.NOT_FOUND);
    }

    return successResponse(employee);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/employees/[id]
 * Update a single employee completely
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = paramsSchema.parse(params);
    const body = await request.json();

    // Validate the entire employee data
    const validatedData = employeeValidationSchema.parse(body);

    // Ensure the ID in the body matches the URL parameter
    if (validatedData.id !== id) {
      return errorResponse(
        "Employee ID in body must match URL parameter",
        400,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    const updatedEmployee = await Employee.findOneAndUpdate(
      { id },
      validatedData,
      { new: true, runValidators: true }
    );

    if (!updatedEmployee) {
      return errorResponse("Employee not found", 404, ErrorCodes.NOT_FOUND);
    }

    return successResponse(updatedEmployee);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/employees/[id]
 * Partially update a single employee
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = paramsSchema.parse(params);
    const body = await request.json();

    // Validate partial data
    const partialSchema = employeeValidationSchema.partial();
    const validatedData = partialSchema.parse(body);

    // Remove id from updates if present (shouldn't be changed via PATCH)
    const { id: _, ...updates } = validatedData;

    const updatedEmployee = await Employee.findOneAndUpdate({ id }, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedEmployee) {
      return errorResponse("Employee not found", 404, ErrorCodes.NOT_FOUND);
    }

    return successResponse(updatedEmployee);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/employees/[id]
 * Delete a single employee (soft delete by default)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = paramsSchema.parse(params);

    // Check query parameters for permanent deletion
    const url = new URL(request.url);
    const permanent = url.searchParams.get("permanent") === "true";

    let result;
    if (permanent) {
      // Permanent deletion
      result = await Employee.findOneAndDelete({ id });
      if (!result) {
        return errorResponse("Employee not found", 404, ErrorCodes.NOT_FOUND);
      }
    } else {
      // Soft delete
      result = await Employee.findOneAndUpdate(
        { id },
        { isActive: false },
        { new: true }
      );
      if (!result) {
        return errorResponse("Employee not found", 404, ErrorCodes.NOT_FOUND);
      }
    }

    return successResponse({
      id,
      deleted: true,
      permanent,
      employee: result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
