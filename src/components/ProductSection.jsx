import { ChevronDown, Heart, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import ringlight from "../Images/image 6.webp";
import tripodStand from "../Images/image 8.jpg";
import ledLight from "../Images/image 10.jpg";
import softbox from "../Images/image 6.webp";
import podcastMic from "../Images/image 5.jpg";
import miniRinglight from "../Images/image 1.jpg";
import { useCart } from "./CartSection"; // ✅ import cart hook
import { useWishlist } from "./WishlistSection"; // ✅ import wishlist hook

export const ProductSection = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // ✅ get addToCart function from CartSection
  const { addToCart } = useCart();
  // ✅ get wishlist functions
  const { addToWishlist, isInWishlist } = useWishlist();

  const tabs = [
    { name: "sale", label: "SALE" },
    { name: "hot", label: "HOT" },
    { name: "newarrivals", label: "NEW ARRIVALS" },
    { name: "all", label: "ALL" },
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
      desc: "Professional ring light ideal for makeup, photography and streaming.",
      img: miniRinglight,
    },
    {
      id: 2,
      name: "Tripod Stand",
      category: "Tripod",
      type: "sale",
      price: 20000,
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
      desc: "Studio-quality microphone suitable for podcasts and content creation.",
      img: podcastMic,
    },
    {
      id: 4,
      name: "LED Light",
      category: "LED Light",
      type: "hot",
      price: 30000,
      desc: "LED light panel for professional photo and video shoots.",
      img: ledLight,
    },
    {
      id: 5,
      name: "Softbox",
      category: "Softbox",
      type: "sale",
      price: 40000,
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
      desc: "Professional ring light ideal for makeup, photography and streaming.",
      img: miniRinglight,
    },
    {
      id: 7,
      name: "Tripod Stand",
      category: "Tripod",
      type: "sale",
      price: 20000,
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
      desc: "Studio-quality microphone suitable for podcasts and content creation.",
      img: podcastMic,
    },
    {
      id: 9,
      name: "LED Light",
      category: "LED Light",
      type: "hot",
      price: 30000,
      desc: "LED light panel for professional photo and video shoots.",
      img: ledLight,
    },
    {
      id: 10,
      name: "Softbox",
      category: "Softbox",
      type: "sale",
      price: 40000,
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
      desc: "Professional ring light ideal for makeup, photography and streaming.",
      img: ringlight,
    },
    {
      id: 12,
      name: "Tripod Stand",
      category: "Tripod",
      type: "sale",
      price: 20000,
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

  const openModal = (product) => {
    setSelectedProduct(product);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setShowConfirmModal(true);
    setTimeout(() => {
      setShowConfirmModal(false);
      setSelectedProduct(null);
    }, 2000);
  };

  return (
    <section className="my-6 mt-13 lg:mt-13">
      {/* Tabs */}
      <ul className="flex justify-center flex-wrap p-7 gap-10 bg-black/20 backdrop-blur-md">
        {tabs.map((tab) => (
          <li key={tab.name} className="relative">
            <button
              onClick={() => {
                setActiveTab(tab.name);
                if (tab.name !== "all") {
                  setShowDropdown(false);
                  setSelectedCategory("All");
                }
              }}
              className={`font-semibold text-foreground text-sm transition-all duration-200 ${
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

      {/* Dropdown placed OUTSIDE of backdrop-blur parent */}
      {activeTab === "all" && showDropdown && (
        <div
          className="absolute z-50 mt-1"
          style={{
            top: "calc(7rem + 1px)",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <ul className="w-40 bg-card rounded-md shadow-lg overflow-hidden border border-border transition-colors duration-300">
            {categories.map((cat) => (
              <li
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setShowDropdown(false);
                }}
                className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-green-600"
              >
                {cat}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Product Grid - Fixed for small screens */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8 max-w-7xl mx-3 lg:mx-10 mb-20 my-7">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="gradient-border relative rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 max-w-xs mx-auto w-full"
            >
              {/* my up add to cart button */}
              <button className="absolute top-2 left-2 bg-white rounded-full p-1.5 shadow-md z-10">
                <ShoppingCart
                  size={16}
                  className="text-gray-600 hover:text-red-500"
                />
              </button>

              {/* Discount */}
              {product.type === "sale" && product.discount && (
                <span className="absolute lg:bottom-27 md:bottom-27 bottom-25 left-0  bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-md z-10">
                  {product.discount}
                </span>
              )}

              <img
                src={product.img}
                alt={product.name}
                className="w-full h-48 sm:h-56 object-cover rounded-md border mb-4"
              />

              <div className="flex flex-col items-start px-3 pb-3">
                <h5 className="font-semibold text-sm sm:text-base">
                  {product.name}
                </h5>
                <p className="text-sm sm:text-base mb-3">
                  ₦{product.price.toLocaleString()}
                </p>

                <div className="flex justify-between items-center w-full gap-2">
                  <button
                    onClick={() => openModal(product)}
                    className="cursor-pointer text-xs sm:text-sm bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition-colors flex-1"
                  >
                    Add to Cart
                  </button>

                  {/* Wishlist */}
                  <button
                    onClick={() => addToWishlist(product)}
                    className="cursor-pointer bg-white rounded-full p-1.5 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <Heart
                      size={16}
                      className={`${
                        isInWishlist(product.id)
                          ? "text-red-500 fill-red-500"
                          : "text-gray-600 hover:text-red-500"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full opacity-70">
            No products found.
          </p>
        )}
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 backdrop-blur bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-10 max-w-md w-full relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
            >
              <X size={20} />
            </button>
            <img
              src={selectedProduct.img}
              alt={selectedProduct.name}
              className="w-full h-48 sm:h-56 object-cover rounded-md mb-4"
            />
            <h2 className="text-xl font-semibold mb-2">
              {selectedProduct.name}
            </h2>
            <p className="text-gray-600 mb-2">
              ₦{selectedProduct.price.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mb-4">{selectedProduct.desc}</p>
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <button
                onClick={() => handleAddToCart(selectedProduct)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Add to Cart
              </button>
              <button
                onClick={() => handleAddToCart(selectedProduct)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div className="bg-green-600 text-white px-6 py-3 rounded-md shadow-lg animate-bounce text-center">
            {selectedProduct.name} has been added to cart.
          </div>
        </div>
      )}
    </section>
  );
};
