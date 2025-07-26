"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { FilterIcon } from "@/components/icons";
import { ActiveFilterItem } from "@/components/query-builder/active-filter-item";
import { DraggableFilterItem } from "@/components/query-builder/filter-item";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActiveFilter, FILTER_DEFINITIONS } from "@/lib/filters";
import {
  createActiveFilter,
  getFilterById,
  logQuery,
} from "@/lib/query-builder";

function ActiveFiltersDroppable({ children }: { children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: "active-filters-droppable",
  });

  return (
    <div
      ref={setNodeRef}
      className={`border-muted-foreground/25 min-h-96 rounded-lg border-2 border-dashed p-4 transition-colors ${
        isOver ? "border-primary/50 bg-primary/5" : ""
      }`}
    >
      {children}
    </div>
  );
}

export default function QueryBuilder() {
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Load filters from localStorage
    const savedFilters = localStorage.getItem("employeeFilters");
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters) as ActiveFilter[];
        setActiveFilters(parsedFilters);
      } catch (error) {
        console.error("Failed to parse saved filters:", error);
      }
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    // Handle dropping a filter from available filters to active filters
    if (
      activeData?.type === "filter" &&
      over.id === "active-filters-droppable"
    ) {
      const newFilter = createActiveFilter(activeData.filter.id);
      setActiveFilters((prev) => [...prev, newFilter]);
    }
    // Handle reordering active filters
    else if (
      activeData?.type === "active-filter" &&
      overData?.type === "active-filter"
    ) {
      const oldIndex = activeFilters.findIndex((f) => f.id === active.id);
      const newIndex = activeFilters.findIndex((f) => f.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        setActiveFilters((prev) => arrayMove(prev, oldIndex, newIndex));
      }
    }

    setActiveId(null);
  };

  const handleFilterUpdate = (updatedFilter: ActiveFilter) => {
    setActiveFilters((prev) =>
      prev.map((f) => (f.id === updatedFilter.id ? updatedFilter : f))
    );
  };

  const handleFilterRemove = (filterId: string) => {
    setActiveFilters((prev) => prev.filter((f) => f.id !== filterId));
  };

  const handleApplyFilters = () => {
    // Save filters to localStorage
    localStorage.setItem("employeeFilters", JSON.stringify(activeFilters));

    // Log query for debugging
    logQuery(activeFilters, "payload");

    // Close dialog
    setIsOpen(false);

    // Reload the page to trigger data refresh with new filters
    window.location.reload();
  };

  const handleClearFilters = () => {
    setActiveFilters([]);
    localStorage.removeItem("employeeFilters");
  };

  const renderDragOverlay = () => {
    if (!activeId) return null;

    const activeFilter = activeFilters.find((f) => f.id === activeId);
    if (activeFilter) {
      const filterDef = getFilterById(activeFilter.filterId);
      if (filterDef) {
        return (
          <div className="cursor-grabbing">
            <ActiveFilterItem
              filter={activeFilter}
              filterDef={filterDef}
              onUpdate={() => {}}
              onRemove={() => {}}
              className="shadow-lg"
            />
          </div>
        );
      }
    }

    const availableFilter = FILTER_DEFINITIONS.find(
      (f) => activeId === `available-${f.id}`
    );
    if (availableFilter) {
      return (
        <div className="cursor-grabbing">
          <DraggableFilterItem filter={availableFilter} className="shadow-lg" />
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FilterIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] w-full max-w-4xl flex-col">
        <DialogHeader>
          <DialogTitle>Query Builder</DialogTitle>
          <DialogDescription>
            Drag filters from the left panel to build your query. Reorder and
            configure filters on the right.
          </DialogDescription>
        </DialogHeader>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex min-h-0 flex-1 gap-6">
            {/* Available Filters Panel */}
            <div className="flex-1">
              <h3 className="mb-3 text-sm font-semibold">Available Filters</h3>
              <ScrollArea className="h-96 pr-4">
                <div className="space-y-2">
                  {FILTER_DEFINITIONS.map((filter) => (
                    <DraggableFilterItem key={filter.id} filter={filter} />
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Active Filters Panel */}
            <div className="flex-1">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  Active Filters ({activeFilters.length})
                </h3>
                {activeFilters.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <ActiveFiltersDroppable>
                {activeFilters.length === 0 ? (
                  <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
                    Drop filters here to build your query
                  </div>
                ) : (
                  <ScrollArea className="h-80">
                    <SortableContext
                      items={activeFilters.map((f) => f.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {activeFilters.map((filter) => {
                          const filterDef = getFilterById(filter.filterId);
                          if (!filterDef) return null;

                          return (
                            <ActiveFilterItem
                              key={filter.id}
                              filter={filter}
                              filterDef={filterDef}
                              onUpdate={handleFilterUpdate}
                              onRemove={handleFilterRemove}
                            />
                          );
                        })}
                      </div>
                    </SortableContext>
                  </ScrollArea>
                )}
              </ActiveFiltersDroppable>
            </div>
          </div>

          {mounted &&
            createPortal(
              <DragOverlay>{renderDragOverlay()}</DragOverlay>,
              document.body
            )}
        </DndContext>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApplyFilters}
            disabled={activeFilters.length === 0}
          >
            Apply Filters ({activeFilters.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
