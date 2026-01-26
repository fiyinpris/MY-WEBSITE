import React, { useState, useEffect } from "react";
import {
  Send,
  ShoppingCart,
  Star,
  ArrowBigLeft,
  ArrowBigRight,
  Plus,
  X,
} from "lucide-react";

// Carousel images
import myImage1 from "../Images/image 7.jpg";
import myImage2 from "../Images/image 16.jpg";
import myImage3 from "../Images/image 15.jpg";

// Product images
import ringlight from "../Images/image R.jpeg";
import tripodStand from "../Images/image T.jpeg";
import ledLight from "../Images/image L.jpeg";
import softbox from "../Images/image S.jpeg";
import Microphone from "../Images/image M.jpeg";
import Ringlight from "../Images/image R1.jpeg";

function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

const carouselImages = [myImage1, myImage2, myImage3];

const products = [
  {
    id: 1,
    name: "Ringlight",
    price: "₦25,000",
    rating: 4.5,
    image: Ringlight,
    badge: "Bestseller",
  },
  {
    id: 2,
    name: "LED Light",
    price: "₦30,000",
    rating: 4.6,
    image: ledLight,
    badge: "Hot",
  },
  {
    id: 3,
    name: "Tripod Stand",
    price: "₦20,000",
    rating: 4.8,
    image: tripodStand,
    badge: "Bestseller",
  },
  {
    id: 4,
    name: "Softbox",
    price: "₦40,000",
    rating: 4.9,
    image: softbox,
    badge: "Hot",
  },
  {
    id: 5,
    name: "Microphone",
    price: "₦18,000",
    rating: 4.7,
    image: Microphone,
    badge: "New",
  },
  {
    id: 6,
    name: "Ringlight",
    price: "₦35,000",
    rating: 4.5,
    image: ringlight,
    badge: "Bestseller",
  },
];

// Default reviews if none exist in storage
const defaultReviews = [
  {
    id: 1,
    customerName: "Olawale A.",
    email: "olawale@example.com",
    productName: "Ringlight",
    rating: 5,
    comment:
      "These content tools have completely transformed how I manage and organize my work. They're easy to use, save me so much time, and keep everything neat and accessible. Highly recommended!",
    date: "2025-01-10",
  },
  {
    id: 2,
    customerName: "Fiyinfoluwa P.",
    email: "fiyinfoluwa@example.com",
    productName: "LED Light",
    rating: 5,
    comment:
      "Honestly, I didn't expect it to be this good! The tools are smooth, fast, and super helpful for keeping my content workflow organized. I love the user-friendly interface.",
    date: "2025-01-08",
  },
  {
    id: 3,
    customerName: "Michael O.",
    email: "michael@example.com",
    productName: "Tripod Stand",
    rating: 5,
    comment:
      "The best experience I've had with a content tool so far. I can easily manage multiple files and projects without stress. Great work from the developers!",
    date: "2025-01-05",
  },
];

export const HomeSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentReview, setCurrentReview] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [reviews, setReviews] = useState(defaultReviews);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    customerName: "",
    email: "",
    productName: "",
    rating: 5,
    comment: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactnumber: "",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);

  // Load reviews from storage - UPDATED to use shared storage for all users
  useEffect(() => {
    const initializeReviews = async () => {
      try {
        console.log("Attempting to load reviews from shared storage...");

        // Check if window.storage exists (Claude artifacts environment)
        if (typeof window !== "undefined" && window.storage) {
          // Use shared storage API (visible to all users)
          const result = await window.storage.get("customer-reviews", true);

          if (result && result.value) {
            const loadedReviews = JSON.parse(result.value);
            console.log("Loaded reviews from shared storage:", loadedReviews);
            setReviews(loadedReviews);
          } else {
            // No reviews found, initialize with defaults
            console.log("No reviews in storage, initializing with defaults");
            await window.storage.set(
              "customer-reviews",
              JSON.stringify(defaultReviews),
              true, // shared = true means visible to all users
            );
            setReviews(defaultReviews);
          }
        } else {
          // Fallback to localStorage for regular React app
          const storedReviews = localStorage.getItem("customer-reviews");
          if (storedReviews) {
            const loadedReviews = JSON.parse(storedReviews);
            console.log("Loaded reviews from localStorage:", loadedReviews);
            setReviews(loadedReviews);
          } else {
            localStorage.setItem(
              "customer-reviews",
              JSON.stringify(defaultReviews),
            );
            setReviews(defaultReviews);
          }
        }
      } catch (error) {
        console.error("Error in initializeReviews:", error);
        setReviews(defaultReviews);
      }
    };

    initializeReviews();

    // Check for new reviews every 5 seconds (in case other users add reviews)
    const interval = setInterval(async () => {
      try {
        if (typeof window !== "undefined" && window.storage) {
          const result = await window.storage.get("customer-reviews", true);
          if (result && result.value) {
            const loadedReviews = JSON.parse(result.value);
            setReviews(loadedReviews);
          }
        } else {
          const storedReviews = localStorage.getItem("customer-reviews");
          if (storedReviews) {
            const loadedReviews = JSON.parse(storedReviews);
            setReviews(loadedReviews);
          }
        }
      } catch (error) {
        console.error("Error refreshing reviews:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // UPDATED handleReviewSubmit to use shared storage
  const handleReviewSubmit = async () => {
    if (
      !reviewFormData.customerName ||
      !reviewFormData.email ||
      !reviewFormData.productName ||
      !reviewFormData.comment
    ) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const newReview = {
        id: Date.now(),
        ...reviewFormData,
        date: new Date().toISOString().split("T")[0],
      };

      console.log("New review to add:", newReview);

      // Get current reviews
      let currentReviews = reviews;

      if (typeof window !== "undefined" && window.storage) {
        // Use shared storage API
        try {
          const result = await window.storage.get("customer-reviews", true);
          if (result && result.value) {
            currentReviews = JSON.parse(result.value);
            console.log("Fetched current reviews from shared storage");
          }
        } catch (e) {
          console.log("Could not fetch current reviews, using local state:", e);
        }

        const updatedReviews = [newReview, ...currentReviews];

        // Save to shared storage (visible to ALL users)
        await window.storage.set(
          "customer-reviews",
          JSON.stringify(updatedReviews),
          true, // IMPORTANT: shared = true means ALL users can see this
        );

        console.log("Review saved to shared storage successfully!");
      } else {
        // Fallback to localStorage
        try {
          const storedReviews = localStorage.getItem("customer-reviews");
          if (storedReviews) {
            currentReviews = JSON.parse(storedReviews);
          }
        } catch (e) {
          console.log("Could not fetch current reviews:", e);
        }

        const updatedReviews = [newReview, ...currentReviews];
        localStorage.setItem(
          "customer-reviews",
          JSON.stringify(updatedReviews),
        );
        console.log("Review saved to localStorage");
      }

      const updatedReviews = [newReview, ...currentReviews];

      // Update local state
      setReviews(updatedReviews);

      // Reset form
      setReviewFormData({
        customerName: "",
        email: "",
        productName: "",
        rating: 5,
        comment: "",
      });
      setShowReviewModal(false);
      alert(
        "Thank you for your review! It has been saved and is now visible to all users.",
      );
    } catch (error) {
      console.error("Detailed error submitting review:", error);
      alert(`Error saving review: ${error.message}. Please try again.`);
    }
  };

  // Get first letter of email
  const getEmailInitial = (email) => {
    return email ? email.charAt(0).toUpperCase() : "U";
  };

  // Preload carousel images before showing content
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = carouselImages.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      try {
        await Promise.all(imagePromises);
        setImagesLoaded(true);
      } catch (error) {
        console.error("Error preloading images:", error);
        setTimeout(() => setImagesLoaded(true), 3000);
      }
    };

    preloadImages();
  }, []);

  // Auto-scroll carousel every 4s
  useEffect(() => {
    if (!carouselImages || carouselImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      alert("Message sent!");
      setFormData({ name: "", email: "", contactnumber: "", message: "" });
      setIsSending(false);
    }, 2000);
  };

  const handleNextReview = () => {
    setCurrentReview((prev) => (prev + 1) % reviews.length);
  };

  const handlePrevReview = () => {
    setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <section className="relative w-full">
      {/* UPDATED Loading State - 3 bouncing dots with lighter background */}
      {!imagesLoaded && (
        <div className="fixed inset-0 bg-white/50 dark:bg-gray-900/30 z-50 flex items-center justify-center">
          <div className="flex gap-3">
            <div
              className="w-4 h-4 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: "0s" }}
            ></div>
            <div
              className="w-4 h-4 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-4 h-4 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
      )}

      {/* Full Width Auto-Scrolling Carousel */}
      <div className="relative w-full h-[80vh] sm:h-[75vh] md:h-[75vh] lg:h-[90vh] overflow-hidden md:mb-8">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${carouselImages[currentSlide]})`,
            backgroundPosition: "center center",
          }}
        >
          <link
            rel="preload"
            as="image"
            href={carouselImages[(currentSlide + 1) % carouselImages.length]}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />

        <div
          className={cn(
            "relative h-full flex items-center justify-center px-4 sm:px-6 md:px-8 transition-opacity duration-500",
            imagesLoaded ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="text-center text-white drop-shadow-2xl max-w-5xl w-full">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 md:mb-6">
              Manage, Organize and Enhance Your Digital Content!
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed mb-6 md:mb-8 px-2">
              Built to save time, boost accuracy, and make working with content
              smoother than ever.
            </p>
            {/* UPDATED Connect button - scrolls to contact section */}
            <button
              onClick={() => {
                const contactSection =
                  document.getElementById("contact-section");
                if (contactSection) {
                  contactSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }
              }}
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 sm:px-5 sm:py-2 md:px-4 md:py-3 text-sm sm:text-base md:text-lg rounded-lg font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 cursor-pointer"
            >
              Connect with me
            </button>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() =>
            setCurrentSlide(
              (currentSlide - 1 + carouselImages.length) %
                carouselImages.length,
            )
          }
          className="hidden sm:block absolute left-2 sm:left-4 md:left-1 lg:left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-2 sm:p-3 transition-all duration-300 z-10"
          aria-label="Previous slide"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="sm:w-6 sm:h-6"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          onClick={() =>
            setCurrentSlide((currentSlide + 1) % carouselImages.length)
          }
          className="hidden sm:block absolute right-2 sm:right-4 md:right-1 lg:right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-2 sm:p-3 transition-all duration-300 z-10"
          aria-label="Next slide"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="sm:w-6 sm:h-6"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* Mobile Navigation */}
        <div className="sm:hidden absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-20 z-10">
          <button
            onClick={() =>
              setCurrentSlide(
                (currentSlide - 1 + carouselImages.length) %
                  carouselImages.length,
              )
            }
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-2 transition-all duration-300"
            aria-label="Previous slide mobile"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <button
            onClick={() =>
              setCurrentSlide((currentSlide + 1) % carouselImages.length)
            }
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-2 transition-all duration-300"
            aria-label="Next slide mobile"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Dot Indicators */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`${
                currentSlide === index
                  ? "bg-white w-6 sm:w-8 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                  : "bg-white/50 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full transition-all duration-300 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Best Selling Carousel */}
      <div className="mt-12 p-4 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center">
          <h4 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">
            Best <span className="text-primary">Selling</span>
          </h4>
          <p className="text-sm md:text-base text-muted-foreground mb-10">
            Trending, top rated and customer approved favourites you won't want
            to miss
          </p>

          <div className="relative">
            <div className="flex gap-4 md:gap-6 animate-scroll-mobile md:animate-scroll hover:pause-scroll">
              {products.concat(products).map((product, index) => (
                <div
                  key={`${product.id}-${index}`}
                  className="flex-shrink-0 w-[150px] lg:w-[200px] md:w-[200px] bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
                >
                  <div className="relative overflow-hidden h-35 sm:h-44 md:h-48 bg-muted">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {product.badge}
                    </div>
                    <button className="absolute bottom-3 right-3 bg-card p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary hover:text-primary-foreground">
                      <ShoppingCart size={18} />
                    </button>
                  </div>

                  <div className="p-3 md:p-4 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={
                              i < Math.floor(product.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-muted text-muted"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {product.rating}
                      </span>
                    </div>

                    <h3 className="text-sm md:text-base font-bold text-foreground mb-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base md:text-lg font-bold text-primary">
                        {product.price}
                      </span>
                    </div>

                    <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 text-xs md:text-sm rounded-lg transition-colors duration-300 flex items-center justify-center gap-2">
                      <ShoppingCart size={14} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Review Section */}
      <div className="flex flex-col justify-center items-center bg-green-200 mt-20 w-full min-h-[400px] sm:min-h-[450px] px-4 py-10 dark:text-black relative">
        <div className="flex items-center justify-center gap-3 w-full max-w-4xl mb-6">
          <p className="font-bold text-2xl sm:text-3xl">
            What Our Customer says
          </p>
          <button
            onClick={() => setShowReviewModal(true)}
            className="bg-primary hover:bg-primary/90 text-white rounded-full p-2 sm:p-3 transition shadow-lg"
            title="Leave a review"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="relative border bg-white p-6 sm:p-8 shadow-md w-full sm:w-4/5 md:w-[600px] mt-10 border-transparent flex flex-col items-center rounded-xl">
          <button
            onClick={handlePrevReview}
            className="hidden sm:flex absolute left-[-4rem] top-1/2 transform -translate-y-1/2 bg-primary text-white rounded-full p-2 sm:p-3 hover:bg-primary/90 transition"
            aria-label="Previous review"
          >
            <ArrowBigLeft size={20} />
          </button>

          {/* Email Initial Avatar */}
          <div className="flex justify-center -mt-16 mb-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg border-4 border-white">
              {getEmailInitial(reviews[currentReview].email)}
            </div>
          </div>

          {/* Star Rating Display */}
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={20}
                className={
                  i < reviews[currentReview].rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-300 text-gray-300"
                }
              />
            ))}
          </div>

          <p className="text-center text-sm sm:text-base mb-2 px-2">
            {reviews[currentReview].comment}
          </p>
          <p className="font-semibold mt-2 text-primary text-sm sm:text-base">
            - {reviews[currentReview].customerName}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Product: {reviews[currentReview].productName}
          </p>

          <button
            onClick={handleNextReview}
            className="hidden sm:flex absolute right-[-4rem] top-1/2 transform -translate-y-1/2 bg-primary text-white rounded-full p-2 sm:p-3 hover:bg-primary/90 transition"
            aria-label="Next review"
          >
            <ArrowBigRight size={20} />
          </button>

          <div className="flex sm:hidden justify-center gap-6 mt-6">
            <button
              onClick={handlePrevReview}
              className="bg-primary text-white rounded-full p-3 hover:bg-primary/90 transition"
              aria-label="Previous review mobile"
            >
              <ArrowBigLeft size={20} />
            </button>
            <button
              onClick={handleNextReview}
              className="bg-primary text-white rounded-full p-3 hover:bg-primary/90 transition"
              aria-label="Next review mobile"
            >
              <ArrowBigRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Leave a Review
                </h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={reviewFormData.customerName}
                    onChange={(e) =>
                      setReviewFormData({
                        ...reviewFormData,
                        customerName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-900"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    value={reviewFormData.email}
                    onChange={(e) =>
                      setReviewFormData({
                        ...reviewFormData,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-900"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={reviewFormData.productName}
                    onChange={(e) =>
                      setReviewFormData({
                        ...reviewFormData,
                        productName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-900"
                    placeholder="Product you purchased"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() =>
                          setReviewFormData({ ...reviewFormData, rating: star })
                        }
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          size={24}
                          className={
                            star <= reviewFormData.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Review
                  </label>
                  <textarea
                    value={reviewFormData.comment}
                    onChange={(e) =>
                      setReviewFormData({
                        ...reviewFormData,
                        comment: e.target.value,
                      })
                    }
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-white text-gray-900"
                    placeholder="Tell us about your experience..."
                  />
                </div>

                <button
                  onClick={handleReviewSubmit}
                  className="w-full bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPDATED Contact Form Section - Added ID for scroll navigation */}
      <div
        id="contact-section"
        className="flex flex-col lg:flex-row justify-center items-center gap-8 bg-white py-16 px-4 md:px-0 lg:px-12 dark:bg-background"
      >
        <div className="text-center lg:text-left max-w-md px-4 md:px-8 lg:px-0">
          <h4 className="text-3xl sm:text-4xl font-bold text-primary mb-8">
            Contact Us
          </h4>
          <p className="text-muted-foreground text-base leading-relaxed">
            Have a question, idea, or feedback about our lighting products? We'd
            love to hear from you!
          </p>
        </div>

        <div className="w-full md:w-full lg:max-w-lg bg-white dark:bg-background sm:shadow-lg sm:border sm:rounded-2xl sm:p-8">
          <div className="space-y-6">
            <input type="hidden" name="to_name" value="Fiyinfoluwa" />
            <input
              type="hidden"
              name="time"
              value={new Date().toLocaleString()}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Your Name"
                className="w-full px-5 py-3 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Your Email"
                className="w-full px-5 py-3 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
            </div>

            <input
              type="text"
              id="number"
              name="number"
              value={formData.contactnumber}
              onChange={(e) =>
                setFormData({ ...formData, contactnumber: e.target.value })
              }
              placeholder="Phone Number"
              className="w-full px-5 py-3 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
            />

            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Your Message"
              className="w-full border-border resize-none px-5 py-3 border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 min-h-[150px]"
            />

            <button
              onClick={handleSubmit}
              disabled={isSending}
              className={cn(
                "w-full bg-primary text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-70",
              )}
            >
              {isSending ? "Sending..." : "Send Message"}
              {!isSending && <Send size={16} />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeSection;
