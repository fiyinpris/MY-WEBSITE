import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { useScrollLock } from "./useScrollLock";

const EASE = [0.22, 1, 0.36, 1];

/**
 * Accessible modal dialog.
 * - variant "center": centred card (default)
 * - variant "sheet": bottom sheet on mobile, centred card from `sm` up
 */
export const Modal = ({
  open,
  onClose,
  children,
  title,
  description,
  size = "md",
  variant = "center",
  showClose = true,
  dismissible = true,
  className,
  bodyClassName,
}) => {
  const titleId = useId();
  const panelRef = useRef(null);
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && dismissible) onClose?.();
    };
    window.addEventListener("keydown", onKey);
    // Move focus into the dialog for keyboard / screen-reader users
    const t = setTimeout(() => {
      const el = panelRef.current?.querySelector(
        "[autofocus], input:not([disabled]), button, [href]",
      );
      (el || panelRef.current)?.focus({ preventScroll: true });
    }, 50);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, dismissible, onClose]);

  const widths = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-4xl",
  };

  const isSheet = variant === "sheet";

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className={cn(
            "fixed inset-0 z-[10000] flex justify-center",
            isSheet ? "items-end sm:items-center sm:p-6" : "items-center p-4 sm:p-6",
          )}
        >
          <motion.div
            className="absolute inset-0 bg-[hsl(160_25%_4%/0.55)] backdrop-blur-[6px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => dismissible && onClose?.()}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            className={cn(
              "relative w-full bg-card text-card-foreground shadow-lift outline-none",
              "max-h-[92dvh] overflow-y-auto overscroll-contain",
              isSheet ? "rounded-t-3xl sm:rounded-3xl" : "rounded-3xl",
              widths[size],
              className,
            )}
            initial={isSheet ? { y: "100%", opacity: 1 } : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={isSheet ? { y: "100%", opacity: 1 } : { opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            {isSheet && (
              <div className="sm:hidden flex justify-center pt-3" aria-hidden="true">
                <span className="h-1 w-10 rounded-full bg-foreground/15" />
              </div>
            )}
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="icon-btn absolute right-3 top-3 z-10 bg-card/80 backdrop-blur"
              >
                <X size={18} />
              </button>
            )}
            <div className={cn("p-6 sm:p-8", bodyClassName)}>
              {title && (
                <h2 id={titleId} className="text-xl sm:text-2xl font-bold pr-10">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              )}
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
