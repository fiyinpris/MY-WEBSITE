import {
  ChevronDown,
  Heart,
  ShoppingCart,
  X,
  Eye,
  Star,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "./CartSection";
import { useWishlist } from "./WishlistSection";

/* ================= IMAGES ================= */
import ringlight1 from "../Images/image R.jpeg";
import tripodStand1 from "../Images/image T1.jpeg";
import ledLight1 from "../Images/image L.jpeg";
import softbox1 from "../Images/image S.jpeg";
import Microphone1 from "../Images/image M.jpeg";
import ringlight2 from "../Images/image R3.jpeg";

import ringlight3 from "../Images/image R4.jpeg";
import tripodStand2 from "../Images/image T.jpeg";
import ledLight2 from "../Images/image L1.jpeg";
import softbox2 from "../Images/image S.jpeg";
import microphone2 from "../Images/image M.jpeg";
import tripodStand3 from "../Images/image T4.jpeg";
/* ========================================= */

import Slider1 from "../Images/image 20.jpg";
import Slider2 from "../Images/image 21.jpg";
import Slider3 from "../Images/image 23.jpg";

export const ProductSection = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isTabsFixed, setIsTabsFixed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);

  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  const tabs = [
    { name: "sale", label: "🔥 SALE" },
    { name: "hot", label: "⚡ HOT" },
    { name: "newarrivals", label: "✨ NEW ARRIVALS" },
    { name: "all", label: "📦 ALL" },
  ];

  const categories = [
    "All",
    "Ringlight",
    "LED Light",
    "Tripod",
    "Microphone",
    "Softbox",
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

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging) {
        setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
      }
    }, 4000); // Faster: 4 seconds instead of 5
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

  /* ================= PRODUCTS ================= */
  const products = [
    {
      id: 1,
      name: "Ringlight",
      category: "Ringlight",
      type: "hot",
      price: 25000,
      rating: 4.5,
      reviews: 128,
      desc: "Professional ring light ideal for makeup, photography and streaming.",
      img: ringlight1,
    },
    {
      id: 2,
      name: "Tripod Stand",
      category: "Tripod",
      type: "sale",
      price: 20000,
      rating: 4.8,
      reviews: 95,
      desc: "Durable adjustable tripod stand perfect for cameras and ringlights.",
      discount: "SAVE 90%",
      img: tripodStand1,
    },
    {
      id: 3,
      name: "Microphone",
      category: "Microphone",
      type: "newarrivals",
      price: 18000,
      rating: 4.7,
      reviews: 203,
      desc: "Studio-quality microphone suitable for podcasts and content creation.",
      img: Microphone1,
    },
    {
      id: 4,
      name: "LED Light",
      category: "LED Light",
      type: "hot",
      price: 30000,
      rating: 4.6,
      reviews: 156,
      desc: "LED light panel for professional photo and video shoots.",
      img: ledLight1,
    },
    {
      id: 5,
      name: "Softbox",
      category: "Softbox",
      type: "sale",
      price: 40000,
      rating: 4.9,
      reviews: 87,
      desc: "Complete softbox kit for perfect lighting in photography studios.",
      discount: "SAVE 30%",
      img: softbox1,
    },
    {
      id: 6,
      name: "Ringlight",
      category: "Ringlight",
      type: "hot",
      price: 25000,
      rating: 4.5,
      reviews: 128,
      desc: "Professional ring light ideal for makeup, photography and streaming.",
      img: ringlight2,
    },
    {
      id: 7,
      name: "Tripod Stand",
      category: "Tripod",
      type: "sale",
      price: 20000,
      rating: 4.8,
      reviews: 95,
      desc: "Durable adjustable tripod stand perfect for cameras and ringlights.",
      discount: "SAVE 90%",
      img: tripodStand2,
    },
    {
      id: 8,
      name: "Podcast Mic",
      category: "Microphone",
      type: "newarrivals",
      price: 18000,
      rating: 4.7,
      reviews: 203,
      desc: "Studio-quality microphone suitable for podcasts and content creation.",
      img: microphone2,
    },
    {
      id: 9,
      name: "LED Light",
      category: "LED Light",
      type: "hot",
      price: 30000,
      rating: 4.6,
      reviews: 156,
      desc: "LED light panel for professional photo and video shoots.",
      img: ledLight2,
    },
    {
      id: 10,
      name: "Softbox",
      category: "Softbox",
      type: "sale",
      price: 40000,
      rating: 4.9,
      reviews: 87,
      desc: "Complete softbox kit for perfect lighting in photography studios.",
      discount: "SAVE 30%",
      img: softbox2,
    },
    {
      id: 11,
      name: "Ringlight",
      category: "Ringlight",
      type: "hot",
      price: 25000,
      rating: 4.5,
      reviews: 128,
      desc: "Professional ring light ideal for makeup, photography and streaming.",
      img: ringlight3,
    },
    {
      id: 12,
      name: "Tripod Stand",
      category: "Tripod",
      type: "sale",
      price: 20000,
      rating: 4.8,
      reviews: 95,
      desc: "Durable adjustable tripod stand perfect for cameras and ringlights.",
      discount: "SAVE 90%",
      img: tripodStand3,
    },
  ];

  const filteredProducts = products.filter((product) => {
    const matchType = activeTab === "all" ? true : product.type === activeTab;
    const matchCategory =
      selectedCategory === "All" ? true : product.category === selectedCategory;
    return matchType && matchCategory;
  });

  const openModal = (product) => setSelectedProduct(product);

  const handleAddToCart = (product) => {
    addToCart(product);
    setShowConfirmModal(true);
    setTimeout(() => {
      setShowConfirmModal(false);
      setSelectedProduct(null);
    }, 2000);
  };

  const handleQuickAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
    setShowConfirmModal(true);
    setTimeout(() => setShowConfirmModal(false), 2000);
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
    <section className="relative w-full overflow-hidden">
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
              <div className="relative w-full h-full rounded-2xl overflow-hidden">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out"
                  style={{
                    transform:
                      index === currentHeroSlide ? "scale(1)" : "scale(1.1)",
                  }}
                />

                {/* Gradient Overlay - Dark left, Bright right */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

                {/* Animated Text Layer */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white space-y-3 px-4">
                  {/* Title - slides from LEFT with bouncy period */}
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

                  {/* Subtitle - slides from RIGHT with bouncy period */}
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

                  {/* Description - slides from LEFT with bouncy period */}
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

                  {/* Button - appears with fade and scale */}
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
        } z-40 border backdrop-blur-md shadow-lg transition-all duration-300`}
      >
        <div className="flex justify-center flex-wrap gap-3 sm:gap-3 lg:gap-15 md:gap-8 py-3 sm:py-4 px-2 sm:px-3">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => {
                setActiveTab(tab.name);
                setSelectedCategory("All");
              }}
              className={`px-2 lg:px-6 md:px-7 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-base transition-all duration-300 border-2 ${
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

      {/* Spacer when tabs are fixed */}
      {isTabsFixed && <div className="h-[60px] sm:h-[68px] md:h-[72px]"></div>}

      {/* ================= PRODUCTS ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-7xl mx-3 lg:mx-10 mb-20 my-7">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              tabIndex={0}
              className="p-3 md:p-4 flex flex-col items-stretch space-y-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border group focus:outline-none cursor-pointer"
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
                    className="bg-white p-1 sm:p-1.5 md:p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Heart
                      size={14}
                      className={
                        isInWishlist(product.id)
                          ? "text-red-500 fill-red-500"
                          : "text-gray-600"
                      }
                    />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(product);
                    }}
                    className="bg-white p-1 sm:p-1.5 md:p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Eye size={14} />
                  </button>
                </div>

                <img
                  src={product.img}
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

              {/* Product Details */}
              <div>
                <div className="flex items-center gap-1 mb-2">
                  {renderStars(product.rating)}
                  <span className="text-xs text-foreground/60 ml-1">
                    ({product.reviews})
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-xs text-foreground/70 mb-2 line-clamp-2 hidden sm:block">
                  {product.desc}
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base sm:text-lg font-bold text-green-600">
                    ₦{product.price.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(product);
                  }}
                  className="liquid-button-small w-full font-semibold py-2 text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden"
                >
                  <span className="relative z-10 text-white flex items-center gap-2">
                    <ShoppingCart size={14} /> Add to Cart
                  </span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <div className="text-4xl sm:text-6xl mb-4">🔍</div>
            <p className="text-lg sm:text-xl text-gray-500">
              No products found
            </p>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh]">
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6 md:p-8">
              {/* Image Section */}
              <div className="relative">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-2 right-2 z-10 bg-white text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 p-2 rounded-full shadow-lg transition-colors cursor-pointer"
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
                    src={selectedProduct.img}
                    alt={selectedProduct.name}
                    className="w-full h-64 sm:h-80 md:h-96 object-cover"
                  />
                </div>
              </div>

              {/* Details Section */}
              <div className="flex flex-col gap-8">
                <div>
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {renderStars(selectedProduct.rating, 18)}
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                      {selectedProduct.rating} ({selectedProduct.reviews}{" "}
                      reviews)
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedProduct.name}
                  </h2>

                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                    Category: {selectedProduct.category}
                  </p>

                  <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
                    {selectedProduct.desc}
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

                {/* Action Buttons */}
                <div className="flex flex-row gap-2 sm:gap-3 mb-5">
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
                    <span className="relative z-10 text-white">Buy Now</span>
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
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl animate-slideInRight max-w-sm mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Added to Cart!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Item successfully added to your cart
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
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
      `}</style>
    </section>
  );
};
