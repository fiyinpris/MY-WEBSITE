import { createContext, useState, useEffect } from "react";
import { productsAPI } from "../services/firebase";

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Load products from Firebase on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const firebaseProducts = await productsAPI.getAll();

        if (firebaseProducts && firebaseProducts.length > 0) {
          setAllProducts(firebaseProducts);
          console.log(
            `✅ SearchContext: Loaded ${firebaseProducts.length} products from Firebase`,
          );
        } else {
          setAllProducts([]);
          console.log("⚠️ SearchContext: No products found in Firebase");
        }
      } catch (error) {
        console.error("❌ SearchContext: Error loading products:", error);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();

    // ✅ Refresh products every 30 seconds to catch new uploads
    const interval = setInterval(loadProducts, 30000);

    return () => clearInterval(interval);
  }, []);

  // ✅ IMPROVED: Better search algorithm with fuzzy matching
  const searchProducts = (query, products) => {
    if (!query || query.trim() === "") return [];
    if (!products || products.length === 0) return [];

    const searchTerms = query.toLowerCase().trim().split(/\s+/);

    const scoredProducts = products.map((product) => {
      const productName = (product.name || "").toLowerCase();
      const productCategory = (product.category || "").toLowerCase();
      const productDescription = (product.description || "").toLowerCase();

      let score = 0;

      searchTerms.forEach((term) => {
        // Exact name match (highest priority)
        if (productName === term) {
          score += 100;
        }
        // Name starts with term
        else if (productName.startsWith(term)) {
          score += 50;
        }
        // Name contains term
        else if (productName.includes(term)) {
          score += 30;
        }

        // Category exact match
        if (productCategory === term) {
          score += 40;
        }
        // Category contains term
        else if (productCategory.includes(term)) {
          score += 20;
        }

        // Description contains term
        if (productDescription.includes(term)) {
          score += 10;
        }

        // Fuzzy matching for common typos/variations
        // Example: "ringlight" matches "ring light", "ring-light"
        const normalizedName = productName.replace(/[\s\-_]/g, "");
        const normalizedTerm = term.replace(/[\s\-_]/g, "");

        if (normalizedName.includes(normalizedTerm)) {
          score += 25;
        }

        // Partial word matching for compound products
        // Example: "LED" in "LED 660" or "M140" in "M140 Mobile LED Light"
        const nameWords = productName.split(/[\s\-_]+/);
        nameWords.forEach((word) => {
          if (word === term) {
            score += 35;
          } else if (word.startsWith(term) || term.startsWith(word)) {
            score += 15;
          }
        });
      });

      return { product, score };
    });

    // Filter out products with 0 score and sort by score (highest first)
    return scoredProducts
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ product }) => product);
  };

  // ✅ Auto-search when query changes with improved algorithm
  useEffect(() => {
    if (searchQuery.trim() !== "" && allProducts.length > 0) {
      const searchResults = searchProducts(searchQuery, allProducts);
      setResults(searchResults);

      console.log(
        `🔍 Search for "${searchQuery}": Found ${searchResults.length} results`,
      );
      if (searchResults.length > 0) {
        console.log(
          "Top results:",
          searchResults.slice(0, 3).map((p) => p.name),
        );
      }
    } else {
      setResults([]);
    }
  }, [searchQuery, allProducts]);

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        results,
        setResults,
        allProducts,
        setAllProducts,
        loading,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
