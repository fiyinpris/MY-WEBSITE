import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartSection";
import { useWishlist } from "./WishlistSection";
import { Heart } from "lucide-react";
import headerBg from "../Images/image 9.jpg";
import { productsAPI, reviewsAPI } from "../services/firebase";

// ✅ Skeleton card — shown while products are loading
const SkeletonCard = () => (
  <div className="border p-3 md:p-4 rounded-lg shadow-md flex flex-col h-full animate-pulse">
    <div className="w-full h-40 sm:h-48 rounded-md bg-gray-200 dark:bg-gray-700 mb-3" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-1/2" />
    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-1/3" />
    <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded mt-auto" />
  </div>
);

export const ShopSection = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const [sortOption, setSortOption] = useState("Default");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [priceRange, setPriceRange] = useState(500000);
  const [showFilters, setShowFilters] = useState(false);
  const [headerImageLoaded, setHeaderImageLoaded] = useState(false);
  const [products, setProducts] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);

  const PRODUCTS_PER_PAGE = 12;

  const createFixedMixedOrder = (productList) =>
    [...productList].sort((a, b) => {
      const hashA = (a.id.charCodeAt(0) * 9301 + 49297) % 233280;
      const hashB = (b.id.charCodeAt(0) * 9301 + 49297) % 233280;
      return hashA - hashB;
    });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsProductsLoading(true);
        const loadedProducts = await productsAPI.getAll();
        setProducts(createFixedMixedOrder(loadedProducts));
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsProductsLoading(false);
      }
    };
    loadProducts();

    const interval = setInterval(async () => {
      try {
        const p = await productsAPI.getAll();
        setProducts(createFixedMixedOrder(p));
      } catch {}
    }, 30000);
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

  useEffect(() => {
    const img = new Image();
    img.src = headerBg;
    img.onload = () => setHeaderImageLoaded(true);
    img.onerror = () => setHeaderImageLoaded(true);
  }, []);

  useEffect(() => {
    if (!showFilters) return;
    const handleClickOutside = (e) => {
      const sidebar = document.getElementById("sidebar");
      const btn = document.getElementById("filter-toggle-btn");
      if (
        sidebar &&
        !sidebar.contains(e.target) &&
        btn &&
        !btn.contains(e.target)
      ) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showFilters]);

  useEffect(() => {
    const divider = document.getElementById("divider");
    const sidebar = document.getElementById("sidebar");
    if (!divider || !sidebar) return;
    let isDragging = false;
    const onMouseDown = () => {
      isDragging = true;
      document.body.style.cursor = "col-resize";
    };
    const onMouseUp = () => {
      isDragging = false;
      document.body.style.cursor = "default";
    };
    const onMouseMove = (e) => {
      if (!isDragging) return;
      const w = e.clientX - sidebar.getBoundingClientRect().left;
      if (w >= 180 && w <= 300) sidebar.style.width = w + "px";
    };
    divider.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);
    return () => {
      divider.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  // ✅ FIXED: Scroll to top when component mounts, except when returning from product detail
  useEffect(() => {
    const savedPosition = sessionStorage.getItem("shopScrollPosition");
    if (savedPosition) {
      setTimeout(() => {
        window.scrollTo({ top: parseInt(savedPosition), behavior: "instant" });
        sessionStorage.removeItem("shopScrollPosition");
      }, 0);
    } else {
      // Scroll to top when navigating to shop section from anywhere else
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, []);

  const handleProductClick = (productId) => {
    sessionStorage.setItem("shopScrollPosition", window.scrollY.toString());
    navigate(`/product/${productId}`, { state: { from: "/shop" } });
  };

  const handleAddToCart = (product) => addToCart(product);

  const filteredProducts = products.filter((p) => {
    const categoryMatch =
      selectedCategory === "ALL" || p.category === selectedCategory;
    return categoryMatch && p.price <= priceRange;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === "Price: Low to High") return a.price - b.price;
    if (sortOption === "Price: High to Low") return b.price - a.price;
    return 0;
  });

  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const currentProducts = sortedProducts.slice(
    startIdx,
    startIdx + PRODUCTS_PER_PAGE,
  );

  const getPageNumbers = () => {
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1)
      startPage = Math.max(1, endPage - maxVisible + 1);
    const pages = [];
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  const goPrev = () => {
    setCurrentPage((p) => Math.max(1, p - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goNext = () => {
    setCurrentPage((p) => Math.min(totalPages, p + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goToPage = (num) => {
    setCurrentPage(num);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const categories = [
    "ALL",
    "RINGLIGHT",
    "LED LIGHT",
    "INFLUENCER LIGHT",
    "TRIPOD STAND",
    "MICROPHONE",
    "SOFTBOX",
    "ACCESSORIES",
    "BACKDROP",
  ];
  const pageNumbers = getPageNumbers();
  const SKELETON_COUNT = 8;

  return (
    <div className="mt-12">
      {/* Hero Banner */}
      <div className="relative w-full h-100 md:h-90 lg:h-90 2xl:h-400 mb-6 md:mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${headerImageLoaded ? "opacity-100" : "opacity-0"}`}
          style={{ backgroundImage: `url(${headerBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
        <div className="relative h-full flex items-center justify-center px-4">
          <div className="split-text-container text-white drop-shadow-2xl">
            <span className="text-xl lg:text-7xl md:text-5xl text-part left">
              WELCOME TO&nbsp;
            </span>
            <span className="text-xl lg:text-7xl md:text-5xl text-part right">
              my.LIGHTSTORE
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-4">
            <button
              id="filter-toggle-btn"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full px-4 py-2 bg-green-400 text-white rounded-lg flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <span>
                  {selectedCategory === "MICROPHONE"
                    ? "MICROPHONES"
                    : selectedCategory}
                </span>
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {/* ✅ Sidebar — scrollbar fully hidden */}
          <aside
            id="sidebar"
            className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-1/5 lg:min-w-[180px] lg:max-w-[300px] mb-6 lg:mb-0 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto`}
            style={{
              scrollbarWidth: "none" /* Firefox */,
              msOverflowStyle: "none" /* IE/Edge */,
            }}
          >
            {/* Hide WebKit scrollbar via inline style trick */}
            <style>{`
              #sidebar::-webkit-scrollbar { display: none; }
            `}</style>

            <div className="w-full lg:h-full bg-background lg:bg-transparent p-4 lg:p-0 rounded-lg lg:rounded-none shadow-lg lg:shadow-none inline-block lg:block">
              <div className="flex justify-between items-center lg:hidden mb-4">
                <h5 className="font-semibold text-lg">Filters</h5>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                >
                  ✕
                </button>
              </div>

              <div>
                <h5 className="font-semibold mb-2 hidden lg:block">Filters</h5>
                <div className="space-y-0">
                  {/* ✅ Each category has its own bottom border */}
                  <ul className="space-y-0">
                    {categories.map((category) => (
                      <li
                        key={category}
                        className={`cursor-pointer hover:text-green-400 transition-colors py-2 border-b border-gray-300 dark:border-gray-600 ${
                          selectedCategory === category
                            ? "text-green-400 font-semibold"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedCategory(category);
                          setCurrentPage(1);
                          setShowFilters(false);
                        }}
                      >
                        {category === "MICROPHONE" ? "MICROPHONES" : category}
                      </li>
                    ))}
                  </ul>

                  {/* ✅ Divider between categories and price */}
                  <div className="pt-4">
                    <h6 className="font-medium mb-2">Price</h6>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">₦10K</span>
                      <input
                        type="range"
                        min="10000"
                        max="500000"
                        step="5000"
                        value={priceRange}
                        onChange={(e) => {
                          setPriceRange(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="w-full accent-green-400"
                        style={{
                          background: `linear-gradient(to right, #4ade80 0%, #4ade80 ${((priceRange - 10000) / 490000) * 100}%, #e5e7eb ${((priceRange - 10000) / 490000) * 100}%, #e5e7eb 100%)`,
                        }}
                      />
                      <span className="text-sm">₦500K</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold">
                      Max: ₦{priceRange.toLocaleString()}
                    </div>
                    <button
                      className="px-3 py-1 border rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => {
                        setPriceRange(500000);
                        setCurrentPage(1);
                      }}
                    >
                      Reset Filter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div
            id="divider"
            className="hidden lg:block w-1 cursor-col-resize bg-gray-400"
          />

          {/* Main Products Area */}
          <main id="main" className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-400">
                {isProductsLoading
                  ? "Loading..."
                  : `${filteredProducts.length} results`}
              </p>
              <select
                className="border rounded px-3 py-2 text-sm bg-background"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option>Default</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6 mb-8">
              {isProductsLoading
                ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))
                : currentProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border p-3 md:p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
                    >
                      <div
                        className="w-full h-40 sm:h-48 2xl:h-150 flex items-center justify-center overflow-hidden rounded-md bg-gray-200 relative cursor-pointer mb-3"
                        onClick={() => handleProductClick(product.id)}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <button
                          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-100 cursor-pointer z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToWishlist(product);
                          }}
                        >
                          <Heart
                            className={`w-5 h-5 ${isInWishlist(product.id) ? "text-red-500 fill-red-500" : "text-gray-400"}`}
                          />
                        </button>
                      </div>
                      <div className="flex flex-col flex-1">
                        <h6
                          className="font-semibold text-sm md:text-base cursor-pointer hover:text-green-600 mb-2 line-clamp-2 min-h-[40px]"
                          onClick={() => handleProductClick(product.id)}
                        >
                          {product.name}
                        </h6>
                        <p className="font-bold text-base md:text-lg text-green-600 mb-3 min-h-[28px]">
                          ₦{product.price.toLocaleString()}
                        </p>
                        <button
                          className="normal-button w-full py-2 text-sm md:text-base cursor-pointer mt-auto"
                          onClick={() => handleAddToCart(product)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
            </div>

            {/* Pagination */}
            {!isProductsLoading && totalPages > 1 && (
              <div className="flex justify-center items-center mt-6 mb-8 md:mt-8 space-x-2 md:space-x-3">
                <button
                  className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
                  onClick={goPrev}
                  disabled={currentPage === 1}
                >
                  ←
                </button>
                {pageNumbers[0] > 1 && (
                  <>
                    <button
                      className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm md:text-base"
                      onClick={() => goToPage(1)}
                    >
                      1
                    </button>
                    {pageNumbers[0] > 2 && (
                      <span className="text-gray-500 px-1 text-sm">...</span>
                    )}
                  </>
                )}
                {pageNumbers.map((num) => (
                  <button
                    key={num}
                    className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg transition-colors text-sm md:text-base ${
                      num === currentPage
                        ? "bg-green-600 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => goToPage(num)}
                  >
                    {num}
                  </button>
                ))}
                {pageNumbers[pageNumbers.length - 1] < totalPages && (
                  <>
                    {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                      <span className="text-gray-500 px-1 text-sm">...</span>
                    )}
                    <button
                      className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm md:text-base"
                      onClick={() => goToPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                <button
                  className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
                  onClick={goNext}
                  disabled={currentPage === totalPages}
                >
                  →
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
