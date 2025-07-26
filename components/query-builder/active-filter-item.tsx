"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ActiveFilter, FilterDefinition, OPERATOR_LABELS } from "@/lib/filters";
import { GripVertical, X, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActiveFilterItemProps {
  filter: ActiveFilter;
  filterDef: FilterDefinition;
  onUpdate: (filter: ActiveFilter) => void;
  onRemove: (filterId: string) => void;
  className?: string;
}

export function ActiveFilterItem({ 
  filter, 
  filterDef, 
  onUpdate, 
  onRemove,
  className 
}: ActiveFilterItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: filter.id,
    data: {
      type: "active-filter",
      filter,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleOperatorChange = (operator: string) => {
    onUpdate({
      ...filter,
      operator: operator as any,
    });
  };

  const handleValueChange = (value: string | number | boolean | string[]) => {
    onUpdate({
      ...filter,
      value,
    });
  };

  const handleSortChange = (sortOrder: "asc" | "desc" | undefined) => {
    onUpdate({
      ...filter,
      sortOrder,
    });
  };

  const renderValueInput = () => {
    switch (filterDef.type) {
      case "number":
        return (
          <Input
            type="number"
            value={filter.value?.toString() || ""}
            onChange={(e) => handleValueChange(Number(e.target.value))}
            placeholder="Enter number"
            className="w-32"
          />
        );
      
      case "date":
        return (
          <Input
            type="date"
            value={filter.value?.toString() || ""}
            onChange={(e) => handleValueChange(e.target.value)}
            className="w-40"
          />
        );
      
      case "boolean":
        return (
          <Select value={filter.value ? "true" : "false"} onValueChange={(value) => handleValueChange(value === "true")}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        );
      
      case "select":
        return (
          <Select value={filter.value?.toString() || ""} onValueChange={handleValueChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {filterDef.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case "array":
        return (
          <Input
            value={Array.isArray(filter.value) ? filter.value.join(", ") : filter.value?.toString() || ""}
            onChange={(e) => {
              const value = e.target.value;
              handleValueChange(value.includes(",") ? value.split(",").map(v => v.trim()) : value);
            }}
            placeholder="Enter values (comma-separated)"
            className="w-48"
          />
        );
      
      default:
        return (
          <Input
            value={filter.value?.toString() || ""}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="Enter value"
            className="w-40"
          />
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 p-3 border rounded-md bg-background",
        isDragging && "opacity-50 shadow-lg z-10",
        className
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="flex-1 flex items-center gap-2 flex-wrap">
        <div className="font-medium text-sm min-w-0 shrink-0">
          {filterDef.label}
        </div>

        <Select value={filter.operator} onValueChange={handleOperatorChange}>
          <SelectTrigger className="w-auto min-w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {filterDef.operators.map((operator) => (
              <SelectItem key={operator} value={operator}>
                {OPERATOR_LABELS[operator]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!["is_true", "is_false"].includes(filter.operator) && renderValueInput()}
      </div>

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={filter.sortOrder === "asc" ? "default" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => handleSortChange(filter.sortOrder === "asc" ? undefined : "asc")}
            >
              <ArrowUp className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Sort Ascending</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={filter.sortOrder === "desc" ? "default" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => handleSortChange(filter.sortOrder === "desc" ? undefined : "desc")}
            >
              <ArrowDown className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Sort Descending</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              onClick={() => onRemove(filter.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove Filter</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}