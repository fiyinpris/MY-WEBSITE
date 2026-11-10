import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

/**
 * my.LIGHTSTORE wordmark. The italic serif "my" echoes the handwritten
 * monogram in the brand logo; the glowing amber dot is the "light".
 */
export const Logo = ({ className, tone = "default", onClick }) => (
  <Link
    to="/"
    onClick={onClick}
    aria-label="my.LIGHTSTORE — home"
    className={cn("group inline-flex items-baseline gap-[1px] select-none leading-none", className)}
  >
    <span
      className={cn(
        "font-display italic text-[1.7rem] lg:text-[1.85rem] leading-none transition-colors duration-300",
        tone === "light" ? "text-white" : "text-primary",
      )}
    >
      my
    </span>
    <span
      aria-hidden="true"
      className="mx-[1px] inline-block size-[0.4rem] rounded-full bg-accent shadow-[0_0_10px_2px] shadow-accent/60 animate-pulse-subtle transition-shadow duration-500 group-hover:shadow-accent"
    />
    <span
      className={cn(
        "text-[0.95rem] lg:text-[1.02rem] font-extrabold tracking-[0.14em]",
        tone === "light" ? "text-white" : "text-foreground",
      )}
    >
      LIGHTSTORE
    </span>
  </Link>
);
