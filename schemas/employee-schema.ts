import { z } from "zod";

// Department enum based on the mock data
export const DepartmentSchema = z.enum([
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
]);

// Employee schema based on the mock data structure
export const EmployeeSchema = z.object({
  id: z.string().regex(/^EMP\d{5}$/, "Employee ID must be in format EMPxxxxx"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  department: DepartmentSchema,
  position: z.string().min(1, "Position is required"),
  salary: z.number().int().positive("Salary must be a positive number"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().length(2, "State must be 2-letter abbreviation"),
  country: z.string().default("USA"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"),
  isActive: z.boolean(),
  performanceRating: z.number().min(0).max(5).multipleOf(0.1),
  manager: z.string().min(1, "Manager is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  projects: z.number().int().min(0, "Projects count must be non-negative"),
  vacationDays: z.number().int().min(0).max(30, "Vacation days must be between 0 and 30"),
});

// Type inference
export type Employee = z.infer<typeof EmployeeSchema>;
export type Department = z.infer<typeof DepartmentSchema>;

// Array schema for multiple employees
export const EmployeesArraySchema = z.array(EmployeeSchema);

// Partial schema for updates (all fields optional except id)
export const EmployeeUpdateSchema = EmployeeSchema.partial().extend({
  id: z.string().regex(/^EMP\d{5}$/),
});

// Schema for creating new employee (without id, as it will be generated)
export const EmployeeCreateSchema = EmployeeSchema.omit({ id: true });

// Filter schema for querying employees
export const EmployeeFilterSchema = z.object({
  departments: z.array(DepartmentSchema).optional(),
  isActive: z.boolean().optional(),
  minSalary: z.number().optional(),
  maxSalary: z.number().optional(),
  minRating: z.number().min(0).max(5).optional(),
  maxRating: z.number().min(0).max(5).optional(),
  search: z.string().optional(),
  skills: z.array(z.string()).optional(),
  managers: z.array(z.string()).optional(),
  startDateFrom: z.string().optional(),
  startDateTo: z.string().optional(),
});

// Sort schema
export const EmployeeSortSchema = z.object({
  field: z.enum([
    "id",
    "firstName",
    "lastName",
    "email",
    "department",
    "position",
    "salary",
    "startDate",
    "performanceRating",
    "projects",
    "vacationDays",
  ]),
  direction: z.enum(["asc", "desc"]),
});

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
});

// Aggregate stats schema
export const EmployeeStatsSchema = z.object({
  totalEmployees: z.number().int(),
  activeEmployees: z.number().int(),
  averageSalary: z.number(),
  averageRating: z.number(),
  departmentCounts: z.record(DepartmentSchema, z.number().int()),
  skillCounts: z.record(z.string(), z.number().int()),
});

// Validation helper functions
export const validateEmployee = (data: unknown): Employee => {
  return EmployeeSchema.parse(data);
};

export const validateEmployees = (data: unknown): Employee[] => {
  return EmployeesArraySchema.parse(data);
};

export const validateEmployeeUpdate = (data: unknown) => {
  return EmployeeUpdateSchema.parse(data);
};

export const validateEmployeeCreate = (data: unknown) => {
  return EmployeeCreateSchema.parse(data);
};