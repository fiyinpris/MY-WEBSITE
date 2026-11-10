import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../lib/theme-context";
import { cn } from "../lib/utils";

/** Icon button that switches between light and dark mode. */
export const ThemeToggle = ({ className }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn("icon-btn overflow-hidden", className)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: -14, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 14, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.3 }}
          className="inline-flex"
        >
          {isDark ? (
            <Moon size={19} className="text-[hsl(214_90%_72%)]" />
          ) : (
            <Sun size={19} className="text-accent transition-transform duration-700 hover:rotate-180" />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
};

/** Labelled switch variant used inside the mobile menu. */
export const ThemeSwitch = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={toggleTheme}
      className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors hover:bg-muted"
    >
      <span className="flex items-center gap-3 font-medium text-foreground/85">
        {isDark ? <Moon size={19} className="text-[hsl(214_90%_72%)]" /> : <Sun size={19} className="text-accent" />}
        Dark mode
      </span>
      <span
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300",
          isDark ? "bg-primary" : "bg-foreground/15",
        )}
      >
        <span
          className={cn(
            "inline-block size-5 rounded-full bg-white shadow transition-transform duration-300",
            isDark ? "translate-x-[22px]" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
};
