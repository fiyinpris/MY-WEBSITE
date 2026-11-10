import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { SlidersHorizontal, X, PackageSearch, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "./CartSection";
import { useWishlist } from "./WishlistSection";
import headerBg from "../Images/image 9.jpg";
import { productsAPI, reviewsAPI } from "../services/firebase";
import { ProductCard, ProductCardSkeleton } from "./ui/ProductCard";
import { Pagination } from "./ui/Pagination";
import { Modal } from "./ui/Modal";
import { EmptyState } from "./ui/EmptyState";
import { Reveal } from "./ui/Reveal";
import { cn } from "../lib/utils";
import { categoryNavLabel, formatPrice, getReviewStats, PRODUCT_CATEGORIES } from "../lib/format";

const PRODUCTS_PER_PAGE = 12;
const PRICE_MIN = 10000;
const PRICE_MAX = 500000;
const categories = ["ALL", ...PRODUCT_CATEGORIES];
const sortOptions = ["Default", "Price: Low to High", "Price: High to Low"];

const createFixedMixedOrder = (productList) =>
  [...productList].sort((a, b) => {
    const hashA = (String(a.id).charCodeAt(0) * 9301 + 49297) % 233280;
    const hashB = (String(b.id).charCodeAt(0) * 9301 + 49297) % 233280;
    return hashA - hashB;
  });

/* Filters panel — used in the desktop sidebar and the mobile sheet */
const FiltersPanel = ({ selectedCategory, onCategory, priceRange, onPrice, onReset, counts }) => {
  const pct = ((priceRange - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Categories</h3>
        <ul className="space-y-0.5">
          {categories.map((category) => {
            const active = selectedCategory === category;
            const count = category === "ALL" ? counts.ALL : counts[category] || 0;
            return (
              <li key={category}>
                <button
                  onClick={() => onCategory(category)}
                  aria-pressed={active}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[0.9375rem] transition-colors",
                    active ? "bg-primary-soft font-semibold text-primary" : "text-foreground/80 hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded-full border transition-colors",
                        active ? "border-primary bg-primary" : "border-foreground/25",
                      )}
                    >
                      {active && <Check size={10} strokeWidth={3.5} className="text-primary-foreground" />}
                    </span>
                    {category === "ALL" ? "All products" : categoryNavLabel(category)}
                  </span>
                  <span className={cn("text-xs tabular-nums", active ? "text-primary" : "text-muted-foreground")}>
                    {count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Max price</h3>
          <span className="text-sm font-bold text-foreground tabular-nums">{formatPrice(priceRange)}</span>
        </div>
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step="5000"
          value={priceRange}
          onChange={(e) => onPrice(Number(e.target.value))}
          aria-label="Maximum price"
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full accent-primary"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) ${pct}%, hsl(var(--muted)) ${pct}%)`,
          }}
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>₦10K</span>
          <span>₦500K</span>
        </div>
      </div>

      <button onClick={onReset} className="btn btn-outline btn-sm w-full">
        Reset filters
      </button>
    </div>
  );
};

export const ShopSection = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const [sortOption, setSortOption] = useState("Default");
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState(PRICE_MAX);
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const gridTopRef = useRef(null);

  const paramCategory = searchParams.get("category");
  const selectedCategory = categories.includes(paramCategory) ? paramCategory : "ALL";

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const loadedProducts = await productsAPI.getAll();
        setProducts(createFixedMixedOrder(loadedProducts));
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsProductsLoading(false);
      }
    };
    loadProducts();
    const interval = setInterval(loadProducts, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setAllReviews((await reviewsAPI.getAll()) || []);
      } catch {
        setAllReviews([]);
      }
    };
    loadReviews();
    const interval = setInterval(loadReviews, 30000);
    return () => clearInterval(interval);
  }, []);

  // Restore scroll position when returning from a product page
  useEffect(() => {
    if (isProductsLoading) return;
    const savedPosition = sessionStorage.getItem("shopScrollPosition");
    if (savedPosition) {
      const t = setTimeout(() => {
        window.scrollTo({ top: parseInt(savedPosition, 10), behavior: "instant" });
        sessionStorage.removeItem("shopScrollPosition");
      }, 0);
      return () => clearTimeout(t);
    }
  }, [isProductsLoading]);

  const setCategory = (category) => {
    setCurrentPage(1);
    setShowFilters(false);
    if (category === "ALL") setSearchParams({}, { replace: true });
    else setSearchParams({ category }, { replace: true });
  };

  const resetFilters = () => {
    setPriceRange(PRICE_MAX);
    setCurrentPage(1);
    setSearchParams({}, { replace: true });
  };

  const handleProductClick = (product) => {
    sessionStorage.setItem("shopScrollPosition", window.scrollY.toString());
    navigate(`/product/${product.id}`, { state: { from: "/shop" } });
  };

  const counts = useMemo(() => {
    const c = { ALL: products.length };
    products.forEach((p) => (c[p.category] = (c[p.category] || 0) + 1));
    return c;
  }, [products]);

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) => (selectedCategory === "ALL" || p.category === selectedCategory) && p.price <= priceRange,
      ),
    [products, selectedCategory, priceRange],
  );

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortOption === "Price: Low to High") list.sort((a, b) => a.price - b.price);
    if (sortOption === "Price: High to Low") list.sort((a, b) => b.price - a.price);
    return list;
  }, [filteredProducts, sortOption]);

  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const currentProducts = sortedProducts.slice(startIdx, startIdx + PRODUCTS_PER_PAGE);

  const goToPage = (num) => {
    setCurrentPage(Math.min(Math.max(1, num), totalPages));
    gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filterActive = selectedCategory !== "ALL" || priceRange < PRICE_MAX;
  const panelProps = {
    selectedCategory,
    onCategory: setCategory,
    priceRange,
    onPrice: (v) => {
      setPriceRange(v);
      setCurrentPage(1);
    },
    onReset: resetFilters,
    counts,
  };

  return (
    <div className="pb-20">
      {/* Header banner */}
      {/* Welcome banner — rounded frame + the original split-text animation */}
      <section className="container-page pt-3 sm:pt-4">
      <div className="relative isolate flex h-[17rem] w-full items-center justify-center overflow-hidden rounded-[1.75rem] bg-ink sm:h-[20rem] sm:rounded-[2rem] lg:h-[22rem]">
        <motion.img
          src={headerBg}
          alt=""
          className="absolute inset-0 -z-10 size-full object-cover object-[center_28%]"
          initial={{ opacity: 0, scale: 1.12 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ opacity: { duration: 0.8 }, scale: { duration: 8, ease: "easeOut" } }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/70 via-ink/55 to-ink/75" />
        <div aria-hidden="true" className="absolute -left-16 -top-16 -z-10 size-72 rounded-full bg-primary/25 blur-[90px] animate-float-slow" />

        <div className="px-4 text-center text-white">
          <h1 className="flex flex-wrap items-baseline justify-center overflow-hidden text-3xl font-extrabold tracking-[-0.03em] drop-shadow-2xl sm:text-5xl lg:text-6xl">
            <motion.span
              className="inline-block"
              initial={{ x: "-120%", opacity: 0, filter: "blur(10px)" }}
              animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            >
              Welcome to&nbsp;
            </motion.span>
            <motion.span
              className="inline-block normal-case"
              initial={{ x: "120%", opacity: 0, filter: "blur(10px)" }}
              animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="font-display font-normal italic">my</span><span className="text-accent">.</span>LIGHTSTORE
            </motion.span>
          </h1>
          <motion.p
            className="mx-auto mt-4 max-w-lg text-sm text-white/75 sm:text-lg"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            Browse our full range of ringlights, LED panels, tripods, microphones and studio accessories.
          </motion.p>
          <motion.nav
            aria-label="Breadcrumb"
            className="mt-5 text-xs text-white/60 sm:text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <Link to="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">Shop</span>
          </motion.nav>
        </div>
      </div>
      </section>

      <div className="container-page mt-10 lg:mt-14">
        <div className="flex gap-10 xl:gap-14">
          {/* Desktop sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block" aria-label="Filters">
            <div className="sticky top-[calc(var(--nav-height)+1.5rem)]">
              <h2 className="mb-6 text-lg font-bold">Filters</h2>
              <FiltersPanel {...panelProps} />
            </div>
          </aside>

          {/* Main products area */}
          <div className="min-w-0 flex-1">
            <div ref={gridTopRef} className="scroll-mt-[calc(var(--nav-height)+1rem)]" />

            {/* Mobile category chips */}
            <div className="-mx-4 mb-5 lg:hidden">
              <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
                {categories
                  .filter((c) => c === "ALL" || counts[c])
                  .map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={cn(
                        "h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors",
                        selectedCategory === c
                          ? "border-foreground bg-foreground text-background"
                          : "bg-card text-foreground/80 hover:border-foreground/40",
                      )}
                    >
                      {c === "ALL" ? "All" : categoryNavLabel(c)}
                    </button>
                  ))}
              </div>
            </div>

            {/* Toolbar */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b pb-5">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowFilters(true)} className="btn btn-outline btn-sm lg:hidden">
                  <SlidersHorizontal size={15} /> Filters
                  {filterActive && <span className="size-1.5 rounded-full bg-primary" />}
                </button>
                <p className="whitespace-nowrap text-sm text-muted-foreground" aria-live="polite">
                  {isProductsLoading ? (
                    "Loading products…"
                  ) : (
                    <>
                      <span className="font-semibold text-foreground">{filteredProducts.length}</span>{" "}
                      {filteredProducts.length === 1 ? "result" : "results"}
                    </>
                  )}
                </p>
              </div>
              <label className="flex min-w-0 items-center gap-2 text-sm">
                <span className="hidden text-muted-foreground sm:inline">Sort by</span>
                <select
                  className="input !h-9 !w-auto max-w-[11rem] !rounded-full !py-0 !pl-4 !pr-8 text-sm sm:max-w-none"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  {sortOptions.map((o) => (
                    <option key={o} value={o}>
                      {o === "Default" ? "Featured" : o}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Active filter pills */}
            {filterActive && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                {selectedCategory !== "ALL" && (
                  <button
                    onClick={() => setCategory("ALL")}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full bg-muted pl-3 pr-2 text-sm font-medium hover:bg-foreground/10"
                  >
                    {categoryNavLabel(selectedCategory)} <X size={14} />
                  </button>
                )}
                {priceRange < PRICE_MAX && (
                  <button
                    onClick={() => setPriceRange(PRICE_MAX)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full bg-muted pl-3 pr-2 text-sm font-medium hover:bg-foreground/10"
                  >
                    Up to {formatPrice(priceRange)} <X size={14} />
                  </button>
                )}
                <button onClick={resetFilters} className="ml-1 text-sm font-semibold text-primary hover:underline">
                  Clear all
                </button>
              </div>
            )}

            {/* Product grid */}
            {isProductsLoading ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 2xl:grid-cols-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : currentProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 2xl:grid-cols-4">
                {currentProducts.map((product, i) => (
                  <Reveal key={product.id} delay={(i % 3) * 0.05} y={16}>
                    <ProductCard
                      product={product}
                      onOpen={handleProductClick}
                      onAddToCart={addToCart}
                      onToggleWishlist={addToWishlist}
                      isWishlisted={isInWishlist(product.id)}
                      reviewStats={getReviewStats(allReviews, product.name)}
                      priority={i < 3}
                    />
                  </Reveal>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={PackageSearch}
                title="No products match your filters"
                description="Try a different category or raise the maximum price."
              >
                <button onClick={resetFilters} className="btn btn-primary">
                  Reset filters
                </button>
              </EmptyState>
            )}

            {!isProductsLoading && (
              <Pagination page={currentPage} totalPages={totalPages} onChange={goToPage} className="mt-14" />
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters sheet */}
      <Modal open={showFilters} onClose={() => setShowFilters(false)} variant="sheet" size="md" title="Filters">
        <div className="mt-6">
          <FiltersPanel {...panelProps} />
          <button onClick={() => setShowFilters(false)} className="btn btn-primary mt-4 w-full">
            Show {filteredProducts.length} {filteredProducts.length === 1 ? "result" : "results"}
          </button>
        </div>
      </Modal>
    </div>
  );
};
