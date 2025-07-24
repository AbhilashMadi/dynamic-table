"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

import { departments } from "./use-table-filters";

interface AdvancedFiltersProps {
  departmentFilter: string[];
  onDepartmentFilterChange: (value: string[]) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  salaryRange: [number, number];
  onSalaryRangeChange: (value: [number, number]) => void;
  ratingRange: [number, number];
  onRatingRangeChange: (value: [number, number]) => void;
  onClearAllFilters: () => void;
}

export function AdvancedFilters({
  departmentFilter,
  onDepartmentFilterChange,
  statusFilter,
  onStatusFilterChange,
  salaryRange,
  onSalaryRangeChange,
  ratingRange,
  onRatingRangeChange,
  onClearAllFilters,
}: AdvancedFiltersProps) {
  return (
    <div className="mt-6 space-y-6">
      <div className="space-y-2">
        <Label>Departments</Label>
        <div className="space-y-2">
          {departments.map((dept) => (
            <div key={dept} className="flex items-center space-x-2">
              <Checkbox
                checked={departmentFilter.includes(dept)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onDepartmentFilterChange([...departmentFilter, dept]);
                  } else {
                    onDepartmentFilterChange(
                      departmentFilter.filter((d) => d !== dept)
                    );
                  }
                }}
              />
              <Label className="text-sm font-normal">{dept}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Salary Range</Label>
        <div className="text-muted-foreground flex items-center justify-between text-sm">
          <span>${salaryRange[0].toLocaleString()}</span>
          <span>${salaryRange[1].toLocaleString()}</span>
        </div>
        <Slider
          value={salaryRange}
          onValueChange={(value) => onSalaryRangeChange(value as [number, number])}
          min={0}
          max={300000}
          step={5000}
          className="mt-2"
        />
      </div>

      <div className="space-y-2">
        <Label>Performance Rating</Label>
        <div className="text-muted-foreground flex items-center justify-between text-sm">
          <span>{ratingRange[0].toFixed(1)}</span>
          <span>{ratingRange[1].toFixed(1)}</span>
        </div>
        <Slider
          value={ratingRange}
          onValueChange={(value) => onRatingRangeChange(value as [number, number])}
          min={0}
          max={5}
          step={0.1}
          className="mt-2"
        />
      </div>

      <Button variant="outline" onClick={onClearAllFilters} className="w-full">
        Clear All Filters
      </Button>
    </div>
  );
}