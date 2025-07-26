/**
 * API Response Utilities
 *
 * Standardized response formatting for Next.js API routes.
 * Provides consistent structure for success and error responses.
 *
 * @module lib/api-response
 */
import mongoose from "mongoose";
import { ZodError } from "zod";

import { NextResponse } from "next/server";

/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    timestamp?: string;
  };
}

/**
 * Creates a successful API response
 */
export function successResponse<T>(
  data: T,
  status: number = 200,
  meta?: ApiResponse<T>["meta"]
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    },
    { status }
  );
}

/**
 * Creates an error API response
 */
export function errorResponse(
  message: string,
  status: number = 500,
  code: string = "INTERNAL_ERROR",
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

/**
 * Handles validation errors from Zod
 */
export function validationErrorResponse(
  error: ZodError
): NextResponse<ApiResponse> {
  const details = error.issues.map((err: any) => ({
    field: err.path.join("."),
    message: err.message,
    code: err.code,
  }));

  return errorResponse("Validation failed", 400, "VALIDATION_ERROR", details);
}

/**
 * Handles MongoDB/Mongoose errors
 */
export function mongoErrorResponse(
  error: mongoose.Error
): NextResponse<ApiResponse> {
  if (error instanceof mongoose.Error.ValidationError) {
    const details = Object.values(error.errors).map((err) => ({
      field: err.path,
      message: err.message,
    }));

    return errorResponse(
      "Database validation failed",
      400,
      "DB_VALIDATION_ERROR",
      details
    );
  }

  if (error instanceof mongoose.Error.CastError) {
    return errorResponse("Invalid ID format", 400, "INVALID_ID", {
      field: error.path,
      value: error.value,
    });
  }

  // Duplicate key error
  if ("code" in error && error.code === 11000) {
    const field = Object.keys((error as any).keyPattern || {})[0] || "field";
    return errorResponse(
      `Duplicate value for ${field}`,
      409,
      "DUPLICATE_ERROR",
      { field }
    );
  }

  return errorResponse(
    "Database operation failed",
    500,
    "DB_ERROR",
    error.message
  );
}

/**
 * Generic error handler for API routes
 */
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error("API Error:", error);

  if (error instanceof ZodError) {
    return validationErrorResponse(error);
  }

  if (error instanceof mongoose.Error) {
    return mongoErrorResponse(error);
  }

  if (error instanceof Error) {
    return errorResponse(error.message, 500, "APPLICATION_ERROR");
  }

  return errorResponse("An unexpected error occurred", 500);
}

/**
 * Standardized error codes
 */
export const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  DUPLICATE_ERROR: "DUPLICATE_ERROR",
  DB_ERROR: "DB_ERROR",
  DB_VALIDATION_ERROR: "DB_VALIDATION_ERROR",
  INVALID_ID: "INVALID_ID",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  APPLICATION_ERROR: "APPLICATION_ERROR",
} as const;
