import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";

export const ThemeToggle = () => {
  // Load theme from localStorage on mount
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark"; // true if dark, false otherwise
  });

  const [isScrolled, setIsScrolled] = useState(false);

  // Apply theme whenever state changes
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light"); // persist
  }, [isDarkMode]);

  // Detect scroll for button positioning
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle dark/light mode
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "fixed max-sm:hidden z-[60] p-2 rounded-full hover:bg-primary/10",
        "transition-all duration-300 hover:scale-110",
        isScrolled
          ? "top-2 right-8 lg:right-8 md:right-0"
          : "top-2.5 lg:right-8 right-8 md:right-0"
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
