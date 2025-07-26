"use client";

import { useDraggable } from "@dnd-kit/core";
import { GripVertical, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FilterDefinition } from "@/lib/filters";
import { cn } from "@/lib/utils";

interface DraggableFilterItemProps {
  filter: FilterDefinition;
  className?: string;
}

export function DraggableFilterItem({
  filter,
  className,
}: DraggableFilterItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
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
        "bg-background hover:bg-muted/50 flex cursor-grab items-center gap-2 rounded-md border p-3 transition-colors active:cursor-grabbing",
        isDragging && "opacity-0",
        className
      )}
      {...listeners}
      {...attributes}
    >
      <GripVertical className="text-muted-foreground h-4 w-4" />

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{filter.label}</div>
        <div className="text-muted-foreground text-xs capitalize">
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
