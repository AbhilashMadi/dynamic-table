"use client";

import { Badge } from "@/components/ui/badge";

interface FilterBadgesProps {
  departmentFilter: string[];
  onRemoveDepartment: (dept: string) => void;
  statusFilter: string;
  onRemoveStatus: () => void;
  salaryRange: [number, number];
  onRemoveSalaryRange: () => void;
  ratingRange: [number, number];
  onRemoveRatingRange: () => void;
}

export function FilterBadges({
  departmentFilter,
  onRemoveDepartment,
  statusFilter,
  onRemoveStatus,
  salaryRange,
  onRemoveSalaryRange,
  ratingRange,
  onRemoveRatingRange,
}: FilterBadgesProps) {
  const hasSalaryFilter = salaryRange[0] > 0 || salaryRange[1] < 300000;
  const hasRatingFilter = ratingRange[0] > 0 || ratingRange[1] < 5;

  if (
    departmentFilter.length === 0 &&
    statusFilter === "all" &&
    !hasSalaryFilter &&
    !hasRatingFilter
  ) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {departmentFilter.map((dept) => (
        <Badge
          key={dept}
          variant="secondary"
          className="cursor-pointer"
          onClick={() => onRemoveDepartment(dept)}
        >
          {dept} ×
        </Badge>
      ))}
      {statusFilter !== "all" && (
        <Badge
          variant="secondary"
          className="cursor-pointer"
          onClick={onRemoveStatus}
        >
          Status: {statusFilter} ×
        </Badge>
      )}
      {hasSalaryFilter && (
        <Badge
          variant="secondary"
          className="cursor-pointer"
          onClick={onRemoveSalaryRange}
        >
          Salary: ${salaryRange[0].toLocaleString()} - $
          {salaryRange[1].toLocaleString()} ×
        </Badge>
      )}
      {hasRatingFilter && (
        <Badge
          variant="secondary"
          className="cursor-pointer"
          onClick={onRemoveRatingRange}
        >
          Rating: {ratingRange[0].toFixed(1)} - {ratingRange[1].toFixed(1)} ×
        </Badge>
      )}
    </div>
  );
}