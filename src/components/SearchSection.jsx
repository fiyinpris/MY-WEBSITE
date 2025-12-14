import React, { useContext, useEffect } from "react";
import { SearchContext } from "./SearchContext";
import { Search, ShoppingCart, X, Heart, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartSection";
import { useWishlist } from "./WishlistSection";

// Import your actual images
import ringlight from "../Images/image 6.webp";
import tripodStand from "../Images/image 8.jpg";
import ledLight from "../Images/image 10.jpg";
import softbox from "../Images/image 6.webp";
import podcastMic from "../Images/image 5.jpg";
import miniRinglight from "../Images/image 1.jpg";

// ✅ YOUR ACTUAL PRODUCTS - Combined from ShopSection and ProductSection
const products = [
  { id: 1, name: "RINGLIGHT", price: 35000, image: miniRinglight },
  { id: 2, name: "TRIPOD STAND", price: 120000, image: tripodStand },
  { id: 3, name: "LEDLIGHT", price: 35000, image: ledLight },
  { id: 4, name: "SOFTBOX", price: 100000, image: softbox },
  { id: 5, name: "PODCAST MICROPHONE", price: 30000, image: podcastMic },
  { id: 6, name: "RINGLIGHT", price: 35000, image: ringlight },
  { id: 101, name: "Ringlight", price: 25000, image: miniRinglight },
  { id: 102, name: "Tripod Stand", price: 20000, image: tripodStand },
  { id: 103, name: "Podcast Mic", price: 18000, image: podcastMic },
  { id: 104, name: "LED Light", price: 30000, image: ledLight },
  { id: 105, name: "Softbox", price: 40000, image: softbox },
];

export const SearchSection = () => {
  const { searchQuery, setSearchQuery, results, setResults } =
    useContext(SearchContext);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  // ✅ Search ONLY through YOUR products
  useEffect(() => {
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();

      const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(query)
      );

      setResults(filteredProducts);
    } else {
      setResults([]);
    }
  }, [searchQuery, setResults]);

  const handleClear = () => {
    setSearchQuery("");
    setResults([]);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  return (
    <section className="pt-24 pb-10 min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4">
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
          Search Products
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Find your perfect lighting equipment and accessories
        </p>

        {/* Search Bar - FIXED SPACING */}
        <div className="relative mb-12 max-w-2xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for ringlights, tripods, LED lights, microphones..."
            className="w-full pl-14 pr-20 py-4 rounded-full border-2 border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-lg"
            autoFocus
          />

          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={24}
          />

          {searchQuery && (
            <button
              onClick={handleClear}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted"
              aria-label="Clear search"
            >
              <X size={22} />
            </button>
          )}
        </div>

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
              onClick={handleClear}
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Product Results Grid */}
        {results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {results.map((product) => (
              <div
                key={product.id}
                className="border border-border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-card"
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
                <div className="p-3 md:p-4">
                  {/* Product Name */}
                  <h3 className="text-sm md:text-base font-bold text-foreground mb-3">
                    {product.name}
                  </h3>

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
        )}

        {/* Empty State - When no search query */}
        {!searchQuery && (
          <div className="text-center py-10">
            <div className="mb-6">
              <Search
                size={64}
                className="mx-auto text-muted-foreground opacity-50"
              />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Start Your Search
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Search for ringlights, tripods, LED lights, softbox, microphones,
              and more lighting equipment
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {[
                "Ringlight",
                "Tripod",
                "LED Light",
                "Softbox",
                "Microphone",
              ].map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-sm font-medium transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
