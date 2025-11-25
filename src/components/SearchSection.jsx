import React, { useContext } from "react";
import { SearchContext } from "../context/SearchContext";
import { Search } from "lucide-react";

export const SearchSection = () => {
  const { searchQuery, setSearchQuery, results, setResults } =
    useContext(SearchContext);

  React.useEffect(() => {
    if (searchQuery.trim() !== "") {
      setResults(
        ["Led light", "Ringlight", "Tripod", "Microphone", "Softbox"].filter(
          (item) => item.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setResults([]);
    }
  }, [searchQuery, setResults]);

  const handleClear = () => {
    setSearchQuery("");
    setResults([]);
  };

  return (
    <section className="pt-24 px-4 min-h-screen">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8 text-center">
          Search Products
        </h1>

        <div className="relative mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products..."
            className="w-full pl-12 pr-12 py-4 rounded-full border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />

          {/* Search Icon */}
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>

          {/* Clear Button */}
          {searchQuery && (
            <button
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}

          {/* Dropdown Results */}
          {results.length > 0 && (
            <div className="absolute mt-2 w-full bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="px-4 py-3 hover:bg-primary/10 cursor-pointer text-foreground"
                >
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center text-muted-foreground">
          {searchQuery ? (
            <p className="text-lg">Searching for: "{searchQuery}"</p>
          ) : (
            <p className="text-lg">Enter a search term to find products</p>
          )}
        </div>
      </div>
    </section>
  );
};
