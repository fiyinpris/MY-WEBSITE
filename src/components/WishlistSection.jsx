import { createContext, useContext, useState, useEffect } from "react";
import { Trash2, ShoppingCart, Heart } from "lucide-react";
import { useCart } from "./CartSection";
import { Link } from "react-router-dom";
import { productsAPI } from "../services/firebase";

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

const WishlistContext = createContext();

export const WishlistSection = ({ children }) => {
  // ✅ Only store product IDs, not full products with base64 images
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const savedWishlist = localStorage.getItem("wishlistIds");
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch (error) {
      console.error("Error loading wishlist:", error);
      return [];
    }
  });

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Save only IDs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("wishlistIds", JSON.stringify(wishlistIds));
    } catch (error) {
      console.error("Error saving wishlist:", error);
      // If storage is full, clear it and try again
      if (error.name === "QuotaExceededError") {
        localStorage.removeItem("wishlistIds");
        alert(
          "Wishlist storage was full and has been cleared. Please add items again.",
        );
      }
    }
  }, [wishlistIds]);

  // ✅ Load full product details from Firebase based on IDs
  useEffect(() => {
    const loadWishlistProducts = async () => {
      if (wishlistIds.length === 0) {
        setWishlistItems([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const allProducts = await productsAPI.getAll();
        const wishlistProducts = allProducts.filter((product) =>
          wishlistIds.includes(product.id),
        );
        setWishlistItems(wishlistProducts);
      } catch (error) {
        console.error("Error loading wishlist products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadWishlistProducts();
  }, [wishlistIds]);

  const addToWishlist = (product) => {
    setWishlistIds((prev) => {
      if (prev.includes(product.id)) {
        // If already in wishlist, remove it (toggle behavior)
        return prev.filter((id) => id !== product.id);
      }
      return [...prev, product.id];
    });
  };

  const removeFromWishlist = (id) => {
    setWishlistIds((prev) => prev.filter((itemId) => itemId !== id));
  };

  const isInWishlist = (id) => {
    return wishlistIds.includes(id);
  };

  const clearWishlist = () => setWishlistIds([]);

  const totalWishlistItems = wishlistIds.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        totalWishlistItems,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
};

export const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationText, setNotificationText] = useState("");

  const handleAddToCart = (product) => {
    addToCart(product);
    setNotificationText(`${product.name} added to cart!`);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // ✅ USE LOADING SPINNER INSTEAD OF CUSTOM LOADER
  if (loading) {
    return <LoadingSpinner />;
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-16 bg-gradient-to-br from-primary/20 via-background to-primary/10">
        <div className="text-center">
          <Heart size={64} className="mx-auto mb-4 text-foreground/30" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-foreground/60 mb-6">
            Add products you love to see them here.
          </p>
          <Link to="/shop" className="normal-button">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-primary/10 pt-20 pb-16">
      {/* Success Notification */}
      {showNotification && (
        <div className="fixed top-20 right-2 sm:right-4 bg-green-600 px-3 py-2 rounded-lg shadow-lg z-50 animate-bounce text-white text-sm sm:text-base">
          ✓ {notificationText}
        </div>
      )}

      <div className="w-full px-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-row sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            My Wishlist
          </h1>
          <div className="bg-red-100 border-red-500 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg">
            <p className="font-semibold text-sm sm:text-base">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>

        {/* Wishlist List */}
        <div className="w-full space-y-4">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row lg:flex-row bg-card rounded-xl p-4 shadow-sm border border-border hover:shadow-lg transition-shadow gap-4"
            >
              {/* Product Image */}
              <div className="flex-shrink-0 w-full sm:w-32 lg:w-40">
                <img
                  src={item.image || item.img}
                  alt={item.name}
                  className="w-full h-50 sm:h-36 lg:h-40 object-cover rounded-lg"
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 flex flex-col justify-between space-y-2">
                <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-1">
                  {item.name}
                </h3>
                <p className="text-xs sm:text-sm text-foreground/60 line-clamp-2">
                  {item.description || item.desc || "No description available"}
                </p>
                <p className="text-sm sm:text-base font-bold text-primary">
                  ₦{(item.price || 0).toLocaleString()}
                </p>
              </div>

              {/* Divider (vertical on lg, horizontal on sm) */}
              <div className="border-t sm:border-t lg:border-t-0 lg:border-l border-border my-2 lg:my-0"></div>

              {/* Action Buttons */}
              <div className="flex flex-row md:flex-row sm:flex-row lg:flex-row items-center gap-4 mt-2 sm:mt-0 lg:mt-0">
                <button
                  onClick={() => handleAddToCart(item)}
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 w-full sm:w-auto lg:w-32"
                >
                  <ShoppingCart size={16} />
                  Add
                </button>

                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400 px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 w-full sm:w-auto lg:w-32"
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
