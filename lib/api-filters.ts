import { ActiveFilter, FilterOperator, FILTER_DEFINITIONS } from "./filters";

export function applyFilters<T extends Record<string, any>>(
  data: T[],
  filters: ActiveFilter[]
): T[] {
  if (!filters || filters.length === 0) {
    return data;
  }

  return data.filter(item => {
    return filters.every(filter => {
      // Get the actual field name from the filter definition
      const filterDef = FILTER_DEFINITIONS.find(def => def.id === filter.filterId);
      if (!filterDef) return true;
      
      const fieldValue = item[filterDef.field];
      const filterValue = filter.value;

      if (fieldValue === undefined || fieldValue === null) {
        return false;
      }

      switch (filter.operator) {
        case "equals":
          return fieldValue == filterValue;
        
        case "not_equals":
          return fieldValue != filterValue;
        
        case "contains":
          if (Array.isArray(fieldValue)) {
            return Array.isArray(filterValue) 
              ? filterValue.some(v => fieldValue.includes(v))
              : fieldValue.includes(filterValue);
          }
          return String(fieldValue).toLowerCase().includes(String(filterValue).toLowerCase());
        
        case "not_contains":
          if (Array.isArray(fieldValue)) {
            return Array.isArray(filterValue) 
              ? !filterValue.some(v => fieldValue.includes(v))
              : !fieldValue.includes(filterValue);
          }
          return !String(fieldValue).toLowerCase().includes(String(filterValue).toLowerCase());
        
        case "starts_with":
          return String(fieldValue).toLowerCase().startsWith(String(filterValue).toLowerCase());
        
        case "ends_with":
          return String(fieldValue).toLowerCase().endsWith(String(filterValue).toLowerCase());
        
        case "greater_than":
          return Number(fieldValue) > Number(filterValue);
        
        case "less_than":
          return Number(fieldValue) < Number(filterValue);
        
        case "greater_than_or_equal":
          return Number(fieldValue) >= Number(filterValue);
        
        case "less_than_or_equal":
          return Number(fieldValue) <= Number(filterValue);
        
        case "in":
          if (Array.isArray(filterValue)) {
            return filterValue.includes(fieldValue);
          }
          return false;
        
        case "not_in":
          if (Array.isArray(filterValue)) {
            return !filterValue.includes(fieldValue);
          }
          return true;
        
        case "is_true":
          return fieldValue === true;
        
        case "is_false":
          return fieldValue === false;
        
        case "before":
          return new Date(fieldValue) < new Date(filterValue);
        
        case "after":
          return new Date(fieldValue) > new Date(filterValue);
        
        case "between":
          // For between, we expect filterValue to be an array [min, max]
          if (Array.isArray(filterValue) && filterValue.length === 2) {
            const value = filter.operator === "between" && (filter.filterId === "startDate" || filter.filterId === "birthDate")
              ? new Date(fieldValue).getTime()
              : Number(fieldValue);
            const min = filter.operator === "between" && (filter.filterId === "startDate" || filter.filterId === "birthDate")
              ? new Date(filterValue[0]).getTime()
              : Number(filterValue[0]);
            const max = filter.operator === "between" && (filter.filterId === "startDate" || filter.filterId === "birthDate")
              ? new Date(filterValue[1]).getTime()
              : Number(filterValue[1]);
            return value >= min && value <= max;
          }
          return false;
        
        default:
          return true;
      }
    });
  });
}

export function applySorting<T extends Record<string, any>>(
  data: T[],
  filters: ActiveFilter[]
): T[] {
  const sortingFilters = filters.filter(f => f.sortOrder);
  
  if (sortingFilters.length === 0) {
    return data;
  }

  return [...data].sort((a, b) => {
    for (const filter of sortingFilters) {
      // Get the actual field name from the filter definition
      const filterDef = FILTER_DEFINITIONS.find(def => def.id === filter.filterId);
      if (!filterDef) continue;
      
      const aValue = a[filterDef.field];
      const bValue = b[filterDef.field];
      
      let comparison = 0;
      
      if (aValue === null || aValue === undefined) {
        comparison = 1;
      } else if (bValue === null || bValue === undefined) {
        comparison = -1;
      } else if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }
      
      if (comparison !== 0) {
        return filter.sortOrder === "desc" ? -comparison : comparison;
      }
    }
    
    return 0;
  });
}

export function parseFiltersFromQuery(query: string | null): ActiveFilter[] {
  if (!query) return [];
  
  try {
    return JSON.parse(query) as ActiveFilter[];
  } catch (error) {
    console.error("Failed to parse filters from query:", error);
    return [];
  }
}