/**
 * Employee Statistics API Route
 *
 * Provides various statistical insights about the employee data.
 * Includes department statistics, salary insights, and performance metrics.
 *
 * @module api/employees/stats
 */
import { NextRequest } from "next/server";

import { handleApiError, successResponse } from "@/lib/api-response";
import connectDB from "@/lib/mongodb";
import { Employee } from "@/models";

/**
 * GET /api/employees/stats
 * Retrieve comprehensive employee statistics
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get all statistics in parallel
    const [
      departmentStats,
      salaryStats,
      performanceStats,
      statusStats,
      skillStats,
    ] = await Promise.all([
      getDepartmentStatistics(),
      getSalaryStatistics(),
      getPerformanceStatistics(),
      getStatusStatistics(),
      getSkillStatistics(),
    ]);

    return successResponse({
      departments: departmentStats,
      salary: salaryStats,
      performance: performanceStats,
      status: statusStats,
      skills: skillStats,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Get department-wise statistics
 */
async function getDepartmentStatistics() {
  return Employee.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: "$department",
        count: { $sum: 1 },
        avgSalary: { $avg: "$salary" },
        minSalary: { $min: "$salary" },
        maxSalary: { $max: "$salary" },
        avgPerformance: { $avg: "$performanceRating" },
        totalProjects: { $sum: "$projects" },
        avgVacationDays: { $avg: "$vacationDays" },
      },
    },
    {
      $project: {
        department: "$_id",
        _id: 0,
        count: 1,
        avgSalary: { $round: ["$avgSalary", 2] },
        minSalary: 1,
        maxSalary: 1,
        avgPerformance: { $round: ["$avgPerformance", 2] },
        totalProjects: 1,
        avgVacationDays: { $round: ["$avgVacationDays", 1] },
      },
    },
    { $sort: { count: -1 } },
  ]);
}

/**
 * Get salary statistics
 */
async function getSalaryStatistics() {
  const [overall, byDepartment] = await Promise.all([
    Employee.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          avg: { $avg: "$salary" },
          min: { $min: "$salary" },
          max: { $max: "$salary" },
          median: { $median: { input: "$salary", method: "approximate" } },
        },
      },
      {
        $project: {
          _id: 0,
          average: { $round: ["$avg", 2] },
          minimum: "$min",
          maximum: "$max",
          median: { $round: ["$median", 2] },
        },
      },
    ]),
    Employee.aggregate([
      { $match: { isActive: true } },
      {
        $bucket: {
          groupBy: "$salary",
          boundaries: [0, 50000, 75000, 100000, 125000, 200000],
          default: "200000+",
          output: {
            count: { $sum: 1 },
            avgSalary: { $avg: "$salary" },
          },
        },
      },
    ]),
  ]);

  return {
    overall: overall[0] || {},
    distribution: byDepartment,
  };
}

/**
 * Get performance statistics
 */
async function getPerformanceStatistics() {
  return Employee.aggregate([
    { $match: { isActive: true, performanceRating: { $exists: true } } },
    {
      $group: {
        _id: null,
        avg: { $avg: "$performanceRating" },
        min: { $min: "$performanceRating" },
        max: { $max: "$performanceRating" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        average: { $round: ["$avg", 2] },
        minimum: "$min",
        maximum: "$max",
        totalRated: "$count",
      },
    },
  ]);
}

/**
 * Get status statistics
 */
async function getStatusStatistics() {
  return Employee.aggregate([
    {
      $group: {
        _id: "$isActive",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        status: {
          $cond: {
            if: "$_id",
            then: "Active",
            else: "Inactive",
          },
        },
        count: 1,
        _id: 0,
      },
    },
  ]);
}

/**
 * Get top skills statistics
 */
async function getSkillStatistics() {
  return Employee.aggregate([
    { $match: { isActive: true } },
    { $unwind: "$skills" },
    {
      $group: {
        _id: "$skills",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        skill: "$_id",
        count: 1,
        _id: 0,
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);
}
