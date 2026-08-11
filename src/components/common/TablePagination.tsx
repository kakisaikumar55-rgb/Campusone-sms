import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t px-4 py-3 sm:flex sm:justify-between">
      <p className="min-w-0 truncate text-xs text-muted-foreground">
        Showing {from}–{to} of {total} records
      </p>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>
        {Array.from({ length: pageCount })
          .slice(0, 5)
          .map((_, i) => {
            const start = Math.min(Math.max(1, page - 2), Math.max(1, pageCount - 4));
            const p = start + i;
            if (p > pageCount) return null;
            return (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="icon"
                onClick={() => onPageChange(p)}
              >
                {p}
              </Button>
            );
          })}
        <Button
          variant="outline"
          size="icon"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
