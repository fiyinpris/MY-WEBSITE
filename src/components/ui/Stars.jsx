import { Star } from "lucide-react";
import { cn } from "../../lib/utils";

/** Five-star rating display with half-star support. */
export const Stars = ({ rating = 0, size = 14, className }) => (
  <span
    className={cn("inline-flex items-center gap-0.5", className)}
    role="img"
    aria-label={`${Number(rating).toFixed(1)} out of 5 stars`}
  >
    {[0, 1, 2, 3, 4].map((i) => {
      const fill = Math.max(0, Math.min(1, rating - i));
      return (
        <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
          <Star size={size} className="absolute inset-0 text-foreground/15 fill-foreground/10" />
          {fill > 0 && (
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star size={size} className="text-accent fill-accent" />
            </span>
          )}
        </span>
      );
    })}
  </span>
);
