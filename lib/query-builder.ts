import {
  ActiveFilter,
  FILTER_DEFINITIONS,
  FilterDefinition,
  QueryFilter,
} from "./filters";

export interface GeneratedQuery {
  filters: QueryFilter[];
  sort?: Array<{
    field: string;
    order: "asc" | "desc";
  }>;
}

export interface QueryParams {
  [key: string]: string | string[];
}

export interface QueryPayload {
  query: GeneratedQuery;
  timestamp: string;
}

export function generateQuery(activeFilters: ActiveFilter[]): GeneratedQuery {
  const filters: QueryFilter[] = [];
  const sortFields: Array<{ field: string; order: "asc" | "desc" }> = [];

  activeFilters.forEach((activeFilter) => {
    const filterDef = FILTER_DEFINITIONS.find(
      (def) => def.id === activeFilter.filterId
    );
    if (!filterDef) return;

    // Add filter
    filters.push({
      field: filterDef.field,
      operator: activeFilter.operator,
      value: activeFilter.value,
      sortOrder: activeFilter.sortOrder,
    });

    // Add sort if specified
    if (activeFilter.sortOrder) {
      sortFields.push({
        field: filterDef.field,
        order: activeFilter.sortOrder,
      });
    }
  });

  const query: GeneratedQuery = { filters };
  if (sortFields.length > 0) {
    query.sort = sortFields;
  }

  return query;
}

export function generateQueryParams(
  activeFilters: ActiveFilter[]
): QueryParams {
  const params: QueryParams = {};

  activeFilters.forEach((activeFilter, index) => {
    const filterDef = FILTER_DEFINITIONS.find(
      (def) => def.id === activeFilter.filterId
    );
    if (!filterDef) return;

    const prefix = `filter_${index}`;
    params[`${prefix}_field`] = filterDef.field;
    params[`${prefix}_operator`] = activeFilter.operator;
    params[`${prefix}_value`] = String(activeFilter.value);

    if (activeFilter.sortOrder) {
      params[`${prefix}_sort`] = activeFilter.sortOrder;
    }
  });

  return params;
}

export function generateQueryPayload(
  activeFilters: ActiveFilter[]
): QueryPayload {
  return {
    query: generateQuery(activeFilters),
    timestamp: new Date().toISOString(),
  };
}

export function validateFilterValue(
  filter: ActiveFilter,
  filterDef: FilterDefinition
): boolean {
  if (!filter.value && filter.value !== 0 && filter.value !== false) {
    return false;
  }

  switch (filterDef.type) {
    case "number":
      return !isNaN(Number(filter.value));

    case "date":
      return !isNaN(Date.parse(filter.value));

    case "boolean":
      return typeof filter.value === "boolean";

    case "array":
      return Array.isArray(filter.value) || typeof filter.value === "string";

    case "text":
    case "select":
    default:
      return typeof filter.value === "string" && filter.value.length > 0;
  }
}

export function getFilterById(filterId: string): FilterDefinition | undefined {
  return FILTER_DEFINITIONS.find((def) => def.id === filterId);
}

export function createActiveFilter(filterId: string): ActiveFilter {
  const filterDef = getFilterById(filterId);
  if (!filterDef) {
    throw new Error(`Filter definition not found for id: ${filterId}`);
  }

  return {
    id: `${filterId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    filterId,
    operator: filterDef.defaultOperator,
    value: getDefaultValueForType(filterDef.type),
    sortOrder: undefined,
  };
}

function getDefaultValueForType(
  type: string
): string | number | boolean | string[] {
  switch (type) {
    case "number":
      return 0;
    case "boolean":
      return true;
    case "date":
      return new Date().toISOString().split("T")[0];
    case "array":
      return [];
    case "text":
    case "select":
    default:
      return "";
  }
}

export function logQuery(
  activeFilters: ActiveFilter[],
  format: "params" | "payload" = "payload"
): void {
  console.group("🔍 Query Builder Output");

  if (format === "params") {
    const params = generateQueryParams(activeFilters);
    console.log("Query Parameters:", params);
  } else {
    const payload = generateQueryPayload(activeFilters);
    console.log("Query Payload:", payload);
  }

  console.log("Active Filters:", activeFilters);
  console.groupEnd();
}
