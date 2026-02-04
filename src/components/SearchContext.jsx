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

  // ✅ Auto-search when query changes
  useEffect(() => {
    if (searchQuery.trim() !== "" && allProducts.length > 0) {
      const query = searchQuery.toLowerCase().trim();

      const filteredProducts = allProducts.filter((product) => {
        const productName = product.name?.toLowerCase() || "";
        const productCategory = product.category?.toLowerCase() || "";

        return (
          productName.includes(query) ||
          query.includes(productName) ||
          productCategory.includes(query) ||
          query.includes(productCategory)
        );
      });

      setResults(filteredProducts);
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
