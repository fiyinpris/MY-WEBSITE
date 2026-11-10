import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "../../lib/utils";

/** Accessible accordion list of questions and answers. */
export const Faq = ({ items, className }) => {
  const [open, setOpen] = useState(0);
  return (
    <div className={cn("divide-y overflow-hidden rounded-3xl border bg-card shadow-soft", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const id = `faq-${i}`;
        return (
          <div key={item.q}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${id}-panel`}
                id={`${id}-button`}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left transition-colors hover:bg-muted/50 sm:px-7"
              >
                <span className={cn("text-[0.975rem] font-semibold transition-colors sm:text-base", isOpen ? "text-primary" : "text-foreground")}>
                  {item.q}
                </span>
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                    isOpen ? "rotate-45 border-primary bg-primary text-primary-foreground" : "text-muted-foreground",
                  )}
                >
                  <Plus size={16} />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${id}-panel`}
                  role="region"
                  aria-labelledby={`${id}-button`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-6 text-[0.95rem] leading-relaxed text-muted-foreground sm:px-7">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
