import { createContext, useState, useEffect, useCallback, useRef } from "react";
import { productsAPI } from "../services/firebase";

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false); // ✅ NEW: Prevents flicker
  const prevQueryRef = useRef(""); // ✅ Track previous query

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
  const searchProducts = useCallback((query, products) => {
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
        const normalizedName = productName.replace(/[\s\-_]/g, "");
        const normalizedTerm = term.replace(/[\s\-_]/g, "");

        if (normalizedName.includes(normalizedTerm)) {
          score += 25;
        }

        // Partial word matching for compound products
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
  }, []);

  // ✅ FIXED: Synchronous immediate search - no debouncing, no delays
  useEffect(() => {
    // Skip if products aren't loaded yet
    if (loading || allProducts.length === 0) {
      return;
    }

    const trimmedQuery = searchQuery.trim();

    // If search query is empty, immediately clear results
    if (trimmedQuery === "") {
      setResults([]);
      setSearching(false);
      prevQueryRef.current = "";
      return;
    }

    // Only search if query actually changed
    if (trimmedQuery === prevQueryRef.current) {
      return;
    }

    // Update previous query
    prevQueryRef.current = trimmedQuery;

    // Perform search synchronously
    const searchResults = searchProducts(trimmedQuery, allProducts);
    setResults(searchResults);

    console.log(
      `🔍 Search for "${trimmedQuery}": Found ${searchResults.length} results`,
    );
    if (searchResults.length > 0) {
      console.log(
        "Top results:",
        searchResults.slice(0, 3).map((p) => p.name),
      );
    }
  }, [searchQuery, allProducts, loading, searchProducts]);

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
        searching,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
