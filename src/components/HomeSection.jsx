import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  ShoppingCart,
  Star,
  ArrowBigLeft,
  ArrowBigRight,
  Plus,
  X,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { reviewsAPI, productsAPI } from "../services/firebase";
import emailjs from "@emailjs/browser";

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

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-white/60 dark:bg-gray-900/60 z-[9999] flex items-center justify-center">
      <div className="relative w-16 h-16">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-5 bg-green-600 rounded-full"
            style={{
              left: "50%",
              top: "50%",
              transformOrigin: "1px -20px",
              transform: `rotate(${i * 45}deg)`,
              opacity: 1 - i * 0.12,
              animation: `spin-fade 1s linear infinite`,
              animationDelay: `${-1 + i * 0.125}s`,
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

const defaultProducts = [
  {
    id: 1,
    name: "Ringlight",
    category: "Ringlight",
    price: 25000,
    rating: 4.5,
    image: Ringlight,
    badge: "Bestseller",
  },
  {
    id: 2,
    name: "LED Light",
    category: "LED Light",
    price: 30000,
    rating: 4.6,
    image: ledLight,
    badge: "Hot",
  },
  {
    id: 3,
    name: "Tripod Stand",
    category: "Tripod Stand",
    price: 20000,
    rating: 4.8,
    image: tripodStand,
    badge: "Bestseller",
  },
  {
    id: 4,
    name: "Softbox",
    category: "Softbox",
    price: 40000,
    rating: 4.9,
    image: softbox,
    badge: "Hot",
  },
  {
    id: 5,
    name: "Microphone",
    category: "Microphone",
    price: 18000,
    rating: 4.7,
    image: Microphone,
    badge: "New",
  },
  {
    id: 6,
    name: "Ringlight",
    category: "Ringlight",
    price: 35000,
    rating: 4.5,
    image: ringlight,
    badge: "Bestseller",
  },
];

export const HomeSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentReview, setCurrentReview] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState(defaultProducts);
  const [allReviews, setAllReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [showPurchaseWarning, setShowPurchaseWarning] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [productsVisible, setProductsVisible] = useState(false);
  const [reviewsVisible, setReviewsVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);

  const contactSectionRef = useRef(null);
  const productsSectionRef = useRef(null);
  const reviewsSectionRef = useRef(null);
  const ctaSectionRef = useRef(null);

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
  const [dragStart, setDragStart] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Carousel states
  const [carouselOffset, setCarouselOffset] = useState(0);
  const [isDraggingCarousel, setIsDraggingCarousel] = useState(false);
  const [dragStartPos, setDragStartPos] = useState(0);
  const [dragCurrentPos, setDragCurrentPos] = useState(0);
  const carouselContainerRef = useRef(null);
  const carouselInnerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(Date.now());

  const EMAILJS_SERVICE_ID = "service_f8jpcjv";
  const EMAILJS_TEMPLATE_ID = "template_2dmkkl9";
  const EMAILJS_PUBLIC_KEY = "aYMxHd4D49CBiJT-X";

  const heroSlides = [
    {
      image: myImage1,
      title: "Manage, Organize and Enhance Your Digital Content!",
      subtitle:
        "Built to save time, boost accuracy, and make working with content smoother than ever.",
      buttonText: "Connect with me",
      action: "contact",
    },
    {
      image: myImage2,
      title: "Transform Your Workflow with Smart Tools!",
      subtitle:
        "Streamline your content creation and management like never before.",
      buttonText: "Get Started",
      action: "signin",
    },
    {
      image: myImage3,
      title: "Professional Content Management Made Easy!",
      subtitle:
        "Everything you need to create, organize, and optimize your digital content.",
      buttonText: "Explore Now",
      action: "shop",
    },
  ];

  useEffect(() => {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }, []);

  const getProductReviewCount = (productName) => {
    return allReviews.filter(
      (review) =>
        review.productName?.toLowerCase() === productName?.toLowerCase(),
    ).length;
  };

  const scrollToReviews = () => {
    const reviewsSection = document.querySelector(
      ".flex.flex-col.justify-center.items-center.bg-green-200",
    );
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  useEffect(() => {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === productsSectionRef.current) {
            setTimeout(() => setProductsVisible(true), 100);
          } else if (entry.target === reviewsSectionRef.current) {
            setTimeout(() => setReviewsVisible(true), 100);
          } else if (entry.target === ctaSectionRef.current) {
            setTimeout(() => setCtaVisible(true), 100);
          }
        }
      });
    }, observerOptions);

    if (productsSectionRef.current)
      observer.observe(productsSectionRef.current);
    if (reviewsSectionRef.current) observer.observe(reviewsSectionRef.current);
    if (ctaSectionRef.current) observer.observe(ctaSectionRef.current);

    return () => {
      if (productsSectionRef.current)
        observer.unobserve(productsSectionRef.current);
      if (reviewsSectionRef.current)
        observer.unobserve(reviewsSectionRef.current);
      if (ctaSectionRef.current) observer.unobserve(ctaSectionRef.current);
    };
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const firebaseProducts = await productsAPI.getAll();
        if (firebaseProducts && firebaseProducts.length > 0) {
          setProducts(firebaseProducts);
        }
      } catch (error) {
        console.error("Error loading products:", error);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const loadedReviews = await reviewsAPI.getAll();
        setAllReviews(loadedReviews || []);
      } catch (error) {
        console.error("Error loading reviews:", error);
        setAllReviews([]);
      }
    };

    loadReviews();
    const interval = setInterval(loadReviews, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isSignedIn && userEmail) {
      setReviewFormData((prev) => ({ ...prev, email: userEmail }));
    }
  }, [isSignedIn, userEmail]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const userEmail = user.email || user.phone || "";
          if (userEmail) {
            setIsSignedIn(true);
            setUserEmail(userEmail);
            const purchases = localStorage.getItem("user-purchases");
            if (purchases) {
              const parsedPurchases = JSON.parse(purchases);
              const userPurchases = parsedPurchases.filter(
                (p) => p.email === userEmail,
              );
              setHasPurchased(userPurchases.length > 0);
            }
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    };

    checkAuth();
    const handleUserUpdate = () => checkAuth();
    window.addEventListener("userUpdated", handleUserUpdate);
    return () => window.removeEventListener("userUpdated", handleUserUpdate);
  }, []);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const firebaseReviews = await reviewsAPI.getAll();
        setReviews(
          firebaseReviews && firebaseReviews.length > 0 ? firebaseReviews : [],
        );
      } catch (error) {
        console.error("Error loading reviews:", error);
        setReviews([]);
      }
    };

    loadReviews();
    const interval = setInterval(loadReviews, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleReviewSubmit = async () => {
    if (!isSignedIn) {
      setShowSignInPrompt(true);
      return;
    }
    if (!hasPurchased) {
      setShowPurchaseWarning(true);
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
      const updatedReviews = await reviewsAPI.getAll();
      setReviews(updatedReviews);
      setReviewFormData({
        customerName: "",
        email: userEmail,
        productName: "",
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

  const handleDeleteReview = async (reviewId, reviewEmail) => {
    if (reviewEmail !== userEmail) {
      alert("You can only delete your own reviews");
      return;
    }
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      await reviewsAPI.delete(reviewId);
      const updatedReviews = await reviewsAPI.getAll();
      setReviews(updatedReviews);
      if (currentReview >= updatedReviews.length) {
        setCurrentReview(0);
      }
      alert("Review deleted successfully!");
    } catch (error) {
      console.error("Error deleting review:", error);
      alert(`Error deleting review: ${error.message}`);
    }
  };

  const getEmailInitial = (email) =>
    email ? email.charAt(0).toUpperCase() : "U";

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
      setImagesLoaded(true);
    }, 300);

    heroSlides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!heroSlides || heroSlides.length === 0) return;
    const interval = setInterval(() => {
      if (!isDragging) {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isDragging]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSending(true);
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_name: "Fiyinfoluwa",
          name: formData.name,
          email: formData.email,
          time: new Date().toLocaleString(),
          message: formData.message,
          contactnumber: formData.contactnumber || "Not provided",
        },
        EMAILJS_PUBLIC_KEY,
      );

      alert("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", contactnumber: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
      alert(
        "Failed to send message. Please try again or email us directly at support@mylightstore.com",
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleNextReview = () => {
    if (reviews.length > 0)
      setCurrentReview((prev) => (prev + 1) % reviews.length);
  };

  const handlePrevReview = () => {
    if (reviews.length > 0)
      setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleHeroDragStart = (e) => {
    setDragStart(e.type === "mousedown" ? e.clientX : e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleHeroDragEnd = (e) => {
    if (!isDragging) return;
    const dragEnd =
      e.type === "mouseup" ? e.clientX : e.changedTouches[0].clientX;
    const diff = dragStart - dragEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      } else {
        setCurrentSlide(
          (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
        );
      }
    }
    setIsDragging(false);
  };

  const handleHeroWheel = (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      if (e.deltaX > 30) {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      } else if (e.deltaX < -30) {
        setCurrentSlide(
          (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
        );
      }
    }
  };

  const handleButtonClick = (action) => {
    if (action === "contact") {
      const contactSection = document.getElementById("contact-section");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else if (action === "signin") {
      window.location.href = "/signin";
    } else if (action === "shop") {
      window.location.href = "/shop";
    }
  };

  // ✅ FIXED: Slower infinite carousel auto-scroll
  useEffect(() => {
    if (isDraggingCarousel || !carouselInnerRef.current) return;

    const animate = () => {
      const now = Date.now();
      const deltaTime = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // ✅ VERY SLOW: 0.04 px/ms — barely perceptible, smooth drift
      const speed = 0.04;
      const movement = speed * deltaTime;

      setCarouselOffset((prevOffset) => {
        const innerEl = carouselInnerRef.current;
        if (!innerEl) return prevOffset;
        // The inner strip is duplicated once (2 copies), so singleSetWidth = half the total
        const singleSetWidth = innerEl.scrollWidth / 2;
        const newOffset = prevOffset - movement;

        if (Math.abs(newOffset) >= singleSetWidth) {
          return newOffset + singleSetWidth;
        }
        return newOffset;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDraggingCarousel]);

  // ✅ FIXED DRAG HANDLERS
  const handleCarouselMouseDown = (e) => {
    setIsDraggingCarousel(true);
    setDragStartPos(e.type === "mousedown" ? e.clientX : e.touches[0].clientX);
    setDragCurrentPos(
      e.type === "mousedown" ? e.clientX : e.touches[0].clientX,
    );

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const handleCarouselMouseMove = (e) => {
    if (!isDraggingCarousel) return;
    e.preventDefault();

    const currentX = e.type === "mousemove" ? e.clientX : e.touches[0].clientX;
    const diff = currentX - dragCurrentPos;

    setCarouselOffset((prev) => {
      const innerEl = carouselInnerRef.current;
      if (!innerEl) return prev;
      const singleSetWidth = innerEl.scrollWidth / 2;
      const newOffset = prev + diff;

      if (Math.abs(newOffset) >= singleSetWidth) {
        return newOffset + singleSetWidth;
      }
      if (newOffset > 0) {
        return newOffset - singleSetWidth;
      }
      return newOffset;
    });

    setDragCurrentPos(currentX);
  };

  const handleCarouselMouseUp = () => {
    setIsDraggingCarousel(false);
    lastTimeRef.current = Date.now();
  };

  const renderStars = (rating, size = 14) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    for (let i = 0; i < 5; i++) {
      if (i < fullStars)
        stars.push(
          <Star
            key={i}
            size={size}
            className="text-yellow-400 fill-yellow-400"
          />,
        );
      else if (i === fullStars && hasHalfStar)
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
      else stars.push(<Star key={i} size={size} className="text-gray-300" />);
    }
    return stars;
  };

  return (
    <section className="relative w-full">
      {initialLoading && <LoadingSpinner />}

      {/* ============================================================
          HERO CAROUSEL
          - Desktop/tablet (sm+): full overlay layout (original)
          - Mobile (< sm): image top, text + button BELOW (Jan Deux style)
      ============================================================ */}

      {/* ── MOBILE HERO (< sm) ── 
          Single block: image fills full height, text overlays at the bottom.
          No separate black panel below. Title hidden, only subtitle + button shown.
      ── */}
      <div
        className="sm:hidden relative w-full overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleHeroDragStart}
        onMouseUp={handleHeroDragEnd}
        onMouseLeave={() => setIsDragging(false)}
        onTouchStart={handleHeroDragStart}
        onTouchEnd={handleHeroDragEnd}
        onWheel={handleHeroWheel}
      >
        {/* Full-height image container — taller on mobile, dots above text */}
        <div
          className="relative w-full overflow-hidden"
          style={{ height: "170vw", maxHeight: "800px", minHeight: "560px" }}
        >
          {/* Slide images */}
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
            </div>
          ))}

          {/* Gradient overlay — darkens bottom for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent z-20 pointer-events-none" />

          {/* All bottom content: subtitle → button → dots */}
          <div className="absolute bottom-0 left-0 right-0 z-30 flex flex-col items-center px-5 pb-6 text-center text-white">
            {/* Subtitle + button (title hidden on mobile) */}
            {heroSlides.map((slide, index) =>
              index === currentSlide ? (
                <div key={index} className="flex flex-col items-center">
                  <p className="text-sm text-white/90 leading-relaxed mb-4 max-w-xs drop-shadow-md">
                    {slide.subtitle}
                  </p>
                  <button
                    onClick={() => handleButtonClick(slide.action)}
                    className="border border-white text-white text-[11px] font-semibold tracking-[0.2em] uppercase px-7 py-3 hover:bg-white hover:text-black transition-all duration-300 mb-5"
                  >
                    {slide.buttonText}
                  </button>
                </div>
              ) : null,
            )}

            {/* Dots BELOW the button */}
            <div className="flex gap-2">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={
                    currentSlide === idx
                      ? "bg-white w-6 h-1.5 rounded-full transition-all duration-300"
                      : "bg-white/50 w-2 h-1.5 rounded-full transition-all duration-300"
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── DESKTOP / TABLET HERO (sm+) – original layout unchanged ── */}
      <div
        className="hidden sm:block relative w-full h-[75vh] md:h-[90vh] lg:h-[90vh] overflow-hidden md:mb-8 cursor-grab active:cursor-grabbing"
        onMouseDown={handleHeroDragStart}
        onMouseUp={handleHeroDragEnd}
        onMouseLeave={() => setIsDragging(false)}
        onTouchStart={handleHeroDragStart}
        onTouchEnd={handleHeroDragEnd}
        onWheel={handleHeroWheel}
      >
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-[1500ms] ease-in-out ${
              index === currentSlide
                ? "opacity-100 scale-100 z-10"
                : "opacity-0 scale-105 z-0"
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[1500ms] ease-out"
              style={{
                backgroundImage: `url(${slide.image})`,
                backgroundPosition: "center center",
                transform: index === currentSlide ? "scale(1)" : "scale(1.1)",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

            <div className="relative h-full flex items-center justify-center px-4 sm:px-6 md:px-8 pointer-events-none">
              <div className="text-center text-white drop-shadow-2xl max-w-5xl w-full">
                <h1
                  className={cn(
                    "text-4xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-6xl font-bold leading-tight mb-4 md:mb-6 transition-all duration-1000 ease-out",
                    index === currentSlide
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-150",
                  )}
                  style={{
                    transitionDelay: index === currentSlide ? "0.2s" : "0s",
                  }}
                >
                  {slide.title}
                </h1>

                <p
                  className={cn(
                    "text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed mb-6 md:mb-8 px-2 transition-all duration-1000 ease-out",
                    index === currentSlide
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-20",
                  )}
                  style={{
                    transitionDelay: index === currentSlide ? "0.5s" : "0s",
                  }}
                >
                  {slide.subtitle}
                </p>

                <button
                  onClick={() => handleButtonClick(slide.action)}
                  className={cn(
                    "group inline-flex items-center gap-0 border border-white text-white text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase px-10 py-3 hover:bg-white hover:text-black transition-all duration-300 cursor-pointer pointer-events-auto",
                    index === currentSlide
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 -translate-y-10",
                  )}
                  style={{
                    transitionDelay: index === currentSlide ? "0.8s" : "0s",
                    transition:
                      "opacity 1s ease-out, transform 1s ease-out, background-color 0.3s, color 0.3s",
                  }}
                >
                  {slide.buttonText}
                  <ArrowRight
                    size={16}
                    className="opacity-0 w-0 overflow-hidden transition-all duration-300 group-hover:opacity-100 group-hover:w-5 group-hover:ml-2"
                  />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={() =>
            setCurrentSlide(
              (currentSlide - 1 + heroSlides.length) % heroSlides.length,
            )
          }
          className="absolute left-2 sm:left-4 md:left-1 lg:left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-2 sm:p-3 transition-all duration-300 z-20 pointer-events-auto"
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
            setCurrentSlide((currentSlide + 1) % heroSlides.length)
          }
          className="absolute right-2 sm:right-4 md:right-1 lg:right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-2 sm:p-3 transition-all duration-300 z-20 pointer-events-auto"
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

        {/* Dot Indicators */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20 pointer-events-auto">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`${
                currentSlide === index
                  ? "bg-white w-6 sm:w-8 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                  : "bg-white/50 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full transition-all duration-300 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ============================================================
          PRODUCTS SECTION - FIXED INFINITE CAROUSEL
          ✅ Duplicated ONCE (not 3x) to prevent repeat cards
          ✅ Speed slowed to 0.12 px/ms
      ============================================================ */}
      <div
        ref={productsSectionRef}
        className={`mt-12 p-4 overflow-hidden transition-all duration-1000 ${
          productsVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-20"
        }`}
        id="products"
      >
        <div className="max-w-[1920px] mx-auto text-center">
          <h4 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">
            Best <span className="text-primary">Selling</span>
          </h4>
          <p className="text-sm md:text-base text-muted-foreground mb-10">
            Trending, top rated and customer approved favourites you won't want
            to miss
          </p>

          <div
            ref={carouselContainerRef}
            className="relative overflow-hidden"
            onMouseDown={handleCarouselMouseDown}
            onMouseMove={handleCarouselMouseMove}
            onMouseUp={handleCarouselMouseUp}
            onMouseLeave={handleCarouselMouseUp}
            onTouchStart={handleCarouselMouseDown}
            onTouchMove={handleCarouselMouseMove}
            onTouchEnd={handleCarouselMouseUp}
          >
            <div
              ref={carouselInnerRef}
              className="flex gap-4 md:gap-6 cursor-grab active:cursor-grabbing select-none"
              style={{
                transform: `translateX(${carouselOffset}px)`,
                transition: "none",
                touchAction: "pan-y",
                willChange: "transform",
              }}
            >
              {/* ✅ FIXED: Duplicated TWICE (2 copies) — not 3 — so cards only appear once visually */}
              {[...products, ...products].map((product, index) => {
                const reviewCount = getProductReviewCount(product.name);

                return (
                  <div
                    key={`${product.id}-${index}`}
                    className="flex-shrink-0 w-[150px] lg:w-[200px] md:w-[200px] xl:w-[220px] 2xl:w-[240px] bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-105 group animate-fade-in-up flex flex-col"
                    style={{
                      animationDelay: `${(index % products.length) * 0.1}s`,
                    }}
                  >
                    <div className="relative overflow-hidden h-35 sm:h-44 md:h-48 xl:h-52 2xl:h-56 bg-muted pointer-events-none">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        draggable="false"
                        className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-2 transition-all duration-700"
                      />
                      {product.badge && (
                        <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold animate-bounce-slow">
                          {product.badge}
                        </div>
                      )}
                      <button className="absolute bottom-3 right-3 bg-card p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-primary-foreground transform group-hover:rotate-12 pointer-events-auto">
                        <ShoppingCart size={18} />
                      </button>
                    </div>

                    <div className="p-3 md:p-4 text-left flex flex-col flex-1 pointer-events-none">
                      <h3 className="text-sm md:text-base font-bold text-foreground mb-2 line-clamp-2 min-h-[40px]">
                        {product.name}
                      </h3>

                      <div className="flex items-center gap-2 mb-3 min-h-[28px]">
                        <span className="text-base md:text-lg font-bold text-primary">
                          ₦{product.price.toLocaleString()}
                        </span>
                      </div>

                      <button className="liquid-button-product w-full font-semibold py-2 text-xs md:text-sm rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 relative overflow-hidden mt-auto pointer-events-auto">
                        <span className="relative z-10 text-white flex items-center gap-2">
                          <ShoppingCart size={14} />
                          Add to Cart
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ REVIEWS SECTION WITH SCROLL ANIMATION */}
      <div
        ref={reviewsSectionRef}
        className={`flex flex-col justify-center items-center bg-green-200 mt-20 w-full min-h-[400px] sm:min-h-[450px] px-4 py-10 dark:text-black relative transition-all duration-1000 ${
          reviewsVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="flex items-center justify-center gap-3 w-full max-w-4xl mb-6">
          <p className="font-bold text-2xl sm:text-3xl">
            What Our Customer says
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-2xl font-bold mb-2">No Reviews Yet</h3>
            <p className="text-gray-600 mb-6">
              Be the first to share your experience on the product detail page!
            </p>
          </div>
        ) : (
          <div className="relative border bg-white p-6 sm:p-8 shadow-md w-full sm:w-4/5 md:w-[600px] mt-10 border-transparent flex flex-col items-center rounded-xl">
            <button
              onClick={handlePrevReview}
              className="hidden sm:flex absolute left-[-4rem] top-1/2 transform -translate-y-1/2 bg-primary text-white rounded-full p-2 sm:p-3 hover:bg-primary/90 transition"
            >
              <ArrowBigLeft size={20} />
            </button>

            <div className="flex justify-center -mt-16 mb-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg border-4 border-white">
                {getEmailInitial(reviews[currentReview].email)}
              </div>
            </div>

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

            {isSignedIn && reviews[currentReview].email === userEmail && (
              <button
                onClick={() =>
                  handleDeleteReview(
                    reviews[currentReview].id,
                    reviews[currentReview].email,
                  )
                }
                className="mt-4 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors mx-auto"
                title="Delete my review"
              >
                <Trash2 size={18} />
              </button>
            )}

            <button
              onClick={handleNextReview}
              className="hidden sm:flex absolute right-[-4rem] top-1/2 transform -translate-y-1/2 bg-primary text-white rounded-full p-2 sm:p-3 hover:bg-primary/90 transition"
            >
              <ArrowBigRight size={20} />
            </button>

            <div className="flex sm:hidden justify-center gap-6 mt-6">
              <button
                onClick={handlePrevReview}
                className="bg-primary text-white rounded-full p-3 hover:bg-primary/90 transition"
              >
                <ArrowBigLeft size={20} />
              </button>
              <button
                onClick={handleNextReview}
                className="bg-primary text-white rounded-full p-3 hover:bg-primary/90 transition"
              >
                <ArrowBigRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ CONTACT SECTION */}
      <div
        ref={contactSectionRef}
        id="contact-section"
        className="flex flex-col lg:flex-row justify-center items-center gap-8 bg-white py-16 px-4 md:px-0 lg:px-12 dark:bg-background overflow-hidden"
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
          <form onSubmit={handleSubmit} className="space-y-6">
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
                required
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
                required
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
              required
            />

            <button
              type="submit"
              disabled={isSending}
              className="liquid-button-send w-full font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 relative overflow-hidden"
            >
              <span className="relative z-10 text-white flex items-center gap-2">
                {isSending ? "Sending..." : "Send Message"}
                {!isSending && <Send size={16} />}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* ✅ CTA SECTION WITH SCROLL ANIMATION */}
      <div
        ref={ctaSectionRef}
        className={`bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-800 dark:to-gray-900 py-16 px-4 transition-all duration-1000 ${
          ctaVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Elevate Your Content?
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who trust us for professional lighting
            equipment. Get exclusive deals, expert tips, and priority support.
          </p>
          <div className="flex flex-row sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => (window.location.href = "/shop")}
              className="px-3 py-3 lg:px-8 lg:py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Browse Products
            </button>
            <button
              onClick={() => {
                const contactSection =
                  document.getElementById("contact-section");
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="px-3 py-3 lg:px-8 lg:py-4 bg-white text-primary border-2 border-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-all duration-300 shadow-lg"
            >
              Get in Touch
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes liquidFill {
          0% {
            transform: translateY(100%) scale(1.5);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .liquid-button::before,
        .liquid-button-product::before,
        .liquid-button-modal::before,
        .liquid-button-send::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          border-radius: inherit;
          transform: translateY(100%) scale(1.5);
          transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 0;
        }

        .liquid-button::after,
        .liquid-button-product::after,
        .liquid-button-modal::after,
        .liquid-button-send::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #16a34a;
          border-radius: inherit;
          z-index: 0;
        }

        .liquid-button:hover::before,
        .liquid-button-product:hover::before,
        .liquid-button-modal:hover::before,
        .liquid-button-send:hover::before {
          transform: translateY(0) scale(1);
          animation: liquidFill 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .liquid-button:active,
        .liquid-button-product:active,
        .liquid-button-modal:active,
        .liquid-button-send:active {
          transform: scale(0.95);
        }
      `}</style>
    </section>
  );
};

export default HomeSection;
