import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * Standard inner-page header with breadcrumbs, title and supporting copy.
 */
export const PageHeader = ({ title, description, crumbs = [], children, className }) => (
  <header className={cn("container-page pt-8 pb-8 sm:pt-12 sm:pb-10", className)}>
    {crumbs.length > 0 && (
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
          <li>
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          {crumbs.map((c, i) => (
            <li key={c.label} className="flex items-center gap-1.5">
              <ChevronRight size={14} className="opacity-50" aria-hidden="true" />
              {c.to && i < crumbs.length - 1 ? (
                <Link to={c.to} className="hover:text-foreground transition-colors">
                  {c.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium" aria-current="page">
                  {c.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    )}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  </header>
);
