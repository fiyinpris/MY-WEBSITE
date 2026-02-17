import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "./CartSection";
import { useWishlist } from "./WishlistSection";
import {
  Heart,
  ArrowLeft,
  Minus,
  Plus,
  MessageCircle,
  X,
  Star,
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

  const [reviews, setReviews] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    customerName: "",
    email: "",
    productName: "",
    rating: 5,
    comment: "",
  });

  // ✅ Lock body scroll when modal is open — prevents page enlarging on mobile keyboard
  useEffect(() => {
    if (showReviewModal) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
      document.body.style.width = "100%";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      document.body.style.width = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      document.body.style.width = "";
    };
  }, [showReviewModal]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const foundProduct = await productsAPI.getById(id);
        setProduct(foundProduct);
        setReviewFormData((prev) => ({
          ...prev,
          productName: foundProduct?.name || "",
        }));
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  useEffect(() => {
    const loadReviews = async () => {
      if (!product) return;
      try {
        const allReviews = await reviewsAPI.getAll();
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
            setReviewFormData((prev) => ({ ...prev, email }));
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    };
    checkAuth();
  }, []);

  // ✅ Smooth scroll snap sync with debounce
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    let scrollTimeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const index = Math.round(carousel.scrollLeft / carousel.offsetWidth);
        setSelectedMedia(index);
      }, 50);
    };

    carousel.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      carousel.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [product]);

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

  const handleReviewSubmit = async () => {
    if (!isSignedIn) {
      alert("Please sign in to leave a review");
      navigate("/signin");
      return;
    }
    if (
      !reviewFormData.customerName ||
      !reviewFormData.email ||
      !reviewFormData.productName ||
      !reviewFormData.comment
    ) {
      alert("Please fill in all fields");
      return;
    }
    setIsSubmitting(true);
    try {
      const newReview = {
        customerName: reviewFormData.customerName,
        email: reviewFormData.email,
        productName: reviewFormData.productName,
        rating: reviewFormData.rating,
        comment: reviewFormData.comment,
        date: new Date().toISOString().split("T")[0],
        verified: true,
      };
      await reviewsAPI.create(newReview);
      const allReviews = await reviewsAPI.getAll();
      const productReviews = allReviews.filter(
        (review) =>
          review.productName.toLowerCase() === product.name.toLowerCase(),
      );
      setReviews(productReviews);
      setReviewFormData({
        customerName: "",
        email: userEmail,
        productName: product.name,
        rating: 5,
        comment: "",
      });
      setShowReviewModal(false);
      alert("Thank you for your review!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(`Error saving review: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToHomeReviews = () => {
    navigate("/");
    setTimeout(() => {
      const reviewsSection = document.querySelector(
        ".flex.flex-col.justify-center.items-center.bg-green-200",
      );
      if (reviewsSection) {
        reviewsSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 300);
  };

  const scrollToMedia = (index) => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: carouselRef.current.offsetWidth * index,
        behavior: "smooth",
      });
      setSelectedMedia(index);
    }
  };

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
    <div className="min-h-screen bg-background pt-6 pb-12 mt-10">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .carousel-snap {
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-x: contain;
        }
        .carousel-snap > * {
          scroll-snap-align: center;
          scroll-snap-stop: always;
        }
      `}</style>

      {/* Back button */}
      <div className="px-4 sm:px-6 lg:px-14 max-w-7xl mx-auto">
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back to Shop</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-12 mb-12">
          {/* ── Media column ── */}
          <div>
            {/* Desktop view */}
            <div className="hidden lg:flex flex-row gap-4 px-6 lg:px-14">
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

            {/* Mobile carousel */}
            <div className="lg:hidden">
              <div
                ref={carouselRef}
                className="flex overflow-x-auto scrollbar-hide carousel-snap"
                style={{
                  width: "100vw",
                  WebkitOverflowScrolling: "touch",
                  scrollPaddingLeft: "0px",
                }}
              >
                {allMedia.map((media, index) => (
                  <div
                    key={index}
                    className="h-[380px] sm:h-[460px] bg-gray-100 flex-shrink-0"
                    style={{ width: "100vw" }}
                  >
                    {media.src ? (
                      media.type === "video" ? (
                        <video
                          src={media.src}
                          controls
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={media.src}
                          alt={`${product.name} - ${media.label}`}
                          className="w-full h-full object-cover"
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

              {/* Dot indicators */}
              <div className="flex justify-center gap-2 mt-4 px-4">
                {allMedia.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToMedia(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      selectedMedia === index
                        ? "bg-primary w-8"
                        : "bg-gray-400 w-2"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Product info */}
          <div className="flex flex-col px-4 sm:px-6 lg:px-0 lg:pr-14">
            <span className="inline-block text-sm bg-primary/10 text-primary px-3 py-1 rounded-full mb-3 w-fit">
              {product.category}
            </span>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              {product.name}
            </h1>

            <div className="mb-4">
              <button
                onClick={scrollToHomeReviews}
                className="text-gray-600 dark:text-gray-400 text-sm hover:text-primary hover:underline transition-colors cursor-pointer"
              >
                {reviews.length === 0
                  ? "0 reviews"
                  : reviews.length === 1
                    ? "1 review"
                    : `${reviews.length} reviews`}
              </button>
            </div>

            <p className="text-3xl sm:text-4xl font-bold text-green-600 mb-6">
              ₦{product.price.toLocaleString()}
            </p>

            {product.description && (
              <div className="mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                  Product Description
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">
                Quantity
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center border-2 rounded-lg">
                  <button
                    onClick={decreaseQuantity}
                    className="p-2 sm:p-3 hover:bg-muted transition-colors"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="px-4 sm:px-6 font-semibold text-base sm:text-lg">
                    {quantity}
                  </span>
                  <button
                    onClick={increaseQuantity}
                    className="p-2 sm:p-3 hover:bg-muted transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Total: ₦{(product.price * quantity).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex flex-row gap-3 sm:gap-4 mb-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 sm:py-4 rounded-lg transition-colors text-sm sm:text-base"
              >
                Add to Cart
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 sm:py-4 rounded-lg transition-colors text-sm sm:text-base"
              >
                Buy Now
              </button>
              <button
                onClick={() => addToWishlist(product)}
                className={`px-4 sm:px-6 py-3 sm:py-4 rounded-lg border-2 transition-colors ${
                  isInWishlist(product.id)
                    ? "border-red-500 bg-red-50 text-red-600 hover:bg-red-100"
                    : "border-border hover:border-red-300"
                }`}
              >
                <Heart
                  className={`w-5 h-5 sm:w-6 sm:h-6 ${
                    isInWishlist(product.id) ? "text-red-500 fill-red-500" : ""
                  }`}
                />
              </button>
            </div>

            <button
              onClick={() => setShowReviewModal(true)}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <MessageCircle size={20} />
              Add a Review
            </button>
          </div>
        </div>
      </div>

      {/* ✅ FIXED Review Modal — touch-none on overlay, body scroll locked */}
      {showReviewModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 touch-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowReviewModal(false);
          }}
        >
          <div
            className="bg-card rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 w-full sm:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto touch-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Add Review
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="bg-card hover:text-gray-700 border rounded-2xl w-8 h-8 flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                value={reviewFormData.customerName}
                onChange={(e) =>
                  setReviewFormData({
                    ...reviewFormData,
                    customerName: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
              />
              <input
                type="email"
                placeholder="Your Email"
                value={reviewFormData.email}
                onChange={(e) =>
                  setReviewFormData({
                    ...reviewFormData,
                    email: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                disabled={isSignedIn}
              />
              <input
                type="text"
                placeholder="Product Name"
                value={reviewFormData.productName}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl cursor-not-allowed text-sm sm:text-base"
                disabled
              />

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() =>
                        setReviewFormData({ ...reviewFormData, rating: star })
                      }
                      className="focus:outline-none"
                    >
                      <Star
                        size={28}
                        className={
                          star <= reviewFormData.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-300 text-gray-300"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                placeholder="Your Review"
                value={reviewFormData.comment}
                onChange={(e) =>
                  setReviewFormData({
                    ...reviewFormData,
                    comment: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px] resize-none text-sm sm:text-base"
              />

              <button
                onClick={handleReviewSubmit}
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
