import { ChevronDown, Heart, ShoppingCart, X, Eye, Star } from "lucide-react";
import { useState } from "react";
import ringlight from "../Images/image 6.webp";
import tripodStand from "../Images/image 8.jpg";
import ledLight from "../Images/image 10.jpg";
import softbox from "../Images/image 6.webp";
import podcastMic from "../Images/image 5.jpg";
import miniRinglight from "../Images/image 1.jpg";
import { useCart } from "./CartSection";
import { useWishlist } from "./WishlistSection";

export const ProductSection = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  const tabs = [
    { name: "sale", label: "🔥SALE" },
    { name: "hot", label: "⚡HOT" },
    { name: "newarrivals", label: "✨NEW ARRIVALS" },
    { name: "all", label: "📦ALL" },
  ];

  const categories = [
    "All",
    "Ringlight",
    "LED Light",
    "Tripod",
    "Microphone",
    "Softbox",
  ];

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
      img: miniRinglight,
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
      img: tripodStand,
    },
    {
      id: 3,
      name: "Podcast Mic",
      category: "Microphone",
      type: "newarrivals",
      price: 18000,
      rating: 4.7,
      reviews: 203,
      desc: "Studio-quality microphone suitable for podcasts and content creation.",
      img: podcastMic,
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
      img: ledLight,
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
      img: softbox,
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
      img: miniRinglight,
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
      img: tripodStand,
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
      img: podcastMic,
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
      img: ledLight,
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
      img: softbox,
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
      img: ringlight,
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
      img: tripodStand,
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
          />
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
          </div>
        );
      else stars.push(<Star key={i} size={size} className="text-gray-300" />);
    }
    return stars;
  };

  return (
    <section className="my-6 mt-13 lg:mt-13">
      {/* Tabs */}
      <ul className="flex justify-center flex-wrap p-7 gap-6 md:gap-10 bg-black/20 backdrop-blur-md">
        {tabs.map((tab) => (
          <li key={tab.name} className="relative">
            <button
              onClick={() => {
                setActiveTab(tab.name);
                setSelectedCategory("All");
              }}
              className={`font-semibold text-foreground text-xs md:text-sm transition-all duration-200 ${
                activeTab === tab.name
                  ? "text-green-600 underline underline-offset-4"
                  : "hover:text-green-600"
              }`}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-7xl mx-3 lg:mx-10 mb-20 my-7">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              tabIndex={0}
              className="
    p-3 md:p-4 flex flex-col items-stretch space-y-3
    rounded-lg shadow-md hover:shadow-lg
    transition-shadow duration-300
    border group focus:outline-none
  "
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              {/* Product Image */}
              <div className="relative overflow-hidden">
                {product.discount && (
                  <span className="absolute top-2 left-2 z-20 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
                    {product.discount}
                  </span>
                )}

                {/* Heart & Eye buttons on hover */}
                <div
                  className="
    absolute top-2 right-2 z-20 flex flex-col gap-2
    opacity-0

    /* Small + Medium: tap/focus */
    group-focus-within:opacity-100

    /* Medium + Large: hover */
    md:group-hover:opacity-100

    transition-opacity duration-300
  "
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToWishlist(product);
                    }}
                    className="bg-white p-1 sm:p-1.5 md:p-2 rounded-full shadow-lg"
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
                    className="bg-white p-1 sm:p-1.5 md:p-2 rounded-full shadow-lg"
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
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 text-xs sm:text-sm rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={14} /> Quick Add
                  </button>
                </div>
              </div>

              {/* Product Details */}
              <div className="">
                <div className="flex items-center gap-1 mb-2">
                  {renderStars(product.rating)}
                  <span className="text-xs text-gray-500 ml-1">
                    ({product.reviews})
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2 hidden sm:block">
                  {product.desc}
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base sm:text-lg font-bold text-green-600">
                    ₦{product.price.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => openModal(product)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={14} /> Add to Cart
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
          <div className="bg-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] ">
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6 md:p-8">
              {/* Image Section */}
              <div className="relative">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-2 right-2 z-10 bg-white  text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 p-2 rounded-full shadow-lg transition-colors"
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
                    {" "}
                    {/* Adjust w-32 as needed */}
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
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg text-xs sm:text-sm"
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>

                  {/* Buy Now */}
                  <button
                    onClick={() => handleAddToCart(selectedProduct)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-xs sm:text-sm"
                  >
                    Buy Now
                  </button>

                  {/* Wishlist */}
                  <button
                    onClick={() => addToWishlist(selectedProduct)}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2.5 sm:py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 text-xs sm:text-sm"
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

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideInRight {
          animation: slideInRight 0.4s ease-out;
        }
      `}</style>
    </section>
  );
};
