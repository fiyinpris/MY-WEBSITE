import { useEffect, useState } from "react";
import { useCart } from "./CartSection";
import { useWishlist } from "./WishlistSection";
import { Heart } from "lucide-react";
import headerBg from "../Images/image 9.jpg";

// Additional product images - UPDATE THESE PATHS TO MATCH YOUR ACTUAL FILES
import microphone1 from "../Images/image M.jpeg";
import ringlight1 from "../Images/image R.jpeg";
import softbox1 from "../Images/image S.jpeg";
import ringlight2 from "../Images/image R4.jpeg";
import tripodStand1 from "../Images/image T1.jpeg";
import ledLight1 from "../Images/image L.jpeg";
import ringlight3 from "../Images/image R3.jpeg";
import tripodStand2 from "../Images/image T.jpeg";
import ledLight2 from "../Images/image L1.jpeg";
import tripodStand3 from "../Images/image T4.jpeg";
import tripodStand4 from "../Images/image T1.jpeg";

export const ShopSection = () => {
  const { addToCart } = useCart();
  const { wishlistItems, addToWishlist, isInWishlist } = useWishlist();
  const [sortOption, setSortOption] = useState("Default");
  const [wishlist, setWishlist] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [priceRange, setPriceRange] = useState(200000);
  const [showFilters, setShowFilters] = useState(false);
  const [headerImageLoaded, setHeaderImageLoaded] = useState(false);

  const products = [
    { id: 1, name: "RINGLIGHT", price: 35000, image: ringlight1 },
    { id: 2, name: "TRIPOD STAND", price: 12000, image: tripodStand1 },
    { id: 3, name: "LEDLIGHT", price: 35000, image: ledLight1 },
    { id: 4, name: "SOFTBOX", price: 10000, image: softbox1 },
    { id: 5, name: "MICROPHONE", price: 30000, image: microphone1 },
    { id: 6, name: "RINGLIGHT", price: 35000, image: ringlight2 },
    { id: 7, name: "SOFTBOX", price: 100000, image: softbox1 },
    { id: 8, name: "MICROPHONE", price: 30000, image: microphone1 },
    { id: 9, name: "RINGLIGHT", price: 35000, image: ringlight3 },
    { id: 10, name: "TRIPOD STAND", price: 12000, image: tripodStand2 },
    { id: 11, name: "LEDLIGHT", price: 35000, image: ledLight2 },
    { id: 12, name: "SOFTBOX", price: 10000, image: softbox1 },
    { id: 13, name: "MICROPHONE", price: 30000, image: microphone1 },
    { id: 14, name: "RINGLIGHT", price: 35000, image: ringlight1 },
    { id: 15, name: "SOFTBOX", price: 10000, image: softbox1 },
    { id: 16, name: "MICROPHONE", price: 30000, image: microphone1 },
    { id: 17, name: "RINGLIGHT", price: 35000, image: ringlight2 },
    { id: 18, name: "TRIPOD STAND", price: 12000, image: tripodStand3 },
    { id: 19, name: "LEDLIGHT", price: 35000, image: ledLight1 },
    { id: 20, name: "SOFTBOX", price: 10000, image: softbox1 },
    { id: 21, name: "MICROPHONE", price: 30000, image: microphone1 },
    { id: 22, name: "RINGLIGHT", price: 35000, image: ringlight3 },
    { id: 23, name: "TRIPOD STAND", price: 12000, image: tripodStand1 },
    { id: 24, name: "LEDLIGHT", price: 35000, image: ledLight2 },
    { id: 25, name: "SOFTBOX", price: 10000, image: softbox1 },
    { id: 26, name: "MICROPHONE", price: 30000, image: microphone1 },
    { id: 27, name: "RINGLIGHT", price: 35000, image: ringlight1 },
    { id: 28, name: "TRIPOD STAND", price: 12000, image: tripodStand2 },
    { id: 29, name: "LEDLIGHT", price: 35000, image: ledLight1 },
    { id: 30, name: "SOFTBOX", price: 10000, image: softbox1 },
    { id: 31, name: "MICROPHONE", price: 30000, image: microphone1 },
    { id: 32, name: "RINGLIGHT", price: 35000, image: ringlight2 },
    { id: 33, name: "SOFTBOX", price: 10000, image: softbox1 },
    { id: 34, name: "MICROPHONE", price: 30000, image: microphone1 },
    { id: 35, name: "RINGLIGHT", price: 35000, image: ringlight3 },
    { id: 36, name: "TRIPOD STAND", price: 12000, image: tripodStand3 },
    { id: 37, name: "LEDLIGHT", price: 35000, image: ledLight2 },
    { id: 38, name: "SOFTBOX", price: 10000, image: softbox1 },
    { id: 39, name: "MICROPHONE", price: 30000, image: microphone1 },
    { id: 40, name: "RINGLIGHT", price: 35000, image: ringlight1 },
    { id: 41, name: "SOFTBOX", price: 10000, image: softbox1 },
    { id: 42, name: "MICROPHONE", price: 30000, image: microphone1 },
    { id: 43, name: "RINGLIGHT", price: 35000, image: ringlight2 },
    { id: 44, name: "TRIPOD STAND", price: 12000, image: tripodStand1 },
    { id: 45, name: "LEDLIGHT", price: 35000, image: ledLight1 },
    { id: 46, name: "SOFTBOX", price: 10000, image: softbox1 },
    { id: 47, name: "MICROPHONE", price: 30000, image: microphone1 },
    { id: 48, name: "RINGLIGHT", price: 35000, image: ringlight3 },
    { id: 49, name: "TRIPOD STAND", price: 12000, image: tripodStand2 },
    { id: 50, name: "LEDLIGHT", price: 35000, image: ledLight2 },
    { id: 51, name: "SOFTBOX", price: 10000, image: softbox1 },
    { id: 52, name: "MICROPHONE", price: 30000, image: microphone1 },
    { id: 53, name: "RINGLIGHT", price: 35000, image: ringlight1 },
    { id: 54, name: "SOFTBOX", price: 10000, image: softbox1 },
    { id: 55, name: "MICROPHONE", price: 30000, image: microphone1 },
    { id: 56, name: "RINGLIGHT", price: 35000, image: ringlight2 },
    { id: 57, name: "TRIPOD STAND", price: 12000, image: tripodStand3 },
    { id: 58, name: "LEDLIGHT", price: 35000, image: ledLight1 },
    { id: 59, name: "SOFTBOX", price: 10000, image: softbox1 },
    { id: 60, name: "MICROPHONE", price: 30000, image: microphone1 },
    { id: 61, name: "RINGLIGHT", price: 35000, image: ringlight3 },
    { id: 62, name: "TRIPOD STAND", price: 12000, image: tripodStand4 },
    { id: 63, name: "LEDLIGHT", price: 35000, image: ledLight2 },
  ];

  const PRODUCTS_PER_PAGE = 12;

  // Preload header image
  useEffect(() => {
    const img = new Image();
    img.src = headerBg;
    img.onload = () => setHeaderImageLoaded(true);
  }, []);

  const handleAddToWishlist = (product) => {
    if (wishlist.find((item) => item.id === product.id)) {
      setWishlist(wishlist.filter((item) => item.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  const filteredProducts = products.filter((product) => {
    const categoryMatch =
      selectedCategory === "ALL" || product.name.includes(selectedCategory);
    const priceMatch = product.price <= priceRange;
    return categoryMatch && priceMatch;
  });

  // Apply sorting before pagination
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === "Price: Low to High") return a.price - b.price;
    if (sortOption === "Price: High to Low") return b.price - a.price;
    return 0; // Default, no sorting
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const currentProducts = sortedProducts.slice(
    startIdx,
    startIdx + PRODUCTS_PER_PAGE
  );

  const getPageNumbers = () => {
    let pages = [];
    for (let i = currentPage; i < currentPage + 3 && i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const showLeftDots = currentPage > 1;
  const showRightDots = pageNumbers[pageNumbers.length - 1] < totalPages;

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

  return (
    <div className="mt-12">
      {/* Hero Banner with Loading State */}
      <div className="relative w-full h-100 md:h-90 lg:h-90 mb-6 md:mb-8 overflow-hidden">
        {/* Background Image */}
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${
            headerImageLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${headerBg})` }}
        ></div>

        {/* Loading placeholder - shown while image loads */}
        {!headerImageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse"></div>
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70"></div>

        {/* Text content */}
        <div className="relative h-full flex items-center justify-center px-4">
          <div className="split-text-container text-white drop-shadow-2xl">
            <span className="text-part left">WELCOME TO&nbsp;</span>
            <span className="text-part right">my.LIGHTSTORE</span>
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
                      {[
                        "ALL",
                        "RINGLIGHT",
                        "LEDLIGHT",
                        "TRIPOD STAND",
                        "MICROPHONE",
                        "SOFTBOX",
                      ].map((category) => (
                        <li
                          key={category}
                          className={`cursor-pointer hover:text-green-400 ${
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
                      <li className="cursor-pointer hover:text-green-400">
                        ACCESSORIES
                      </li>
                      <li className="cursor-pointer hover:text-green-400">
                        BACKDROP
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h6 className="font-medium mb-2">Price</h6>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">₦10K</span>
                      <input
                        type="range"
                        min="10000"
                        max="200000"
                        step="1000"
                        value={priceRange}
                        onChange={(e) => {
                          setPriceRange(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="w-full"
                      />
                      <span className="text-sm">₦200K</span>
                    </div>
                    <div className="text-sm text-gray-400 mb-2">
                      Max: ₦{priceRange.toLocaleString()}
                    </div>
                    <button
                      className="px-3 py-1 border rounded text-sm hover:bg-gray-400"
                      onClick={() => {
                        setPriceRange(1000);
                        setCurrentPage(1);
                      }}
                    >
                      Clear
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

            {/* Product Grid - 3 columns x 4 rows = 12 products */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {currentProducts.map((product) => (
                <div
                  key={product.id}
                  className="border p-3 md:p-4 flex flex-col items-stretch space-y-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Image container with loading */}
                  <div className="w-full h-40 sm:h-48 flex items-center justify-center overflow-hidden rounded-md bg-gray-200 relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />

                    {/* Wishlist button */}
                    <button
                      className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-100 cursor-pointer"
                      onClick={() => addToWishlist(product)}
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

                  {/* Product details */}
                  <div className="flex flex-col space-y-2">
                    <h6 className="font-semibold text-sm md:text-base">
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
            <div className="flex justify-center items-center mt-6 mb-8 md:mt-8 space-x-2 md:space-x-3">
              <button
                className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm md:text-base cursor-pointer"
                onClick={goPrev}
                disabled={currentPage === 1}
              >
                ←
              </button>

              {showLeftDots && (
                <span className="text-gray-500 px-1 text-sm md:text-base">
                  ...
                </span>
              )}

              <div className="flex space-x-2 md:space-x-3 rounded-lg p-1">
                {pageNumbers.map((num) => (
                  <button
                    key={num}
                    className={`w-8 h-8 md:w-10 cursor-pointer md:h-10 flex items-center justify-center rounded-lg transition-colors text-sm md:text-base ${
                      num === currentPage
                        ? "bg-green-600 text-white"
                        : "hover:bg-gray-400"
                    }`}
                    onClick={() => goToPage(num)}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {showRightDots && (
                <>
                  <span className="text-gray-500 px-1 text-sm md:text-base">
                    ...
                  </span>
                  <div className="rounded-lg p-1">
                    <button
                      className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg hover:bg-gray-50 text-sm md:text-base cursor-pointer"
                      onClick={() => goToPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </div>
                </>
              )}

              <button
                className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm md:text-base cursor-pointer"
                onClick={goNext}
                disabled={currentPage === totalPages}
              >
                →
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
