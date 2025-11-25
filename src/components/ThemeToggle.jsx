import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";

export const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    localStorage.setItem("theme", newMode ? "dark" : "light");

    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "fixed max-sm:hidden z-[60] p-2 rounded-full hover:bg-primary/10",
        "transition-all duration-300 hover:scale-110",
        // Position it in the navbar area, adjusting with scroll
        isScrolled ? "top-2 right-8 lg:right-8 md:right-0" : "top-2.5 lg:right-8 right-8 md:right-0"
      )}
    >
      {isDarkMode ? (
        <Moon className="h-6 w-6 text-blue-400 transition-transform duration-300" />
      ) : (
        <Sun className="h-6 w-6 text-yellow-500 transition-transform duration-300 rotate-0 hover:rotate-180" />
      )}
    </button>
  );
};
