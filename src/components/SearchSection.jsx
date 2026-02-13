import React, { useContext, useState, useMemo, useEffect } from "react";
import { SearchContext } from "./SearchContext";
import {
  Search,
  ShoppingCart,
  Heart,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartSection";
import { useWishlist } from "./WishlistSection";

export const SearchSection = () => {
  const { searchQuery, results, allProducts, loading } =
    useContext(SearchContext);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 16; // 4x4 grid

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Calculate pagination - memoized to prevent recalculation
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(results.length / PRODUCTS_PER_PAGE);
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    const currentProducts = results.slice(startIndex, endIndex);

    return {
      totalPages,
      startIndex,
      endIndex,
      currentProducts,
    };
  }, [results, currentPage, PRODUCTS_PER_PAGE]);

  const { totalPages, startIndex, endIndex, currentProducts } = paginationData;

  const handleAddToCart = (product) => {
    addToCart(product);
    // Create a success toast/notification
    const notification = document.createElement("div");
    notification.className =
      "fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideInRight";
    notification.textContent = `${product.name} added to cart!`;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Show loading only when initially loading products
  const showLoading = loading && allProducts.length === 0;

  // ✅ Determine what to show
  const hasSearchQuery = searchQuery && searchQuery.trim() !== "";
  const hasResults = results.length > 0;
  const showNoResults = hasSearchQuery && !hasResults && !showLoading;
  const showResults = hasSearchQuery && hasResults && !showLoading;
  const showEmptyState = !hasSearchQuery && !showLoading;

  return (
    <section className="pt-24 px-4 sm:px-6 lg:px-8 pb-10 min-h-screen bg-background">
      <div className="mx-auto max-w-7xl">
        {/* Back Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/shop")}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back to Shop</span>
            <span className="sm:hidden">Back</span>
          </button>
          <span className="text-muted-foreground">|</span>
          <button
            onClick={() => navigate("/products")}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <span className="hidden sm:inline">Our Products</span>
            <span className="sm:hidden">Products</span>
          </button>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-center">
          Search Results
        </h1>

        {/* Results Count */}
        {hasSearchQuery && (
          <div className="text-center mb-8">
            <p className="text-sm sm:text-lg text-foreground">
              {hasResults ? (
                <>
                  Found{" "}
                  <span className="font-bold text-primary">
                    {results.length}
                  </span>{" "}
                  product{results.length === 1 ? "" : "s"} for "{searchQuery}"
                </>
              ) : (
                !showLoading && (
                  <>
                    No products found for "
                    <span className="font-semibold">{searchQuery}</span>"
                  </>
                )
              )}
            </p>
            {results.length > PRODUCTS_PER_PAGE && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Showing {startIndex + 1}-{Math.min(endIndex, results.length)} of{" "}
                {results.length}
              </p>
            )}
          </div>
        )}

        {/* Loading State - Only show when initially loading */}
        {showLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="relative w-20 h-20">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-6 bg-green-600 rounded-full"
                  style={{
                    left: "50%",
                    top: "50%",
                    transformOrigin: "1px -24px",
                    transform: `rotate(${i * 30}deg)`,
                    opacity: 1 - i * 0.08,
                    animation: `spin-fade 1.2s linear infinite`,
                    animationDelay: `${-1.2 + i * 0.1}s`,
                  }}
                />
              ))}
            </div>
            <style>{`
              @keyframes spin-fade {
                0% { opacity: 1; }
                100% { opacity: 0.1; }
              }
            `}</style>
          </div>
        )}

        {/* No Results Message */}
        {showNoResults && (
          <div className="text-center py-16">
            <div className="mb-6">
              <Search
                size={64}
                className="mx-auto text-muted-foreground opacity-50"
              />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
              No products found
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto px-4">
              We couldn't find any products matching "
              <span className="font-semibold">{searchQuery}</span>". Try
              different keywords like: ringlight, tripod, LED light, softbox, or
              microphone.
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Browse All Products
            </button>
          </div>
        )}

        {/* Product Results Grid - 4x4 on large screens */}
        {showResults && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {currentProducts.map((product) => (
                <div
                  key={product.id}
                  className="border border-border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-card cursor-pointer"
                  onClick={() => handleProductClick(product.id)}
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden aspect-square bg-muted">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToWishlist(product);
                      }}
                      className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white rounded-full p-1.5 sm:p-2 shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <Heart
                        size={16}
                        className={`sm:w-[18px] sm:h-[18px] ${
                          isInWishlist(product.id)
                            ? "text-red-500 fill-red-500"
                            : "text-gray-600 hover:text-red-500"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="p-3 sm:p-4">
                    {/* Product Name */}
                    <h3 className="text-xs sm:text-sm md:text-base font-bold text-foreground mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
                      {product.name}
                    </h3>

                    {/* Category Badge */}
                    {product.category && (
                      <span className="inline-block text-[10px] sm:text-xs bg-primary/10 text-primary px-2 py-1 rounded-md mb-2 sm:mb-3">
                        {product.category}
                      </span>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <span className="text-sm sm:text-base md:text-lg font-bold text-primary">
                        ₦{product.price.toLocaleString()}
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 sm:py-2.5 rounded-lg transition-colors duration-300 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
                    >
                      <ShoppingCart size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Add to Cart</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 sm:gap-4 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors ${
                    currentPage === 1
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary/90"
                  }`}
                >
                  <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1 sm:gap-2">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNum = index + 1;

                    // Show first page, last page, current page, and pages around current
                    const showPage =
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      Math.abs(pageNum - currentPage) <= 1;

                    const showEllipsis =
                      (pageNum === 2 && currentPage > 3) ||
                      (pageNum === totalPages - 1 &&
                        currentPage < totalPages - 2);

                    if (!showPage && !showEllipsis) return null;

                    if (showEllipsis) {
                      return (
                        <span
                          key={`ellipsis-${pageNum}`}
                          className="px-2 text-muted-foreground"
                        >
                          ...
                        </span>
                      );
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                          currentPage === pageNum
                            ? "bg-primary text-white"
                            : "bg-card border border-border text-foreground hover:bg-muted"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors ${
                    currentPage === totalPages
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary/90"
                  }`}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={16} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty State - When no search query */}
        {showEmptyState && (
          <div className="text-center py-16 px-4">
            <div className="mb-6">
              <Search
                size={48}
                className="sm:w-16 sm:h-16 mx-auto text-muted-foreground opacity-50"
              />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
              Start Searching
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-6">
              Use the search bar in the navigation to find ringlights, tripods,
              LED lights, and more. We have {allProducts.length} products
              available!
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 max-w-lg mx-auto">
              <button
                onClick={() => navigate("/shop")}
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Browse All Products
              </button>
              <button
                onClick={() => navigate("/products")}
                className="bg-card hover:bg-muted border border-border text-foreground font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Our Products
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast notification styles */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slideInRight {
          animation: slideInRight 0.4s ease-out;
        }
      `}</style>
    </section>
  );
};
