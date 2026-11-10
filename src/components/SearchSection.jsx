import { useContext, useState, useMemo, useEffect } from "react";
import { SearchContext } from "./SearchContext";
import { Search, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "./CartSection";
import { useWishlist } from "./WishlistSection";
import { ProductCard, ProductCardSkeleton } from "./ui/ProductCard";
import { Pagination } from "./ui/Pagination";
import { EmptyState } from "./ui/EmptyState";
import { PageHeader } from "./ui/PageHeader";
import { Reveal } from "./ui/Reveal";
import { categoryNavLabel, PRODUCT_CATEGORIES } from "../lib/format";

const PRODUCTS_PER_PAGE = 16; // 4x4 grid

export const SearchSection = () => {
  const { searchQuery, setSearchQuery, results, allProducts, loading } = useContext(SearchContext);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const { totalPages, startIndex, endIndex, currentProducts } = useMemo(() => {
    const total = Math.ceil(results.length / PRODUCTS_PER_PAGE);
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const end = start + PRODUCTS_PER_PAGE;
    return { totalPages: total, startIndex: start, endIndex: end, currentProducts: results.slice(start, end) };
  }, [results, currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showLoading = loading && allProducts.length === 0;
  const hasSearchQuery = Boolean(searchQuery && searchQuery.trim() !== "");
  const hasResults = results.length > 0;

  const availableCategories = useMemo(() => {
    const present = new Set(allProducts.map((p) => p.category));
    return PRODUCT_CATEGORIES.filter((c) => present.has(c));
  }, [allProducts]);

  return (
    <div className="pb-20">
      <PageHeader
        crumbs={[{ label: "Shop", to: "/shop" }, { label: "Search" }]}
        title={hasSearchQuery ? <>Results for “{searchQuery.trim()}”</> : "Search"}
        description={
          showLoading
            ? "Loading products…"
            : hasSearchQuery
              ? hasResults
                ? `${results.length} product${results.length === 1 ? "" : "s"} found${
                    results.length > PRODUCTS_PER_PAGE
                      ? ` · showing ${startIndex + 1}–${Math.min(endIndex, results.length)}`
                      : ""
                  }`
                : "No products matched your search."
              : `Find ringlights, tripods, LED lights and more across ${allProducts.length} products.`
        }
      />

      <div className="container-page">
        {/* Inline search field */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="relative mb-10 max-w-2xl"
          role="search"
        >
          <Search size={19} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, categories…"
            aria-label="Search products"
            className="input !h-14 !rounded-full !pl-13 !pr-12 text-base shadow-soft [&::-webkit-search-cancel-button]:hidden"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="icon-btn absolute right-2 top-1/2 -translate-y-1/2"
            >
              <X size={18} />
            </button>
          )}
        </form>

        {showLoading && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* No results */}
        {hasSearchQuery && !hasResults && !showLoading && (
          <EmptyState
            icon={Search}
            title="No products found"
            description={`We couldn't find anything matching “${searchQuery.trim()}”. Try keywords like ringlight, tripod, LED light, softbox or microphone.`}
          >
            <button onClick={() => navigate("/shop")} className="btn btn-primary">
              Browse all products
            </button>
          </EmptyState>
        )}

        {/* Results */}
        {hasSearchQuery && hasResults && !showLoading && (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
              {currentProducts.map((product, i) => (
                <Reveal key={product.id} delay={(i % 4) * 0.05} y={16}>
                  <ProductCard
                    product={product}
                    onOpen={(p) => navigate(`/product/${p.id}`)}
                    onAddToCart={addToCart}
                    onToggleWishlist={addToWishlist}
                    isWishlisted={isInWishlist(product.id)}
                    priority={i < 4}
                  />
                </Reveal>
              ))}
            </div>
            <Pagination page={currentPage} totalPages={totalPages} onChange={handlePageChange} className="mt-14" />
          </>
        )}

        {/* Empty state — no query yet */}
        {!hasSearchQuery && !showLoading && (
          <div>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Popular categories
            </h2>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((c) => (
                <Link
                  key={c}
                  to={`/shop?category=${encodeURIComponent(c)}`}
                  className="rounded-full border bg-card px-4 py-2 text-sm font-medium text-foreground/85 hover:border-primary hover:text-primary transition-colors"
                >
                  {categoryNavLabel(c)}
                </Link>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/shop" className="btn btn-primary">
                Browse all products
              </Link>
              <Link to="/products" className="btn btn-outline">
                Our products
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
