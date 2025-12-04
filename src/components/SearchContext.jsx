import { createContext, useState } from "react";

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);

  return (
    <SearchContext.Provider
      value={{ searchQuery, setSearchQuery, results, setResults }}
    >
      {children}
    </SearchContext.Provider>
  );
};
