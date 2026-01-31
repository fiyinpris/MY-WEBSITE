import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartSection";
import { useWishlist } from "./WishlistSection";
import { Heart } from "lucide-react";
import headerBg from "../Images/image 9.jpg";
import { productsAPI } from "../services/firebase";

export const ShopSection = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlistItems, addToWishlist, isInWishlist } = useWishlist();
  const [sortOption, setSortOption] = useState("Default");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [priceRange, setPriceRange] = useState(500000);
  const [showFilters, setShowFilters] = useState(false);
  const [headerImageLoaded, setHeaderImageLoaded] = useState(false);

  const [products, setProducts] = useState([]);

  // ✅ FIXED: Create a stable "shuffle" based on product ID that never changes
  const createFixedMixedOrder = (productList) => {
    return [...productList].sort((a, b) => {
      const hashA = (a.id.charCodeAt(0) * 9301 + 49297) % 233280;
      const hashB = (b.id.charCodeAt(0) * 9301 + 49297) % 233280;
      return hashA - hashB;
    });
  };

  // ✅ Load products from Firebase
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const loadedProducts = await productsAPI.getAll();
        const mixedProducts = createFixedMixedOrder(loadedProducts);
        setProducts(mixedProducts);
      } catch (error) {
        console.error("Error loading products:", error);
      }
    };

    loadProducts();

    // Reload products periodically to get new additions
    const interval = setInterval(loadProducts, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const PRODUCTS_PER_PAGE = 12;

  // Preload header image
  useEffect(() => {
    const img = new Image();
    img.src = headerBg;
    img.onload = () => setHeaderImageLoaded(true);
  }, []);

  // ✅ Filter products by category and price
  let filteredProducts = products.filter((product) => {
    const categoryMatch =
      selectedCategory === "ALL" || product.category === selectedCategory;
    const priceMatch = product.price <= priceRange;
    return categoryMatch && priceMatch;
  });

  // ✅ Apply sorting - maintains mixed order by default
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === "Price: Low to High") return a.price - b.price;
    if (sortOption === "Price: High to Low") return b.price - a.price;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const currentProducts = sortedProducts.slice(
    startIdx,
    startIdx + PRODUCTS_PER_PAGE,
  );

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

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

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleProductClick = (productId) => {
    sessionStorage.setItem("shopScrollPosition", window.scrollY.toString());
    navigate(`/product/${productId}`, { state: { from: "/shop" } });
  };

  useEffect(() => {
    const savedPosition = sessionStorage.getItem("shopScrollPosition");
    if (savedPosition) {
      setTimeout(() => {
        window.scrollTo({
          top: parseInt(savedPosition),
          behavior: "instant",
        });
        sessionStorage.removeItem("shopScrollPosition");
      }, 0);
    }
  }, []);

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
      const newWidth = e.clientX - sidebar.getBoundingClientRect().left;
      if (newWidth >= 180 && newWidth <= 300)
        sidebar.style.width = newWidth + "px";
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

  return (
    <div className="mt-12">
      {/* Hero Banner */}
      <div className="relative w-full h-100 md:h-90 lg:h-90 mb-6 md:mb-8 overflow-hidden">
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${
            headerImageLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${headerBg})` }}
        ></div>

        {!headerImageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse"></div>
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70"></div>

        <div className="relative h-full flex items-center justify-center px-4">
          <div className=" split-text-container text-white drop-shadow-2xl">
            <span className="text-2xl lg:text-7xl md:text-5xl text-part left">
              WELCOME TO&nbsp;
            </span>
            <span className="text-2xl lg:text-7xl md:text-5xl text-part right">
              my.LIGHTSTORE
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-4">
            <button
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
                className={`w-4 h-4 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
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

          {/* Sidebar */}
          <aside
            id="sidebar"
            className={`${
              showFilters ? "block" : "hidden"
            } lg:block w-full lg:w-1/5 lg:min-w-[180px] lg:max-w-[300px] space-y-6 mb-6 lg:mb-0 sticky top-24 h-[calc(100vh-6rem)]`}
          >
            <div className="space-y-6 bg-background lg:bg-transparent p-4 lg:p-0 rounded-lg lg:rounded-none shadow-lg lg:shadow-none">
              <div className="flex justify-between items-center lg:hidden mb-4">
                <h5 className="font-semibold text-lg">Filters</h5>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div>
                <h5 className="font-semibold mb-2 hidden lg:block">Filters</h5>
                <div className="space-y-4">
                  <div>
                    <ul className="space-y-2">
                      {categories.map((category) => (
                        <li
                          key={category}
                          className={`cursor-pointer hover:text-green-400 transition-colors ${
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
                  </div>

                  <div>
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
                          background: `linear-gradient(to right, #4ade80 0%, #4ade80 ${
                            ((priceRange - 10000) / (500000 - 10000)) * 100
                          }%, #e5e7eb ${
                            ((priceRange - 10000) / (500000 - 10000)) * 100
                          }%, #e5e7eb 100%)`,
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

          {/* Divider */}
          <div
            id="divider"
            className="hidden lg:block w-1 cursor-col-resize bg-gray-400"
          ></div>

          {/* Main Products */}
          <main id="main" className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-400">
                {filteredProducts.length} results
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

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {currentProducts.map((product) => (
                <div
                  key={product.id}
                  className="border p-3 md:p-4 flex flex-col items-stretch space-y-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div
                    className="w-full h-40 sm:h-48 flex items-center justify-center overflow-hidden rounded-md bg-gray-200 relative cursor-pointer"
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
                        className={`w-5 h-5 ${
                          isInWishlist(product.id)
                            ? "text-red-500 fill-red-500"
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <h6
                      className="font-semibold text-sm md:text-base cursor-pointer hover:text-green-600"
                      onClick={() => handleProductClick(product.id)}
                    >
                      {product.name}
                    </h6>
                    <p className="font-bold text-base md:text-lg text-green-600">
                      ₦{product.price.toLocaleString()}
                    </p>
                    <button
                      className="normal-button w-full py-2 text-sm md:text-base cursor-pointer"
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>



            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-6 mb-8 md:mt-8 space-x-2 md:space-x-3">
                <button
                  className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm md:text-base cursor-pointer"
                  onClick={goPrev}
                  disabled={currentPage === 1}
                >
                  ←
                </button>

                {pageNumbers[0] > 1 && (
                  <>
                    <button
                      className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-sm md:text-base"
                      onClick={() => goToPage(1)}
                    >
                      1
                    </button>
                    {pageNumbers[0] > 2 && (
                      <span className="text-gray-500 px-1 text-sm md:text-base">
                        ...
                      </span>
                    )}
                  </>
                )}

                {pageNumbers.map((num) => (
                  <button
                    key={num}
                    className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg transition-colors cursor-pointer text-sm md:text-base ${
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
                      <span className="text-gray-500 px-1 text-sm md:text-base">
                        ...
                      </span>
                    )}
                    <button
                      className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-sm md:text-base"
                      onClick={() => goToPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm md:text-base cursor-pointer"
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
