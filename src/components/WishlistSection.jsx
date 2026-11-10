import { createContext, useContext, useState, useEffect } from "react";
import { Heart, LogIn, ShoppingBag, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "./CartSection";
import { Link, useNavigate } from "react-router-dom";
import { productsAPI } from "../services/firebase";
import { Modal } from "./ui/Modal";
import { EmptyState } from "./ui/EmptyState";
import { PageHeader } from "./ui/PageHeader";
import { ProductCardSkeleton } from "./ui/ProductCard";
import { formatCategory, formatPrice } from "../lib/format";
import { optimizeImage, handleImageError } from "../lib/image";

// ✅ Sign-In Required Modal — consistent with the cart's sign-in prompt
const SignInModal = ({ open, onSignIn, onClose }) => (
  <Modal open={open} onClose={onClose} size="sm">
    <div className="text-center">
      <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-primary-soft">
        <LogIn className="text-primary" size={24} />
      </div>
      <h2 className="text-xl font-bold text-foreground">Sign in to view your wishlist</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        You need to be signed in to view and manage your wishlist. Sign in to save your favourite products.
      </p>
      <div className="mt-6 flex flex-col gap-2.5">
        <button onClick={onSignIn} className="btn btn-primary w-full">
          <LogIn size={17} /> Sign in to continue
        </button>
        <button onClick={onClose} className="btn btn-ghost w-full">
          Cancel
        </button>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Your wishlist items will be saved while you sign in.</p>
    </div>
  </Modal>
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
        alert("Wishlist storage was full and has been cleared. Please add items again.");
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
      prev.includes(product.id) ? prev.filter((id) => id !== product.id) : [...prev, product.id],
    );
  const removeFromWishlist = (id) => setWishlistIds((prev) => prev.filter((itemId) => itemId !== id));
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
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};

export const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

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
      } catch {
        /* ignore */
      }
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

  return (
    <>
      {/* ✅ Sign-In Modal — shown whenever user is not signed in */}
      <SignInModal open={showSignInModal && !isSignedIn} onSignIn={handleSignIn} onClose={handleModalClose} />

      <PageHeader
        crumbs={[{ label: "Wishlist" }]}
        title="My wishlist"
        description={
          isSignedIn && !loading && wishlistItems.length > 0
            ? `${wishlistItems.length} saved ${wishlistItems.length === 1 ? "item" : "items"}`
            : "Products you love, saved for later."
        }
      />

      <div className="container-page pb-20">
        {(!isSignedIn || loading) && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {isSignedIn && !loading && wishlistItems.length === 0 && (
          <EmptyState icon={Heart} title="Your wishlist is empty" description="Tap the heart on any product to save it here.">
            <Link to="/shop" className="btn btn-primary btn-lg">
              Continue shopping
            </Link>
          </EmptyState>
        )}

        {isSignedIn && !loading && wishlistItems.length > 0 && (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
            <AnimatePresence initial={false}>
              {wishlistItems.map((item) => (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  className="group flex flex-col"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
                    <Link to={`/product/${item.id}`} aria-label={`View ${item.name}`}>
                      <img
                        src={optimizeImage(item.image || item.img, 640)}
                        alt={item.name}
                        onError={handleImageError}
                        className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.045]"
                      />
                    </Link>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      aria-label={`Remove ${item.name} from wishlist`}
                      className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-full bg-card/90 shadow-soft backdrop-blur transition-transform hover:scale-110"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex flex-1 flex-col px-0.5 pt-3.5">
                    {item.category && (
                      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {formatCategory(item.category)}
                      </p>
                    )}
                    <Link
                      to={`/product/${item.id}`}
                      className="mt-1 text-[0.9375rem] font-semibold leading-snug text-foreground line-clamp-2 hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1.5 font-bold text-foreground">{formatPrice(item.price || 0)}</p>
                    <button
                      onClick={() => addToCart(item)}
                      disabled={item.soldOut}
                      className="btn btn-primary btn-sm mt-3 w-full"
                    >
                      <ShoppingBag size={15} /> {item.soldOut ? "Sold out" : "Add to cart"}
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </>
  );
};
