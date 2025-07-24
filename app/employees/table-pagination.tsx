"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TablePaginationProps {
  table: any;
  totalCount: number;
}

export function TablePagination({ table, totalCount }: TablePaginationProps) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;

  const startIndex = pageIndex * pageSize + 1;
  const endIndex = Math.min((pageIndex + 1) * pageSize, totalCount);

  return (
    <div className="flex items-center justify-between">
      <div className="text-muted-foreground text-sm">
        Showing {startIndex} to {endIndex} of {totalCount} results
      </div>
      <div className="flex items-center space-x-2">
        <Select
          value={`${pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value));
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 40, 50, 100].map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => table.previousPage()}
                className={cn(
                  !table.getCanPreviousPage() &&
                    "pointer-events-none opacity-50"
                )}
              />
            </PaginationItem>

            {(() => {
              const currentPage = pageIndex;
              const totalPages = table.getPageCount();
              const delta = 2;
              const range: number[] = [];
              const rangeWithDots: (number | string)[] = [];
              let l: number | undefined;

              for (let i = 1; i <= totalPages; i++) {
                if (
                  i === 1 ||
                  i === totalPages ||
                  (i >= currentPage - delta + 1 && i <= currentPage + delta + 1)
                ) {
                  range.push(i);
                }
              }

              range.forEach((i) => {
                if (l) {
                  if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                  } else if (i - l !== 1) {
                    rangeWithDots.push("...");
                  }
                }
                rangeWithDots.push(i);
                l = i;
              });

              return rangeWithDots.map((i, index) => {
                if (i === "...") {
                  return (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                return (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => table.setPageIndex(Number(i) - 1)}
                      isActive={currentPage === Number(i) - 1}
                    >
                      {i}
                    </PaginationLink>
                  </PaginationItem>
                );
              });
            })()}

            <PaginationItem>
              <PaginationNext
                onClick={() => table.nextPage()}
                className={cn(
                  !table.getCanNextPage() && "pointer-events-none opacity-50"
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
