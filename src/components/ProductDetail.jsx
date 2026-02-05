import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "./CartSection";
import { useWishlist } from "./WishlistSection";
import {
  Heart,
  ArrowLeft,
  Minus,
  Plus,
  Star,
  ArrowBigLeft,
  ArrowBigRight,
  Trash2,
} from "lucide-react";
import { productsAPI, reviewsAPI } from "../services/firebase";

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(0);
  const carouselRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // ✅ NEW: Review states
  const [reviews, setReviews] = useState([]);
  const [currentReview, setCurrentReview] = useState(0);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  // ✅ Load product from Firebase
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const foundProduct = await productsAPI.getById(id);
        setProduct(foundProduct);
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // ✅ NEW: Load reviews that match this product
  useEffect(() => {
    const loadReviews = async () => {
      if (!product) return;

      try {
        const allReviews = await reviewsAPI.getAll();
        // Filter reviews that match this product's name (case-insensitive)
        const productReviews = allReviews.filter(
          (review) =>
            review.productName.toLowerCase() === product.name.toLowerCase(),
        );
        setReviews(productReviews);
      } catch (error) {
        console.error("Error loading reviews:", error);
        setReviews([]);
      }
    };

    loadReviews();

    // Reload reviews periodically
    const interval = setInterval(async () => {
      if (!product) return;
      try {
        const allReviews = await reviewsAPI.getAll();
        const productReviews = allReviews.filter(
          (review) =>
            review.productName.toLowerCase() === product.name.toLowerCase(),
        );
        setReviews(productReviews);
      } catch (error) {
        console.error("Error reloading reviews:", error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [product]);

  // ✅ NEW: Check auth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const email = user.email || user.phone || "";
          if (email) {
            setIsSignedIn(true);
            setUserEmail(email);
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    };

    checkAuth();
  }, []);

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) addToCart(product);
    }
  };

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleBackClick = () => {
    if (location.state?.from === "/shop") {
      navigate("/shop");
    } else {
      navigate(-1);
    }
  };

  // ✅ NEW: Review navigation
  const handleNextReview = () => {
    if (reviews.length > 0) {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }
  };

  const handlePrevReview = () => {
    if (reviews.length > 0) {
      setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);
    }
  };

  // ✅ NEW: Delete review
  const handleDeleteReview = async (reviewId, reviewEmail) => {
    if (reviewEmail !== userEmail) {
      alert("You can only delete your own reviews");
      return;
    }

    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await reviewsAPI.delete(reviewId);

      // Reload reviews
      const allReviews = await reviewsAPI.getAll();
      const productReviews = allReviews.filter(
        (review) =>
          review.productName.toLowerCase() === product.name.toLowerCase(),
      );
      setReviews(productReviews);

      if (currentReview >= productReviews.length) {
        setCurrentReview(0);
      }

      alert("Review deleted successfully!");
    } catch (error) {
      console.error("Error deleting review:", error);
      alert(`Error deleting review: ${error.message}`);
    }
  };

  // ✅ NEW: Helper functions
  const getEmailInitial = (email) => {
    return email ? email.charAt(0).toUpperCase() : "U";
  };

  const renderStars = (rating, size = 20) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star
            key={i}
            size={size}
            className="text-yellow-400 fill-yellow-400"
          />,
        );
      } else if (i === fullStars && hasHalfStar) {
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
      } else {
        stars.push(<Star key={i} size={size} className="text-gray-300" />);
      }
    }
    return stars;
  };

  const scrollToMedia = (index) => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.offsetWidth * index;
      carouselRef.current.scrollTo({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
    setSelectedMedia(index);
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    const pos = e.type === "mousedown" ? e.pageX : e.touches[0].pageX;
    setStartPos(pos - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const pos = e.type === "mousemove" ? e.pageX : e.touches[0].pageX;
    const x = pos - carouselRef.current.offsetLeft;
    const walk = (x - startPos) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleScroll = () => {
      const scrollLeft = carousel.scrollLeft;
      const itemWidth = carousel.offsetWidth;
      const index = Math.round(scrollLeft / itemWidth);
      setSelectedMedia(index);
    };

    carousel.addEventListener("scroll", handleScroll);
    return () => carousel.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Product Not Found
        </h3>
        <p className="text-muted-foreground mb-6">
          The product you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate("/shop")}
          className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const allMedia = [
    { type: "image", src: product.image, label: "Main Image" },
    { type: "image", src: product.thumbnail1 || null, label: "Image 1" },
    { type: "image", src: product.thumbnail2 || null, label: "Image 2" },
    { type: "video", src: product.videoThumbnail || null, label: "Video" },
  ];

  return (
    <div className="min-h-screen bg-background py-12 sm:px-6 px-4 lg:px-14 mt-10">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .carousel-snap {
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
        }
        .carousel-snap > * {
          scroll-snap-align: start;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back to Shop</span>
        </button>

        {/* PRODUCT DETAILS */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Images Section */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Desktop: Vertical Thumbnails + Main Display */}
            <div className="hidden lg:flex lg:flex-row gap-4 w-full">
              <div className="flex flex-col gap-2 w-20">
                {allMedia.map((media, index) => (
                  <div
                    key={index}
                    className={`w-20 h-20 border-2 rounded-lg overflow-hidden cursor-pointer transition-all relative ${
                      selectedMedia === index
                        ? "border-primary opacity-100"
                        : "border-border opacity-50 hover:opacity-80"
                    } ${!media.src ? "bg-gray-100" : ""}`}
                    onClick={() => media.src && setSelectedMedia(index)}
                  >
                    {media.src ? (
                      media.type === "video" ? (
                        <div className="relative w-full h-full">
                          <video
                            src={media.src}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={media.src}
                          alt={media.label}
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs text-gray-400">Empty</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex-1">
                <div className="w-full h-[500px] rounded-2xl overflow-hidden bg-gray-100">
                  {allMedia[selectedMedia].src ? (
                    allMedia[selectedMedia].type === "video" ? (
                      <video
                        src={allMedia[selectedMedia].src}
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={allMedia[selectedMedia].src}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-2">📷</div>
                        <p className="text-gray-400">No media available</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile: Draggable Carousel */}
            <div className="lg:hidden w-full">
              <div className="relative">
                <div
                  ref={carouselRef}
                  className="flex overflow-x-auto scrollbar-hide carousel-snap gap-4 cursor-grab active:cursor-grabbing"
                  style={{
                    WebkitOverflowScrolling: "touch",
                  }}
                  onMouseDown={handleDragStart}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={handleDragStart}
                  onTouchMove={handleDragMove}
                  onTouchEnd={handleDragEnd}
                >
                  {allMedia.map((media, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-full h-[400px] rounded-2xl overflow-hidden bg-gray-100"
                    >
                      {media.src ? (
                        media.type === "video" ? (
                          <video
                            src={media.src}
                            controls
                            className="w-full h-full object-cover pointer-events-none"
                            draggable="false"
                          />
                        ) : (
                          <img
                            src={media.src}
                            alt={`${product.name} - ${media.label}`}
                            className="w-full h-full object-cover pointer-events-none"
                            draggable="false"
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-6xl mb-2">
                              {media.type === "video" ? "🎥" : "📷"}
                            </div>
                            <p className="text-gray-400">{media.label}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Not uploaded yet
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-center gap-2 mt-4">
                  {allMedia.map((media, index) => (
                    <button
                      key={index}
                      onClick={() => scrollToMedia(index)}
                      className={`h-2 rounded-full transition-all ${
                        selectedMedia === index
                          ? "bg-primary w-8"
                          : media.src
                            ? "bg-gray-400 w-2"
                            : "bg-gray-300 w-2"
                      }`}
                      aria-label={`Go to ${media.label}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="flex flex-col">
            <span className="inline-block text-sm bg-primary/10 text-primary px-3 py-1 rounded-full mb-3 w-fit">
              {product.category}
            </span>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {product.name}
            </h1>

            {/* ✅ NEW: Rating with review count */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">{renderStars(product.rating || 5)}</div>
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
              </span>
            </div>

            <p className="text-4xl font-bold text-green-600 mb-6">
              ₦{product.price.toLocaleString()}
            </p>

            {product.description && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Product Description
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 rounded-lg">
                  <button
                    onClick={decreaseQuantity}
                    className="p-3 hover:bg-muted transition-colors"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="px-6 font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={increaseQuantity}
                    className="p-3 hover:bg-muted transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <p className="text-muted-foreground">
                  Total: ₦{(product.price * quantity).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg transition-colors"
              >
                Add to Cart
              </button>

              <button
                onClick={() => addToWishlist(product)}
                className={`px-6 py-4 rounded-lg border-2 transition-colors ${
                  isInWishlist(product.id)
                    ? "border-red-500 bg-red-50 text-red-600 hover:bg-red-100"
                    : "border-border hover:border-red-300"
                }`}
              >
                <Heart
                  className={`w-6 h-6 ${
                    isInWishlist(product.id) ? "text-red-500 fill-red-500" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ✅ NEW: REVIEWS SECTION */}
        <div className="bg-green-50 dark:bg-gray-800 rounded-2xl p-6 sm:p-8 mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 dark:text-white">
            Customer Reviews ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-2xl font-bold mb-2 dark:text-white">
                No Reviews Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Be the first to share your experience with this product!
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Reviews submitted on the homepage will appear here
              </p>
            </div>
          ) : (
            <div className="relative max-w-3xl mx-auto">
              {/* Review Card */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sm:p-8">
                <div className="flex justify-center -mt-14 mb-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg border-4 border-white dark:border-gray-900">
                    {getEmailInitial(reviews[currentReview].email)}
                  </div>
                </div>

                <div className="flex justify-center items-center gap-1 mb-4">
                  {renderStars(reviews[currentReview].rating)}
                </div>

                <p className="text-center text-base sm:text-lg mb-4 text-gray-700 dark:text-gray-300">
                  {reviews[currentReview].comment}
                </p>

                <p className="font-semibold text-center text-green-600 mb-1">
                  - {reviews[currentReview].customerName}
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {new Date(reviews[currentReview].date).toLocaleDateString()}
                </p>

                {/* Delete button for own reviews */}
                {isSignedIn && reviews[currentReview].email === userEmail && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() =>
                        handleDeleteReview(
                          reviews[currentReview].id,
                          reviews[currentReview].email,
                        )
                      }
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                      title="Delete my review"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation - Desktop */}
              {reviews.length > 1 && (
                <>
                  <button
                    onClick={handlePrevReview}
                    className="hidden sm:flex absolute left-[-4rem] top-1/2 -translate-y-1/2 bg-green-600 text-white rounded-full p-3 hover:bg-green-700 transition"
                  >
                    <ArrowBigLeft size={24} />
                  </button>

                  <button
                    onClick={handleNextReview}
                    className="hidden sm:flex absolute right-[-4rem] top-1/2 -translate-y-1/2 bg-green-600 text-white rounded-full p-3 hover:bg-green-700 transition"
                  >
                    <ArrowBigRight size={24} />
                  </button>

                  {/* Navigation - Mobile */}
                  <div className="flex sm:hidden justify-center gap-6 mt-6">
                    <button
                      onClick={handlePrevReview}
                      className="bg-green-600 text-white rounded-full p-3 hover:bg-green-700 transition"
                    >
                      <ArrowBigLeft size={20} />
                    </button>
                    <button
                      onClick={handleNextReview}
                      className="bg-green-600 text-white rounded-full p-3 hover:bg-green-700 transition"
                    >
                      <ArrowBigRight size={20} />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
