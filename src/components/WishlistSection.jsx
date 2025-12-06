import { createContext, useContext, useState, useEffect } from "react";
import { Trash2, ShoppingCart, Heart } from "lucide-react";
import { useCart } from "./CartSection";
import { Link } from "react-router-dom";

const WishlistContext = createContext();

export const WishlistSection = ({ children }) => {
  // ✅ Load saved wishlist items from localStorage
  const [wishlistItems, setWishlistItems] = useState(() => {
    const savedWishlist = localStorage.getItem("wishlistItems");
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  // ✅ Save to localStorage whenever wishlist changes
  useEffect(() => {
    localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToWishlist = (product) => {
    setWishlistItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        // If already in wishlist, remove it (toggle behavior)
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const removeFromWishlist = (id) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
  };

  const isInWishlist = (id) => {
    return wishlistItems.some((item) => item.id === id);
  };

  const clearWishlist = () => setWishlistItems([]);

  const totalWishlistItems = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        totalWishlistItems,
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
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationText, setNotificationText] = useState("");

  const handleAddToCart = (product) => {
    addToCart(product);
    setNotificationText(`${product.name} added to cart!`);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-16">
        <div className="text-center">
          <Heart size={64} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-muted-foreground mb-6">
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
    <div className="min-h-screen bg-background pt-20 pb-16 px-4">
      {/* Success Notification */}
      {showNotification && (
        <div className="fixed top-20 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          ✓ {notificationText}
        </div>
      )}

      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            My Wishlist
          </h1>
          <div className="bg-red-100 border border-red-500 text-red-700 px-4 py-2 rounded-lg">
            <p className="font-semibold">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-xl p-4 shadow-sm border border-border hover:shadow-lg transition-shadow"
            >
              {/* Product Image */}
              <div className="relative mb-4">
                <img
                  src={item.image || item.img}
                  alt={item.name}
                  className="w-full h-40 sm:h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>

              {/* Product Details */}
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-foreground line-clamp-1">
                  {item.name}
                </h3>
                <p className="text-lg sm:text-xl font-semibold text-primary">
                  ₦{(item.price || 0).toLocaleString()}
                </p>
                {item.desc && (
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    {item.desc}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="pt-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <ShoppingCart size={16} />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
