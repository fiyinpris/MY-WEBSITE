import { createContext, useContext, useState, useEffect } from "react";
import { Trash2, ShoppingCart, Heart, LogIn, X } from "lucide-react";
import { useCart } from "./CartSection";
import { Link, useNavigate } from "react-router-dom";
import { productsAPI } from "../services/firebase";

const LoadingSpinner = () => (
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
    <style>{`@keyframes spin-fade{0%{opacity:1}100%{opacity:0.1}}`}</style>
  </div>
);

// ✅ Sign-In Required Modal — consistent with CartSection style
const SignInModal = ({ onSignIn, onClose }) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-foreground/50 hover:text-foreground transition-colors"
      >
        <X size={20} />
      </button>
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <LogIn className="w-8 h-8 text-primary" />
        </div>
      </div>
      <h2 className="text-xl font-bold text-foreground text-center mb-2">
        Sign in to View Wishlist
      </h2>
      <p className="text-sm text-foreground/60 text-center mb-6 leading-relaxed">
        You need to be signed in to view and manage your wishlist. Sign in to
        save your favourite products.
      </p>
      <div className="flex flex-col gap-3">
        <button
          onClick={onSignIn}
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <LogIn size={18} />
          Sign In to Continue
        </button>
        <button
          onClick={onClose}
          className="w-full border border-border text-foreground/70 hover:text-foreground hover:bg-background/50 font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <X size={16} />
          Cancel
        </button>
      </div>
      <p className="text-xs text-foreground/40 text-center mt-4">
        Your wishlist items will be saved while you sign in.
      </p>
    </div>
  </div>
);

const WishlistContext = createContext();

export const WishlistSection = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const saved = localStorage.getItem("wishlistIds");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem("wishlistIds", JSON.stringify(wishlistIds));
    } catch (error) {
      if (error.name === "QuotaExceededError") {
        localStorage.removeItem("wishlistIds");
        alert(
          "Wishlist storage was full and has been cleared. Please add items again.",
        );
      }
    }
  }, [wishlistIds]);

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
        setWishlistItems(allProducts.filter((p) => wishlistIds.includes(p.id)));
      } catch {
        console.error("Error loading wishlist products:");
      } finally {
        setLoading(false);
      }
    };
    loadWishlistProducts();
  }, [wishlistIds]);

  const addToWishlist = (product) =>
    setWishlistIds((prev) =>
      prev.includes(product.id)
        ? prev.filter((id) => id !== product.id)
        : [...prev, product.id],
    );
  const removeFromWishlist = (id) =>
    setWishlistIds((prev) => prev.filter((itemId) => itemId !== id));
  const isInWishlist = (id) => wishlistIds.includes(id);
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
  if (!context)
    throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};

export const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationText, setNotificationText] = useState("");

  // ✅ Sign-in gate state
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // ✅ Check sign-in on mount
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const signedIn = !!(user.name && (user.email || user.phone));
      setIsSignedIn(signedIn);
      if (!signedIn) setShowSignInModal(true);
    } catch {
      setIsSignedIn(false);
      setShowSignInModal(true);
    }
  }, []);

  // ✅ Re-check when user returns from sign-in
  useEffect(() => {
    const handleUserUpdated = () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const signedIn = !!(user.name && (user.email || user.phone));
        setIsSignedIn(signedIn);
        if (signedIn) setShowSignInModal(false);
      } catch {}
    };
    window.addEventListener("userUpdated", handleUserUpdated);
    return () => window.removeEventListener("userUpdated", handleUserUpdated);
  }, []);

  const handleSignIn = () => {
    sessionStorage.setItem("returnTo", "/wishlist");
    navigate("/signin");
  };

  const handleModalClose = () => {
    setShowSignInModal(false);
    // Navigate back if they cancel without signing in
    navigate(-1);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setNotificationText(`${product.name} added to cart!`);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      {/* ✅ Sign-In Modal — shown whenever user is not signed in */}
      {showSignInModal && !isSignedIn && (
        <SignInModal onSignIn={handleSignIn} onClose={handleModalClose} />
      )}

      {/* Toast notification */}
      {showNotification && (
        <div className="fixed top-20 right-2 sm:right-4 bg-green-600 px-3 py-2 rounded-lg shadow-lg z-50 animate-bounce text-white text-sm sm:text-base">
          ✓ {notificationText}
        </div>
      )}

      {/* Only render wishlist content if signed in */}
      {isSignedIn &&
        (wishlistItems.length === 0 ? (
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
        ) : (
          <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-primary/10 pt-20 pb-16">
            <div className="w-full px-4 max-w-6xl mx-auto">
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
              <div className="w-full space-y-4">
                {wishlistItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row lg:flex-row bg-card rounded-xl p-4 shadow-sm border border-border hover:shadow-lg transition-shadow gap-4"
                  >
                    <div className="flex-shrink-0 w-full sm:w-32 lg:w-40">
                      <img
                        src={item.image || item.img}
                        alt={item.name}
                        className="w-full h-50 sm:h-36 lg:h-40 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between space-y-2">
                      <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-foreground/60 line-clamp-2">
                        {item.description ||
                          item.desc ||
                          "No description available"}
                      </p>
                      <p className="text-sm sm:text-base font-bold text-primary">
                        ₦{(item.price || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="border-t sm:border-t lg:border-t-0 lg:border-l border-border my-2 lg:my-0" />
                    <div className="flex flex-row items-center gap-4 mt-2 sm:mt-0 lg:mt-0">
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
        ))}
    </>
  );
};
