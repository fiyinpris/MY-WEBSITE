import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

const buildPages = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (current >= total - 2) [total - 1, total - 2, total - 3].forEach((p) => pages.add(p));
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push(`gap-${p}`);
    out.push(p);
  });
  return out;
};

export const Pagination = ({ page, totalPages, onChange, className }) => {
  if (totalPages <= 1) return null;
  const pages = buildPages(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1.5 sm:gap-2", className)}
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="btn btn-outline btn-sm !px-3 disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:inline">Prev</span>
      </button>

      {pages.map((p) =>
        typeof p === "string" ? (
          <span key={p} className="px-1 text-sm text-muted-foreground" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-full text-sm font-semibold transition-colors",
              p === page
                ? "bg-primary text-primary-foreground shadow-[0_6px_16px_-6px_hsl(var(--primary)/0.6)]"
                : "text-foreground/75 hover:bg-muted hover:text-foreground",
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="btn btn-outline btn-sm !px-3 disabled:opacity-40"
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={16} />
      </button>
    </nav>
  );
};
