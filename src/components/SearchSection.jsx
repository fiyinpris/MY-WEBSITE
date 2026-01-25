import React, { useContext, useEffect } from "react";
import { SearchContext } from "./SearchContext";
import { Search, ShoppingCart, Heart, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartSection";
import { useWishlist } from "./WishlistSection";

// Import images from ShopSection
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

// Import images from ProductSection
import Microphone1 from "../Images/image M.jpeg";

// ✅ COMBINED PRODUCTS from both ShopSection and ProductSection
const allProducts = [
  // From ShopSection (63 products)
  {
    id: 1,
    name: "RINGLIGHT",
    price: 35000,
    image: ringlight1,
    category: "Ringlight",
  },
  {
    id: 2,
    name: "TRIPOD STAND",
    price: 12000,
    image: tripodStand1,
    category: "Tripod",
  },
  {
    id: 3,
    name: "LEDLIGHT",
    price: 35000,
    image: ledLight1,
    category: "LED Light",
  },
  {
    id: 4,
    name: "SOFTBOX",
    price: 10000,
    image: softbox1,
    category: "Softbox",
  },
  {
    id: 5,
    name: "MICROPHONE",
    price: 30000,
    image: microphone1,
    category: "Microphone",
  },
  {
    id: 6,
    name: "RINGLIGHT",
    price: 35000,
    image: ringlight2,
    category: "Ringlight",
  },
  {
    id: 7,
    name: "SOFTBOX",
    price: 100000,
    image: softbox1,
    category: "Softbox",
  },
  {
    id: 8,
    name: "MICROPHONE",
    price: 30000,
    image: microphone1,
    category: "Microphone",
  },
  {
    id: 9,
    name: "RINGLIGHT",
    price: 35000,
    image: ringlight3,
    category: "Ringlight",
  },
  {
    id: 10,
    name: "TRIPOD STAND",
    price: 12000,
    image: tripodStand2,
    category: "Tripod",
  },
  {
    id: 11,
    name: "LEDLIGHT",
    price: 35000,
    image: ledLight2,
    category: "LED Light",
  },
  {
    id: 12,
    name: "SOFTBOX",
    price: 10000,
    image: softbox1,
    category: "Softbox",
  },
  {
    id: 13,
    name: "MICROPHONE",
    price: 30000,
    image: microphone1,
    category: "Microphone",
  },
  {
    id: 14,
    name: "RINGLIGHT",
    price: 35000,
    image: ringlight1,
    category: "Ringlight",
  },
  {
    id: 15,
    name: "SOFTBOX",
    price: 10000,
    image: softbox1,
    category: "Softbox",
  },
  {
    id: 16,
    name: "MICROPHONE",
    price: 30000,
    image: microphone1,
    category: "Microphone",
  },
  {
    id: 17,
    name: "RINGLIGHT",
    price: 35000,
    image: ringlight2,
    category: "Ringlight",
  },
  {
    id: 18,
    name: "TRIPOD STAND",
    price: 12000,
    image: tripodStand3,
    category: "Tripod",
  },
  {
    id: 19,
    name: "LEDLIGHT",
    price: 35000,
    image: ledLight1,
    category: "LED Light",
  },
  {
    id: 20,
    name: "SOFTBOX",
    price: 10000,
    image: softbox1,
    category: "Softbox",
  },
  {
    id: 21,
    name: "MICROPHONE",
    price: 30000,
    image: microphone1,
    category: "Microphone",
  },
  {
    id: 22,
    name: "RINGLIGHT",
    price: 35000,
    image: ringlight3,
    category: "Ringlight",
  },
  {
    id: 23,
    name: "TRIPOD STAND",
    price: 12000,
    image: tripodStand1,
    category: "Tripod",
  },
  {
    id: 24,
    name: "LEDLIGHT",
    price: 35000,
    image: ledLight2,
    category: "LED Light",
  },
  {
    id: 25,
    name: "SOFTBOX",
    price: 10000,
    image: softbox1,
    category: "Softbox",
  },
  {
    id: 26,
    name: "MICROPHONE",
    price: 30000,
    image: microphone1,
    category: "Microphone",
  },
  {
    id: 27,
    name: "RINGLIGHT",
    price: 35000,
    image: ringlight1,
    category: "Ringlight",
  },
  {
    id: 28,
    name: "TRIPOD STAND",
    price: 12000,
    image: tripodStand2,
    category: "Tripod",
  },
  {
    id: 29,
    name: "LEDLIGHT",
    price: 35000,
    image: ledLight1,
    category: "LED Light",
  },
  {
    id: 30,
    name: "SOFTBOX",
    price: 10000,
    image: softbox1,
    category: "Softbox",
  },
  {
    id: 31,
    name: "MICROPHONE",
    price: 30000,
    image: microphone1,
    category: "Microphone",
  },
  {
    id: 32,
    name: "RINGLIGHT",
    price: 35000,
    image: ringlight2,
    category: "Ringlight",
  },
  {
    id: 33,
    name: "SOFTBOX",
    price: 10000,
    image: softbox1,
    category: "Softbox",
  },
  {
    id: 34,
    name: "MICROPHONE",
    price: 30000,
    image: microphone1,
    category: "Microphone",
  },
  {
    id: 35,
    name: "RINGLIGHT",
    price: 35000,
    image: ringlight3,
    category: "Ringlight",
  },
  {
    id: 36,
    name: "TRIPOD STAND",
    price: 12000,
    image: tripodStand3,
    category: "Tripod",
  },
  {
    id: 37,
    name: "LEDLIGHT",
    price: 35000,
    image: ledLight2,
    category: "LED Light",
  },
  {
    id: 38,
    name: "SOFTBOX",
    price: 10000,
    image: softbox1,
    category: "Softbox",
  },
  {
    id: 39,
    name: "MICROPHONE",
    price: 30000,
    image: microphone1,
    category: "Microphone",
  },
  {
    id: 40,
    name: "RINGLIGHT",
    price: 35000,
    image: ringlight1,
    category: "Ringlight",
  },
  {
    id: 41,
    name: "SOFTBOX",
    price: 10000,
    image: softbox1,
    category: "Softbox",
  },
  {
    id: 42,
    name: "MICROPHONE",
    price: 30000,
    image: microphone1,
    category: "Microphone",
  },
  {
    id: 43,
    name: "RINGLIGHT",
    price: 35000,
    image: ringlight2,
    category: "Ringlight",
  },
  {
    id: 44,
    name: "TRIPOD STAND",
    price: 12000,
    image: tripodStand1,
    category: "Tripod",
  },
  {
    id: 45,
    name: "LEDLIGHT",
    price: 35000,
    image: ledLight1,
    category: "LED Light",
  },
  {
    id: 46,
    name: "SOFTBOX",
    price: 10000,
    image: softbox1,
    category: "Softbox",
  },
  {
    id: 47,
    name: "MICROPHONE",
    price: 30000,
    image: microphone1,
    category: "Microphone",
  },
  {
    id: 48,
    name: "RINGLIGHT",
    price: 35000,
    image: ringlight3,
    category: "Ringlight",
  },
  {
    id: 49,
    name: "TRIPOD STAND",
    price: 12000,
    image: tripodStand2,
    category: "Tripod",
  },
  {
    id: 50,
    name: "LEDLIGHT",
    price: 35000,
    image: ledLight2,
    category: "LED Light",
  },
  {
    id: 51,
    name: "SOFTBOX",
    price: 10000,
    image: softbox1,
    category: "Softbox",
  },
  {
    id: 52,
    name: "MICROPHONE",
    price: 30000,
    image: microphone1,
    category: "Microphone",
  },
  {
    id: 53,
    name: "RINGLIGHT",
    price: 35000,
    image: ringlight1,
    category: "Ringlight",
  },
  {
    id: 54,
    name: "SOFTBOX",
    price: 10000,
    image: softbox1,
    category: "Softbox",
  },
  {
    id: 55,
    name: "MICROPHONE",
    price: 30000,
    image: microphone1,
    category: "Microphone",
  },
  {
    id: 56,
    name: "RINGLIGHT",
    price: 35000,
    image: ringlight2,
    category: "Ringlight",
  },
  {
    id: 57,
    name: "TRIPOD STAND",
    price: 12000,
    image: tripodStand3,
    category: "Tripod",
  },
  {
    id: 58,
    name: "LEDLIGHT",
    price: 35000,
    image: ledLight1,
    category: "LED Light",
  },
  {
    id: 59,
    name: "SOFTBOX",
    price: 10000,
    image: softbox1,
    category: "Softbox",
  },
  {
    id: 60,
    name: "MICROPHONE",
    price: 30000,
    image: microphone1,
    category: "Microphone",
  },
  {
    id: 61,
    name: "RINGLIGHT",
    price: 35000,
    image: ringlight3,
    category: "Ringlight",
  },
  {
    id: 62,
    name: "TRIPOD STAND",
    price: 12000,
    image: tripodStand1,
    category: "Tripod",
  },
  {
    id: 63,
    name: "LEDLIGHT",
    price: 35000,
    image: ledLight2,
    category: "LED Light",
  },

  // From ProductSection (12 products with unique IDs starting from 101)
  {
    id: 101,
    name: "Ringlight",
    price: 25000,
    image: ringlight1,
    category: "Ringlight",
  },
  {
    id: 102,
    name: "Tripod Stand",
    price: 20000,
    image: tripodStand1,
    category: "Tripod",
  },
  {
    id: 103,
    name: "Microphone",
    price: 18000,
    image: Microphone1,
    category: "Microphone",
  },
  {
    id: 104,
    name: "LED Light",
    price: 30000,
    image: ledLight1,
    category: "LED Light",
  },
  {
    id: 105,
    name: "Softbox",
    price: 40000,
    image: softbox1,
    category: "Softbox",
  },
  {
    id: 106,
    name: "Ringlight",
    price: 25000,
    image: ringlight2,
    category: "Ringlight",
  },
  {
    id: 107,
    name: "Tripod Stand",
    price: 20000,
    image: tripodStand2,
    category: "Tripod",
  },
  {
    id: 108,
    name: "Podcast Mic",
    price: 18000,
    image: microphone1,
    category: "Microphone",
  },
  {
    id: 109,
    name: "LED Light",
    price: 30000,
    image: ledLight2,
    category: "LED Light",
  },
  {
    id: 110,
    name: "Softbox",
    price: 40000,
    image: softbox1,
    category: "Softbox",
  },
  {
    id: 111,
    name: "Ringlight",
    price: 25000,
    image: ringlight3,
    category: "Ringlight",
  },
  {
    id: 112,
    name: "Tripod Stand",
    price: 20000,
    image: tripodStand3,
    category: "Tripod",
  },
];

export const SearchSection = () => {
  const { searchQuery, setSearchQuery, results, setResults } =
    useContext(SearchContext);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  // ✅ Search through ALL products from both sections with better matching
  useEffect(() => {
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();

      // More flexible search - matches partial words and categories
      const filteredProducts = allProducts.filter((product) => {
        const productName = product.name.toLowerCase();
        const productCategory = product.category?.toLowerCase() || "";

        return (
          productName.includes(query) ||
          query.includes(productName) ||
          productCategory.includes(query) ||
          query.includes(productCategory)
        );
      });

      // Remove duplicates based on name and price (in case same product appears in both sections)
      const uniqueProducts = filteredProducts.reduce((acc, current) => {
        const duplicate = acc.find(
          (item) => item.name === current.name && item.price === current.price,
        );
        if (!duplicate) {
          acc.push(current);
        }
        return acc;
      }, []);

      setResults(uniqueProducts);
    } else {
      setResults([]);
    }
  }, [searchQuery, setResults]);

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

  return (
    <section className="pt-24 px-8 pb-10 min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-2">
        {/* Back Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/shop")}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Shop</span>
          </button>
          <span className="text-muted-foreground">|</span>
          <button
            onClick={() => navigate("/products")}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Our Products
          </button>
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-4 text-center">
          Search Results
        </h1>

        {/* Results Count */}
        {searchQuery && (
          <div className="text-center mb-8">
            <p className="text-lg text-foreground">
              {results.length > 0 ? (
                <>
                  Found{" "}
                  <span className="font-bold text-primary">
                    {results.length}
                  </span>{" "}
                  product{results.length === 1 ? "" : "s"} for "{searchQuery}"
                </>
              ) : (
                <>
                  No products found for "
                  <span className="font-semibold">{searchQuery}</span>"
                </>
              )}
            </p>
          </div>
        )}

        {/* No Results Message */}
        {searchQuery && results.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-6">
              <Search
                size={64}
                className="mx-auto text-muted-foreground opacity-50"
              />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              No products found
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We couldn't find any products matching "
              <span className="font-semibold">{searchQuery}</span>". Try
              searching for: ringlight, tripod, LED light, softbox, or
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

        {/* Product Results Grid - CENTERED */}
        {results.length > 0 && (
          <div className="flex justify-center">
            <div className="grid w-full grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 mx-5">
              {results.map((product) => (
                <div
                  key={product.id}
                  className="border border-border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-card w-full"
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden h-48 sm:h-56 bg-muted">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Wishlist Button */}
                    <button
                      onClick={() => addToWishlist(product)}
                      className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <Heart
                        size={18}
                        className={`${
                          isInWishlist(product.id)
                            ? "text-red-500 fill-red-500"
                            : "text-gray-600 hover:text-red-500"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="p-2 md:p-4">
                    {/* Product Name */}
                    <h3 className="text-sm md:text-base font-bold text-foreground mb-2">
                      {product.name}
                    </h3>

                    {/* Category Badge */}
                    {product.category && (
                      <span className="inline-block text-xs bg-primary/10 text-primary px-2 py-1 rounded-md mb-3">
                        {product.category}
                      </span>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base md:text-lg font-bold text-primary">
                        ₦{product.price.toLocaleString()}
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 md:py-2.5 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 text-sm md:text-base"
                    >
                      <ShoppingCart size={16} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State - When no search query */}
        {!searchQuery && (
          <div className="text-center py-16">
            <div className="mb-6">
              <Search
                size={64}
                className="mx-auto text-muted-foreground opacity-50"
              />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Start Searching
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Use the search bar in the navigation to find ringlights, tripods,
              LED lights, and more. We have {allProducts.length} products
              available!
            </p>
            <div className="flex flex-wrap justify-center gap-3 max-w-lg mx-auto">
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
