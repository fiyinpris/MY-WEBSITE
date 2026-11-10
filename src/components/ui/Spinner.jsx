import { cn } from "../../lib/utils";

/** Small circular spinner for buttons; inherits the current text colour. */
export const Spinner = ({ className, size = 20 }) => (
  <svg
    className={cn("animate-spin", className)}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
    <path d="M21.5 12a9.5 9.5 0 0 0-9.5-9.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/** The store's original green radial-bars loader, refined. */
export const BarsSpinner = ({ size = 64, className }) => {
  const bars = 12;
  const barH = size * 0.28;
  const barW = Math.max(3, size * 0.09);
  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full bg-primary"
          style={{
            width: barW,
            height: barH,
            marginLeft: -barW / 2,
            marginTop: -barH / 2,
            transform: `rotate(${i * (360 / bars)}deg) translateY(${-size * 0.32}px)`,
            animation: "ls-bar-fade 1.2s linear infinite",
            animationDelay: `${-1.2 + i * 0.1}s`,
          }}
        />
      ))}
      <style>{`@keyframes ls-bar-fade{0%{opacity:1}100%{opacity:.12}}`}</style>
    </div>
  );
};

/** Full-screen loading veil. */
export const PageLoader = ({ label = "Loading", transparent = false }) => (
  <div
    role="status"
    aria-live="polite"
    className={cn(
      "fixed inset-0 z-[9998] flex items-center justify-center animate-fade-in",
      transparent ? "bg-background/40 backdrop-blur-[3px]" : "bg-background/80 backdrop-blur-sm",
    )}
  >
    <div className="flex flex-col items-center gap-5">
      <BarsSpinner size={64} />
      <span className="sr-only">{label}</span>
    </div>
  </div>
);

/** Inline loader block for sections. */
export const SectionLoader = ({ className, label }) => (
  <div role="status" className={cn("flex flex-col items-center justify-center gap-4 py-24", className)}>
    <BarsSpinner size={48} />
    {label && <span className="text-sm text-muted-foreground">{label}</span>}
  </div>
);
