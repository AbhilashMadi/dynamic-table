"use client";

import { useDraggable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FilterDefinition } from "@/lib/filters";
import { GripVertical, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraggableFilterItemProps {
  filter: FilterDefinition;
  className?: string;
}

export function DraggableFilterItem({ filter, className }: DraggableFilterItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `available-${filter.id}`,
    data: {
      type: "filter",
      filter,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex items-center gap-2 p-3 border rounded-md bg-background cursor-grab active:cursor-grabbing transition-colors hover:bg-muted/50",
        isDragging && "opacity-0",
        className
      )}
      {...listeners}
      {...attributes}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{filter.label}</div>
        <div className="text-xs text-muted-foreground capitalize">
          {filter.type} field
        </div>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Info className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <p>{filter.description}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}