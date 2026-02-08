import {
  ChevronDown,
  Heart,
  ShoppingCart,
  X,
  Eye,
  Star,
  ArrowLeft,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "./CartSection";
import { useWishlist } from "./WishlistSection";
import { productsAPI, reviewsAPI } from "../services/firebase";

/* ================= IMAGES FOR HERO SLIDER ================= */
import Slider1 from "../Images/image 20.jpg";
import Slider2 from "../Images/image 21.jpg";
import Slider3 from "../Images/image 23.jpg";

// ✅ GREEN LOADING SPINNER COMPONENT
const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 z-[9999] flex items-center justify-center backdrop-blur-sm">
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
  );
};

export const ProductSection = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isTabsFixed, setIsTabsFixed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);

  // ✅ LOADING STATE
  const [isLoading, setIsLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // ✅ NEW: Products from Firebase
  const [products, setProducts] = useState([]);

  // ✅ NEW: Reviews from Firebase
  const [allReviews, setAllReviews] = useState([]);

  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  const tabs = [
    { name: "sale", label: "SALE" },
    { name: "hot", label: "HOT" },
    { name: "newarrivals", label: "NEW ARRIVALS" },
    { name: "all", label: "ALL" },
  ];

  const categories = [
    "All",
    "RINGLIGHT",
    "LED LIGHT",
    "INFLUENCER LIGHT",
    "TRIPOD STAND",
    "MICROPHONE",
    "SOFTBOX",
    "ACCESSORIES",
    "BACKDROP",
  ];

  const heroSlides = [
    {
      image: Slider1,
      title: "MEGA SALE",
      subtitle: "Up to 90% OFF",
      description: "Limited time offer on selected products",
      buttonText: "Shop Sale",
      tabName: "sale",
    },
    {
      image: Slider2,
      title: "HOT DEALS",
      subtitle: "Trending Now",
      description: "Most popular items flying off the shelves",
      buttonText: "Shop Hot Deals",
      tabName: "hot",
    },
    {
      image: Slider3,
      title: "NEW ARRIVALS",
      subtitle: "Just Launched",
      description: "Fresh stock of premium lighting equipment",
      buttonText: "Explore New",
      tabName: "newarrivals",
    },
  ];

  // ✅ Load products from Firebase
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const loadedProducts = await productsAPI.getAll();
        setProducts(loadedProducts);
      } catch (error) {
        console.error("Error loading products:", error);
      }
    };

    loadProducts();

    // Reload products periodically
    const interval = setInterval(async () => {
      try {
        const loadedProducts = await productsAPI.getAll();
        setProducts(loadedProducts);
      } catch (error) {
        console.error("Error reloading products:", error);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // ✅ Load reviews from Firebase
  useEffect(() => {
    const loadReviews = async () => {
      try {
        const loadedReviews = await reviewsAPI.getAll();
        setAllReviews(loadedReviews || []);
      } catch (error) {
        console.error("Error loading reviews:", error);
        setAllReviews([]);
      }
    };

    loadReviews();

    // Reload reviews periodically
    const interval = setInterval(loadReviews, 30000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Preload hero images
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = heroSlides.map((slide) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = slide.image;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      try {
        await Promise.all(imagePromises);
        setImagesLoaded(true);
      } catch (error) {
        console.error("Error preloading images:", error);
        setImagesLoaded(true);
      }
    };

    preloadImages();
  }, []);

  // ✅ Hide loading spinner after images load
  useEffect(() => {
    if (imagesLoaded) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [imagesLoaded]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging) {
        setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isDragging]);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight =
        document.querySelector(".hero-section")?.offsetHeight || 0;
      if (window.scrollY > heroHeight) {
        setIsTabsFixed(true);
      } else {
        setIsTabsFixed(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const nextSlide = () =>
    setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);

  const prevSlide = () =>
    setCurrentHeroSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
    );

  // Hero carousel drag handlers
  const handleHeroDragStart = (e) => {
    setDragStart(e.type === "mousedown" ? e.clientX : e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleHeroDragEnd = (e) => {
    if (!isDragging) return;
    const dragEnd =
      e.type === "mouseup" ? e.clientX : e.changedTouches[0].clientX;
    const diff = dragStart - dragEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
      } else {
        setCurrentHeroSlide(
          (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
        );
      }
    }
    setIsDragging(false);
  };

  // Hero carousel wheel handler
  const handleHeroWheel = (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      if (e.deltaX > 30) {
        setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
      } else if (e.deltaX < -30) {
        setCurrentHeroSlide(
          (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
        );
      }
    }
  };

  // ✅ Filter products based on tags and category
  const filteredProducts = products.filter((product) => {
    // Filter by tag (sale, hot, newArrivals, or all)
    let matchTag = false;
    if (activeTab === "all") {
      // ALL tab shows only products with at least one tag (sale, hot, or newArrivals)
      matchTag =
        product.tags?.sale === true ||
        product.tags?.hot === true ||
        product.tags?.newArrivals === true;
    } else if (activeTab === "sale") {
      matchTag = product.tags?.sale === true;
    } else if (activeTab === "hot") {
      matchTag = product.tags?.hot === true;
    } else if (activeTab === "newarrivals") {
      matchTag = product.tags?.newArrivals === true;
    }

    // Filter by category
    const matchCategory =
      selectedCategory === "All" ? true : product.category === selectedCategory;

    return matchTag && matchCategory;
  });

  // ✅ Get review count for a product
  const getProductReviewCount = (productName) => {
    return allReviews.filter(
      (review) =>
        review.productName?.toLowerCase() === productName?.toLowerCase(),
    ).length;
  };

  // ✅ Get average rating for a product
  const getProductAverageRating = (productName) => {
    const productReviews = allReviews.filter(
      (review) =>
        review.productName?.toLowerCase() === productName?.toLowerCase(),
    );

    if (productReviews.length === 0) return 0;

    const totalRating = productReviews.reduce(
      (sum, review) => sum + (review.rating || 0),
      0,
    );
    return totalRating / productReviews.length;
  };

  // ✅ Scroll to reviews section
  const scrollToReviews = () => {
    const reviewsSection = document.querySelector(
      ".flex.flex-col.justify-center.items-center.bg-green-200",
    );
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: "smooth", block: "center" });
      setSelectedProduct(null);
    }
  };

  const openModal = (product) => setSelectedProduct(product);

  const handleAddToCart = (product) => {
    addToCart(product);
    setSelectedProduct(null);
  };

  const handleQuickAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleHeroButtonClick = (tabName) => {
    setActiveTab(tabName);
    setSelectedCategory("All");
    setTimeout(() => {
      const productsSection = document.querySelector(".grid");
      if (productsSection) {
        const offset = 100;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = productsSection.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  const renderStars = (rating, size = 14) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    for (let i = 0; i < 5; i++) {
      if (i < fullStars)
        stars.push(
          <Star
            key={i}
            size={size}
            className="text-yellow-400 fill-yellow-400"
          />,
        );
      else if (i === fullStars && hasHalfStar)
        stars.push(
          <div key={i} className="relative inline-block">
            <Star size={size} className="text-gray-300" />
            <div
              className="absolute top-0 left-0 overflow-hidden"
              style={{ width: "50%" }}
            >
              <Star size={size} className="text-yellow-400 fill-yellow-400" />
            </div>
          </div>,
        );
      else stars.push(<Star key={i} size={size} className="text-gray-300" />);
    }
    return stars;
  };

  return (
    <section className="homepage-product-section relative w-full overflow-hidden">
      {/* ✅ LOADING SPINNER */}
      {isLoading && <LoadingSpinner />}

      {/* ================= HERO SLIDER ================= */}
      <div className="hero-section relative w-full overflow-hidden py-3">
        <div
          className="relative w-full mt-10.5 lg:h-[75vh] md:h-[75vh] h-[75vh] py-3 cursor-grab active:cursor-grabbing"
          onMouseDown={handleHeroDragStart}
          onMouseUp={handleHeroDragEnd}
          onMouseLeave={() => setIsDragging(false)}
          onTouchStart={handleHeroDragStart}
          onTouchEnd={handleHeroDragEnd}
          onWheel={handleHeroWheel}
        >
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-[1.5s] ease-out ${
                index === currentHeroSlide
                  ? "opacity-100 scale-100 z-10"
                  : "opacity-0 scale-110 z-0"
              }`}
            >
              <div className="relative w-full h-full overflow-hidden">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out"
                  style={{
                    transform:
                      index === currentHeroSlide ? "scale(1)" : "scale(1.1)",
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white space-y-3 px-4">
                  <h1
                    className={`relative text-5xl md:text-7xl lg:text-8xl font-extrabold transition-all duration-[1.2s] ease-out ${
                      index === currentHeroSlide
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-full"
                    }`}
                    style={{
                      transitionDelay:
                        index === currentHeroSlide ? "0.3s" : "0s",
                    }}
                  >
                    {slide.title}
                    <span
                      className={`inline-block ${index === currentHeroSlide ? "bouncy-period" : ""}`}
                      style={{
                        animationDelay:
                          index === currentHeroSlide ? "1.5s" : "0s",
                      }}
                    >
                      .
                    </span>
                  </h1>

                  <p
                    className={`text-2xl md:text-4xl font-bold text-yellow-300 transition-all duration-[1.2s] ease-out ${
                      index === currentHeroSlide
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 translate-x-full"
                    }`}
                    style={{
                      transitionDelay:
                        index === currentHeroSlide ? "0.6s" : "0s",
                    }}
                  >
                    {slide.subtitle}
                    <span
                      className={`inline-block ${index === currentHeroSlide ? "bouncy-period" : ""}`}
                      style={{
                        animationDelay:
                          index === currentHeroSlide ? "1.8s" : "0s",
                      }}
                    >
                      .
                    </span>
                  </p>

                  <p
                    className={`max-w-2xl text-white/90 text-sm md:text-base transition-all duration-[1.2s] ease-out ${
                      index === currentHeroSlide
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-full"
                    }`}
                    style={{
                      transitionDelay:
                        index === currentHeroSlide ? "0.9s" : "0s",
                    }}
                  >
                    {slide.description}
                    <span
                      className={`inline-block ${index === currentHeroSlide ? "bouncy-period" : ""}`}
                      style={{
                        animationDelay:
                          index === currentHeroSlide ? "2.1s" : "0s",
                      }}
                    >
                      .
                    </span>
                  </p>

                  <button
                    onClick={() => handleHeroButtonClick(slide.tabName)}
                    className={`liquid-button relative px-8 py-3 rounded-full font-semibold cursor-pointer transition-all duration-[1.2s] ease-out overflow-hidden ${
                      index === currentHeroSlide
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-50"
                    }`}
                    style={{
                      transitionDelay:
                        index === currentHeroSlide ? "1.2s" : "0s",
                    }}
                  >
                    <span className="relative z-10 text-white">
                      {slide.buttonText}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-gray-800 p-2 sm:p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer group"
          aria-label="Previous slide"
        >
          <ArrowLeft size={16} className="sm:w-4 sm:h-4" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-gray-800 p-2 sm:p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer group"
          aria-label="Next slide"
        >
          <ArrowRight size={16} className="sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* ================= TABS ================= */}
      <div
        className={`${
          isTabsFixed ? "fixed top-[60px] left-0 right-0" : "relative"
        } z-30 border backdrop-blur-md shadow-lg transition-all duration-300`}
      >
        <div className="w-full overflow-x-auto scrollbar-hide">
          <div className="flex justify-start lg:justify-center gap-2 sm:gap-3 md:gap-6 lg:gap-12 py-3 sm:py-4 px-3 sm:px-4 min-w-max lg:min-w-0">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => {
                  setActiveTab(tab.name);
                  setSelectedCategory("All");
                }}
                className={`px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-300 border-2 ${
                  activeTab === tab.name
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-card text-foreground border-border hover:border-green-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Spacer when tabs are fixed */}
      {isTabsFixed && <div className="h-[60px] sm:h-[68px] md:h-[72px]"></div>}

      {/* ================= PRODUCTS FROM FIREBASE - FIXED ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 max-w-[1920px] mx-3 lg:mx-10 lg:px-4 xl:mx-auto mb-20 my-7">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => {
            const reviewCount = getProductReviewCount(product.name);
            const avgRating = getProductAverageRating(product.name);

            return (
              <div
                key={product.id}
                tabIndex={0}
                className="homepage-product-card p-3 md:p-4 flex flex-col items-stretch space-y-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border group focus:outline-none cursor-pointer h-full"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
                onClick={() => openModal(product)}
              >
                {/* Product Image */}
                <div className="relative overflow-hidden">
                  {product.discount && (
                    <span className="absolute top-2 left-2 z-20 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
                      {product.discount}
                    </span>
                  )}

                  {/* Heart & Eye buttons on hover */}
                  <div className="absolute top-2 right-2 z-20 flex flex-col gap-2 opacity-0 group-focus-within:opacity-100 md:group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToWishlist(product);
                      }}
                      className="bg-card p-1.5 sm:p-2 rounded-full shadow-lg cursor-pointer hover:bg-red-50 hover:scale-110 transition-all duration-200"
                    >
                      <Heart
                        size={16}
                        className={
                          isInWishlist(product.id)
                            ? "text-red-500 fill-red-500"
                            : "text-gray-600 hover:text-red-500"
                        }
                      />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(product);
                      }}
                      className="bg-card p-1.5 sm:p-2 rounded-full shadow-lg cursor-pointer hover:bg-green-50 hover:scale-110 transition-all duration-200"
                    >
                      <Eye
                        size={16}
                        className="text-gray-600 hover:text-green-600"
                      />
                    </button>
                  </div>

                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-46 object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Quick Add */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent transition-all duration-300 ${
                      hoveredProduct === product.id
                        ? "translate-y-0 opacity-100"
                        : "translate-y-full opacity-0"
                    }`}
                  >
                    <button
                      onClick={(e) => handleQuickAddToCart(e, product)}
                      className="liquid-button-small w-full font-semibold py-2 text-xs sm:text-sm rounded-md transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden"
                    >
                      <span className="relative z-10 text-white flex items-center gap-2">
                        <ShoppingCart size={14} /> Quick Add
                      </span>
                    </button>
                  </div>
                </div>

                {/* Product Details - FIXED */}
                <div className="flex flex-col flex-1">
                  <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2 line-clamp-2 min-h-[40px]">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-3 min-h-[28px]">
                    <span className="text-base sm:text-lg font-bold text-green-600">
                      ₦{product.price.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(product);
                    }}
                    className="liquid-button-small w-full font-semibold py-2 text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden mt-auto"
                  >
                    <span className="relative z-10 text-white flex items-center gap-2">
                      <ShoppingCart size={14} /> Add to Cart
                    </span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-20">
            <div className="text-4xl sm:text-6xl mb-4">🔍</div>
            <p className="text-lg sm:text-xl text-gray-500">
              No products available right now
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Please check back again later.
            </p>
          </div>
        )}
      </div>

      {/* Product Modal - FIXED FOR MOBILE */}
      {selectedProduct &&
        (() => {
          const reviewCount = getProductReviewCount(selectedProduct.name);
          const avgRating = getProductAverageRating(selectedProduct.name);

          return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 animate-fadeIn">
              <div className="bg-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6 md:p-8">
                  {/* Image Section */}
                  <div className="relative">
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="bg-card absolute top-1 right-0 z-10 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 p-2 rounded-full shadow-lg transition-colors cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                    <div className="relative rounded-xl overflow-hidden bg-gray-100">
                      {selectedProduct.discount && (
                        <span className="absolute top-4 left-4 bg-red-500 text-white text-xs sm:text-sm font-bold px-3 py-2 rounded-md shadow-lg z-10">
                          {selectedProduct.discount}
                        </span>
                      )}
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="w-full h-64 sm:h-80 md:h-96 object-cover"
                      />
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="flex flex-col gap-8">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {selectedProduct.name}
                      </h2>

                      <p className="text-sm sm:text-base text-gray-400 dark:text-gray-400 mb-4">
                        Category: {selectedProduct.category}
                      </p>

                      <p className="text-sm sm:text-base text-gray-400 mb-6 leading-relaxed">
                        {selectedProduct.description ||
                          "High-quality product for your needs"}
                      </p>

                      {/* Price */}
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2.5 sm:p-3 w-32">
                        <div className="flex items-center gap-2">
                          <span className="text-xl sm:text-2xl font-semibold text-green-600">
                            ₦{selectedProduct.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons - FIXED */}
                    <div className="flex flex-row gap-2 mb-10 sm:gap-3">
                      {/* Add to Cart */}
                      <button
                        onClick={() => handleAddToCart(selectedProduct)}
                        className="liquid-button-modal flex-1 font-semibold py-2.5 sm:py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg text-xs sm:text-sm cursor-pointer relative overflow-hidden"
                      >
                        <span className="relative z-10 text-white flex items-center gap-1.5">
                          <ShoppingCart size={16} />
                          Add to Cart
                        </span>
                      </button>

                      {/* Buy Now */}
                      <button
                        onClick={() => handleAddToCart(selectedProduct)}
                        className="liquid-button-modal flex-1 font-semibold py-2.5 sm:py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-xs sm:text-sm cursor-pointer relative overflow-hidden"
                      >
                        <span className="relative z-10 text-white">
                          Buy Now
                        </span>
                      </button>

                      {/* Wishlist */}
                      <button
                        onClick={() => addToWishlist(selectedProduct)}
                        className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2.5 sm:py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 text-xs sm:text-sm cursor-pointer"
                      >
                        <Heart
                          size={16}
                          className={
                            isInWishlist(selectedProduct.id)
                              ? "text-red-500 fill-red-500"
                              : ""
                          }
                        />
                        {isInWishlist(selectedProduct.id)
                          ? "In Wishlist"
                          : "Wishlist"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      <style jsx>{`
        /* Hide scrollbar for tab container */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

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

        @keyframes bouncyPeriod {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          25% {
            transform: translateY(-15px) scale(1.2);
          }
          50% {
            transform: translateY(0) scale(1);
          }
          65% {
            transform: translateY(-8px) scale(1.1);
          }
          80% {
            transform: translateY(0) scale(1);
          }
        }

        @keyframes liquidFill {
          0% {
            transform: translateY(100%) scale(1.5);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideInRight {
          animation: slideInRight 0.4s ease-out;
        }

        .bouncy-period {
          animation: bouncyPeriod 1s ease-out;
          transform-origin: center center;
          display: inline-block;
          vertical-align: baseline;
          will-change: transform;
        }

        /* Liquid Button Styles */
        .liquid-button::before,
        .liquid-button-small::before,
        .liquid-button-modal::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          border-radius: inherit;
          transform: translateY(100%) scale(1.5);
          transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 0;
        }

        .liquid-button::after,
        .liquid-button-small::after,
        .liquid-button-modal::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #16a34a;
          border-radius: inherit;
          z-index: 0;
        }

        .liquid-button:hover::before,
        .liquid-button-small:hover::before,
        .liquid-button-modal:hover::before {
          transform: translateY(0) scale(1);
          animation: liquidFill 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .liquid-button:active,
        .liquid-button-small:active,
        .liquid-button-modal:active {
          transform: scale(0.95);
        }

        /* Scoped styles for homepage product cards */
        .homepage-product-section .homepage-product-card {
          /* Specific styling for homepage product cards */
        }
      `}</style>
    </section>
  );
};
