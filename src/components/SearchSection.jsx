import React, { useContext } from "react";
import { SearchContext } from "./SearchContext";
import { Search, ShoppingCart, Heart, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartSection";
import { useWishlist } from "./WishlistSection";

export const SearchSection = () => {
  const { searchQuery, setSearchQuery, results, allProducts, loading } =
    useContext(SearchContext);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
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
        )}

        {/* No Results Message */}
        {!loading && searchQuery && results.length === 0 && (
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
        {!loading && results.length > 0 && (
          <div className="flex justify-center">
            <div className="grid w-full grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 mx-5">
              {results.map((product) => (
                <div
                  key={product.id}
                  className="border border-border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-card w-full"
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden h-40 sm:h-48 md:h-56 bg-muted">
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
                    <h3 className="text-sm md:text-base font-bold text-foreground mb-2 line-clamp-2">
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
        {!loading && !searchQuery && (
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
