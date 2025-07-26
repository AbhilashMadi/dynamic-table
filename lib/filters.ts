export type FilterType = "text" | "number" | "date" | "boolean" | "array" | "select";

export type FilterOperator = 
  | "equals" 
  | "not_equals"
  | "contains" 
  | "not_contains"
  | "starts_with"
  | "ends_with"
  | "greater_than" 
  | "less_than"
  | "greater_than_or_equal"
  | "less_than_or_equal"
  | "in"
  | "not_in"
  | "is_true"
  | "is_false"
  | "before"
  | "after"
  | "between";

export interface FilterDefinition {
  id: string;
  label: string;
  description: string;
  type: FilterType;
  field: string;
  operators: FilterOperator[];
  defaultOperator: FilterOperator;
  options?: string[]; // For select/array types
}

export interface ActiveFilter {
  id: string;
  filterId: string;
  operator: FilterOperator;
  value: string | number | boolean | string[] | undefined;
  sortOrder?: "asc" | "desc";
}

export interface QueryFilter {
  field: string;
  operator: FilterOperator;
  value: string | number | boolean | string[] | undefined;
  sortOrder?: "asc" | "desc";
}

export const FILTER_DEFINITIONS: FilterDefinition[] = [
  // Personal Information
  {
    id: "firstName",
    label: "First Name",
    description: "Filter by employee first name",
    type: "text",
    field: "firstName",
    operators: ["equals", "not_equals", "contains", "not_contains", "starts_with", "ends_with"],
    defaultOperator: "contains"
  },
  {
    id: "lastName",
    label: "Last Name", 
    description: "Filter by employee last name",
    type: "text",
    field: "lastName",
    operators: ["equals", "not_equals", "contains", "not_contains", "starts_with", "ends_with"],
    defaultOperator: "contains"
  },
  {
    id: "email",
    label: "Email",
    description: "Filter by employee email address",
    type: "text",
    field: "email",
    operators: ["equals", "not_equals", "contains", "not_contains", "starts_with", "ends_with"],
    defaultOperator: "contains"
  },
  {
    id: "phone",
    label: "Phone",
    description: "Filter by employee phone number",
    type: "text",
    field: "phone",
    operators: ["equals", "not_equals", "contains", "not_contains"],
    defaultOperator: "contains"
  },
  
  // Work Information
  {
    id: "department",
    label: "Department",
    description: "Filter by employee department",
    type: "select",
    field: "department",
    operators: ["equals", "not_equals", "in", "not_in"],
    defaultOperator: "equals",
    options: ["Customer Success", "Marketing", "Operations", "Engineering", "Design", "Legal", "Finance", "HR", "Product", "Security", "Sales"]
  },
  {
    id: "position",
    label: "Position",
    description: "Filter by employee job position/title",
    type: "text",
    field: "position",
    operators: ["equals", "not_equals", "contains", "not_contains"],
    defaultOperator: "contains"
  },
  {
    id: "manager",
    label: "Manager",
    description: "Filter by employee manager",
    type: "text",
    field: "manager",
    operators: ["equals", "not_equals", "contains", "not_contains"],
    defaultOperator: "contains"
  },
  {
    id: "salary",
    label: "Salary",
    description: "Filter by employee salary amount",
    type: "number",
    field: "salary",
    operators: ["equals", "not_equals", "greater_than", "less_than", "greater_than_or_equal", "less_than_or_equal", "between"],
    defaultOperator: "greater_than_or_equal"
  },
  {
    id: "startDate",
    label: "Start Date",
    description: "Filter by employee start date",
    type: "date",
    field: "startDate",
    operators: ["equals", "not_equals", "before", "after", "between"],
    defaultOperator: "after"
  },
  {
    id: "birthDate",
    label: "Birth Date",
    description: "Filter by employee birth date",
    type: "date",
    field: "birthDate",
    operators: ["equals", "not_equals", "before", "after", "between"],
    defaultOperator: "before"
  },
  
  // Location
  {
    id: "city",
    label: "City",
    description: "Filter by employee city",
    type: "text",
    field: "city",
    operators: ["equals", "not_equals", "contains", "not_contains"],
    defaultOperator: "equals"
  },
  {
    id: "state",
    label: "State",
    description: "Filter by employee state",
    type: "text",
    field: "state",
    operators: ["equals", "not_equals", "in", "not_in"],
    defaultOperator: "equals"
  },
  {
    id: "country",
    label: "Country",
    description: "Filter by employee country",
    type: "text",
    field: "country",
    operators: ["equals", "not_equals"],
    defaultOperator: "equals"
  },
  {
    id: "zipCode",
    label: "ZIP Code",
    description: "Filter by employee ZIP/postal code",
    type: "text",
    field: "zipCode",
    operators: ["equals", "not_equals", "starts_with"],
    defaultOperator: "starts_with"
  },
  
  // Performance & Status
  {
    id: "isActive",
    label: "Active Status",
    description: "Filter by employee active status",
    type: "boolean",
    field: "isActive",
    operators: ["is_true", "is_false"],
    defaultOperator: "is_true"
  },
  {
    id: "performanceRating",
    label: "Performance Rating",
    description: "Filter by employee performance rating (1-5)",
    type: "number",
    field: "performanceRating",
    operators: ["equals", "not_equals", "greater_than", "less_than", "greater_than_or_equal", "less_than_or_equal", "between"],
    defaultOperator: "greater_than_or_equal"
  },
  {
    id: "projects",
    label: "Projects Count",
    description: "Filter by number of projects assigned",
    type: "number",
    field: "projects",
    operators: ["equals", "not_equals", "greater_than", "less_than", "greater_than_or_equal", "less_than_or_equal", "between"],
    defaultOperator: "greater_than_or_equal"
  },
  {
    id: "vacationDays",
    label: "Vacation Days",
    description: "Filter by number of vacation days",
    type: "number",
    field: "vacationDays",
    operators: ["equals", "not_equals", "greater_than", "less_than", "greater_than_or_equal", "less_than_or_equal", "between"],
    defaultOperator: "greater_than_or_equal"
  },
  {
    id: "skills",
    label: "Skills",
    description: "Filter by employee skills and competencies",
    type: "array",
    field: "skills",
    operators: ["contains", "not_contains", "in", "not_in"],
    defaultOperator: "contains"
  }
];

export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  equals: "Equals",
  not_equals: "Not Equals",
  contains: "Contains",
  not_contains: "Does Not Contain",
  starts_with: "Starts With",
  ends_with: "Ends With",
  greater_than: "Greater Than",
  less_than: "Less Than",
  greater_than_or_equal: "Greater Than or Equal",
  less_than_or_equal: "Less Than or Equal",
  in: "In",
  not_in: "Not In",
  is_true: "Is True",
  is_false: "Is False",
  before: "Before",
  after: "After",
  between: "Between"
};