import { cn } from "../../lib/utils";

export const EmptyState = ({ icon: Icon, title, description, children, className }) => (
  <div className={cn("mx-auto flex max-w-md flex-col items-center py-16 text-center", className)}>
    {Icon && (
      <div className="relative mb-6">
        <span className="absolute inset-0 rounded-full bg-primary/15 blur-2xl" aria-hidden="true" />
        <div className="relative flex size-20 items-center justify-center rounded-full border bg-card shadow-soft">
          <Icon size={30} strokeWidth={1.6} className="text-primary" />
        </div>
      </div>
    )}
    <h2 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h2>
    {description && (
      <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">{description}</p>
    )}
    {children && <div className="mt-7 flex flex-wrap items-center justify-center gap-3">{children}</div>}
  </div>
);
