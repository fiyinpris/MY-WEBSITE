import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "./CartSection";
import { useWishlist } from "./WishlistSection";
import {
  Heart,
  ArrowLeft,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("products-database");
      if (stored) {
        const products = JSON.parse(stored);
        const foundProduct = products.find((p) => p.id === Number(id));
        setProduct(foundProduct);
      }
    } catch (error) {
      console.error("Error loading product:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) addToCart(product);
    }
  };

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  // Carousel navigation functions
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

  const handlePrevMedia = () => {
    const newIndex =
      selectedMedia > 0 ? selectedMedia - 1 : allMedia.length - 1;
    scrollToMedia(newIndex);
  };

  const handleNextMedia = () => {
    const newIndex =
      selectedMedia < allMedia.length - 1 ? selectedMedia + 1 : 0;
    scrollToMedia(newIndex);
  };

  // Track scroll position to update selected media
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

  // Build all media array - main image + 2 thumbnails + video (always show slots even if empty)
  const allMedia = [
    { type: "image", src: product.image, label: "Main Image" },
    { type: "image", src: product.thumbnail1 || null, label: "Image 1" },
    { type: "image", src: product.thumbnail2 || null, label: "Image 2" },
    { type: "video", src: product.videoThumbnail || null, label: "Video" },
  ];

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-14 mt-10">
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
        {/* Back Button */}
        <button
          onClick={() => navigate("/shop")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back to Shop</span>
        </button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images Section */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Desktop/Large screen: Vertical Thumbnails + Main Display */}
            <div className="hidden lg:flex lg:flex-row gap-4 w-full">
              {/* Thumbnails */}
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

              {/* Main Display */}
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

            {/* Mobile/Tablet: Draggable Carousel for ALL media (2 images + 1 video) */}
            <div className="lg:hidden w-full">
              <div className="relative">
                {/* Carousel Container */}
                <div
                  ref={carouselRef}
                  className="flex overflow-x-auto scrollbar-hide carousel-snap gap-4"
                  style={{
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  {allMedia.map((media, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-full h-[300px] sm:h-[400px] rounded-2xl overflow-hidden bg-gray-100"
                    >
                      {media.src ? (
                        media.type === "video" ? (
                          <video
                            src={media.src}
                            controls
                            className="w-full h-full object-cover"
                            draggable="false"
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

                {/* Navigation Arrows */}
                <button
                  onClick={handlePrevMedia}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-10"
                  aria-label="Previous media"
                >
                  <ChevronLeft size={24} className="text-gray-800" />
                </button>
                <button
                  onClick={handleNextMedia}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-10"
                  aria-label="Next media"
                >
                  <ChevronRight size={24} className="text-gray-800" />
                </button>

                {/* Dots Indicator */}
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

            <p className="text-4xl font-bold text-green-600 mb-6">
              ₦{product.price.toLocaleString()}
            </p>

            {/* Product Description */}
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

            {/* Quantity */}
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

            {/* Actions */}
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
      </div>
    </div>
  );
};
