/**
 * Employee Model
 *
 * This module defines the MongoDB schema and model for Employee documents.
 * It includes comprehensive validation, indexing, and business logic methods.
 *
 * @module models/employee
 */
import mongoose, { Document, Model, Schema } from "mongoose";
import { z } from "zod";

/**
 * Zod validation schema for Employee data
 * Used for runtime validation and type inference
 */
export const employeeValidationSchema = z.object({
  id: z.string().regex(/^EMP\d{5}$/, "Employee ID must be in format EMP12345"),
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50),
  email: z.string().email("Invalid email format").toLowerCase(),
  phone: z.string().regex(/^[\d\s\-\+\(\)x]+$/, "Invalid phone format"),
  department: z.enum([
    "Engineering",
    "Customer Success",
    "Marketing",
    "Sales",
    "HR",
    "Finance",
    "Operations",
    "Product",
    "Design",
    "Legal",
  ]),
  position: z.string().min(3).max(100),
  salary: z
    .number()
    .positive("Salary must be positive")
    .int("Salary must be a whole number"),
  startDate: z.iso.datetime({ offset: false }).or(z.date()),
  birthDate: z.iso.datetime({ offset: false }).or(z.date()),
  address: z.string().max(200),
  city: z.string().max(100),
  state: z.string().length(2, "State must be 2-letter code"),
  country: z
    .string()
    .length(3, "Country must be 3-letter ISO code")
    .default("USA"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"),
  isActive: z.boolean().default(true),
  performanceRating: z.number().min(0).max(5).optional(),
  manager: z.string().optional(),
  skills: z.array(z.string()).default([]),
  projects: z.number().int().nonnegative().default(0),
  vacationDays: z.number().int().nonnegative().default(0),
});

/**
 * TypeScript interface for Employee document
 * Extends Mongoose Document for proper typing
 */
export interface IEmployee extends Document {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  salary: number;
  startDate: Date;
  birthDate: Date;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isActive: boolean;
  performanceRating?: number;
  manager?: string;
  skills: string[];
  projects: number;
  vacationDays: number;
  createdAt: Date;
  updatedAt: Date;
  // Virtual properties
  fullName: string;
  age: number;
  yearsOfService: number;
  // Instance methods
  updatePerformanceRating(rating: number): Promise<IEmployee>;
  assignManager(managerId: string): Promise<IEmployee>;
  addSkill(skill: string): Promise<IEmployee>;
  deactivate(): Promise<IEmployee>;
}

/**
 * Interface for Employee model static methods
 */
export interface IEmployeeModel extends Model<IEmployee> {
  generateEmployeeId(): Promise<string>;
}

/**
 * Employee Mongoose Schema
 * Defines the structure, validation, and behavior of Employee documents
 */
const employeeSchema = new Schema<IEmployee, IEmployeeModel>(
  {
    id: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      index: true,
      match: [/^EMP\d{5}$/, "Employee ID must be in format EMP12345"],
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      enum: {
        values: [
          "Engineering",
          "Customer Success",
          "Marketing",
          "Sales",
          "HR",
          "Finance",
          "Operations",
          "Product",
          "Design",
          "Legal",
        ],
        message: "{VALUE} is not a valid department",
      },
      index: true,
    },
    position: {
      type: String,
      required: [true, "Position is required"],
      trim: true,
      minlength: [3, "Position must be at least 3 characters"],
      maxlength: [100, "Position cannot exceed 100 characters"],
    },
    salary: {
      type: Number,
      required: [true, "Salary is required"],
      min: [0, "Salary cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Salary must be a whole number",
      },
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      index: true,
    },
    birthDate: {
      type: Date,
      required: [true, "Birth date is required"],
      validate: {
        validator: function (value: Date) {
          // Employee must be at least 18 years old
          const eighteenYearsAgo = new Date();
          eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
          return value <= eighteenYearsAgo;
        },
        message: "Employee must be at least 18 years old",
      },
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: [100, "City cannot exceed 100 characters"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
      uppercase: true,
      trim: true,
      length: [2, "State must be a 2-letter code"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      uppercase: true,
      trim: true,
      default: "USA",
      length: [3, "Country must be a 3-letter ISO code"],
    },
    zipCode: {
      type: String,
      required: [true, "ZIP code is required"],
      trim: true,
      match: [/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    performanceRating: {
      type: Number,
      min: [0, "Performance rating cannot be less than 0"],
      max: [5, "Performance rating cannot exceed 5"],
      validate: {
        validator: function (value: number) {
          // Allow increments of 0.1
          return Math.round(value * 10) / 10 === value;
        },
        message: "Performance rating must be in increments of 0.1",
      },
    },
    manager: {
      type: String,
      index: true,
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: function (skills: string[]) {
          // Ensure no duplicate skills
          return skills.length === new Set(skills).size;
        },
        message: "Skills must be unique",
      },
    },
    projects: {
      type: Number,
      default: 0,
      min: [0, "Projects count cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Projects must be a whole number",
      },
    },
    vacationDays: {
      type: Number,
      default: 0,
      min: [0, "Vacation days cannot be negative"],
      max: [365, "Vacation days cannot exceed 365"],
      validate: {
        validator: Number.isInteger,
        message: "Vacation days must be a whole number",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Indexes for optimized queries
 */
employeeSchema.index({ department: 1, isActive: 1 });
employeeSchema.index({ manager: 1, isActive: 1 });
employeeSchema.index({ startDate: 1 });
employeeSchema.index({ lastName: 1, firstName: 1 });

/**
 * Virtual property: Full name
 */
employeeSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

/**
 * Virtual property: Age
 */
employeeSchema.virtual("age").get(function () {
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
});

/**
 * Virtual property: Years of service
 */
employeeSchema.virtual("yearsOfService").get(function () {
  const today = new Date();
  const startDate = new Date(this.startDate);
  const years = today.getFullYear() - startDate.getFullYear();
  const monthDiff = today.getMonth() - startDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < startDate.getDate())
  ) {
    return years - 1;
  }

  return years;
});

/**
 * Static method: Generate unique employee ID
 */
employeeSchema.statics.generateEmployeeId = async function (): Promise<string> {
  const lastEmployee = await this.findOne().sort("-id").select("id");

  if (!lastEmployee) {
    return "EMP001";
  }

  const lastNumber = parseInt(lastEmployee.id.substring(3));
  const newNumber = lastNumber + 1;

  return `EMP${newNumber.toString().padStart(3, "0")}`;
};

/**
 * Create and export the Employee model
 */
export const Employee = (mongoose.models.Employee ||
  mongoose.model<IEmployee, IEmployeeModel>(
    "Employee",
    employeeSchema
  )) as IEmployeeModel;

/**
 * Export the inferred TypeScript type from Zod schema
 */
export type EmployeeInput = z.infer<typeof employeeValidationSchema>;
