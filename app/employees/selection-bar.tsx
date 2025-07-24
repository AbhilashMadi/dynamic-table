"use client";

import { Button } from "@/components/ui/button";

interface SelectionBarProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  onDeleteSelected?: () => void;
}

export function SelectionBar({
  selectedCount,
  totalCount,
  onClearSelection,
  onDeleteSelected,
}: SelectionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-muted flex items-center justify-between rounded-lg px-4 py-2">
      <div className="text-muted-foreground text-sm">
        {selectedCount} of {totalCount} row(s) selected
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onClearSelection}>
          Clear selection
        </Button>
        {onDeleteSelected && (
          <Button variant="destructive" size="sm" onClick={onDeleteSelected}>
            Delete selected
          </Button>
        )}
      </div>
    </div>
  );
}
