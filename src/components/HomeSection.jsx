// src/components/HomeSection.jsx
import React, { useState, useEffect } from "react";
import {
  Send,
  ShoppingCart,
  Star,
  ArrowBigLeft,
  ArrowBigRight,
} from "lucide-react";

// keep your original filenames (spaces allowed) — ensure the files exist at these paths
import myImage1 from "../Images/image 7.jpg";
import myImage2 from "../Images/image 16.jpg";
import myImage3 from "../Images/image 15.jpg";

// small classnames helper (you used `cn` elsewhere)
function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

const carouselImages = [myImage1, myImage2, myImage3];

const products = [
  {
    id: 1,
    name: "LED 600",
    price: "#43,000.00 NGN",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=500&q=80",
    badge: "Bestseller",
  },
  {
    id: 2,
    name: "LED 800",
    price: "#57,000.00 NGN",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80",
    badge: "Bestseller",
  },
  {
    id: 3,
    name: "K29 Tripod",
    price: "#30,000.00 NGN",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&q=80",
    badge: "Bestseller",
  },
  {
    id: 4,
    name: "K29 Tripod",
    price: "#30,000.00 NGN",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&q=80",
    badge: "Bestseller",
  },
  {
    id: 5,
    name: "LED 800",
    price: "#57,000.00 NGN",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80",
    badge: "Bestseller",
  },
  {
    id: 6,
    name: "K29 Tripod",
    price: "#30,000.00 NGN",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&q=80",
    badge: "Bestseller",
  },
];

const reviews = [
  {
    id: 1,
    name: "Olawale A.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    text: "These content tools have completely transformed how I manage and organize my work. They're easy to use, save me so much time, and keep everything neat and accessible. Highly recommended!",
  },
  {
    id: 2,
    name: "Fiyinfoluwa P.",
    image: "https://randomuser.me/api/portraits/women/45.jpg",
    text: "Honestly, I didn't expect it to be this good! The tools are smooth, fast, and super helpful for keeping my content workflow organized. I love the user-friendly interface.",
  },
  {
    id: 3,
    name: "Michael O.",
    image: "https://randomuser.me/api/portraits/men/55.jpg",
    text: "The best experience I've had with a content tool so far. I can easily manage multiple files and projects without stress. Great work from the developers!",
  },
];

export const HomeSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentReview, setCurrentReview] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactnumber: "",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);

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
      {/* Full Width Auto-Scrolling Carousel */}
      <div className="relative w-full h-[80vh] sm:h-[75vh] md:h-[75vh] lg:h-[90vh] overflow-hidden md:mb-8">
        {/* Background Image - centered properly */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${carouselImages[currentSlide]})`,
            backgroundPosition: "center center",
          }}
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />

        {/* Content Container - Text Overlay on Image */}
        <div className="relative h-full flex items-center justify-center px-4 sm:px-6 md:px-8">
          <div className="text-center text-white drop-shadow-2xl max-w-5xl w-full">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 md:mb-6">
              Manage, Organize and Enhance Your Digital Content!
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed mb-6 md:mb-8 px-2">
              Built to save time, boost accuracy, and make working with content
              smoother than ever.
            </p>
            <button className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-5 sm:py-2 md:px-4 md:py-3 text-sm sm:text-base md:text-lg rounded-lg font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105">
              Connect with me
            </button>
          </div>
        </div>

        {/* Navigation Arrows - Center Left and Right (Medium and Large Screens Only) */}
        <button
          onClick={() =>
            setCurrentSlide(
              (currentSlide - 1 + carouselImages.length) % carouselImages.length
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

        {/* Arrow Buttons for Small Screens - Bottom Center */}
        <div className="sm:hidden absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-20 z-10">
          <button
            onClick={() =>
              setCurrentSlide(
                (currentSlide - 1 + carouselImages.length) %
                  carouselImages.length
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

        {/* Dot Indicators - Bottom Center */}
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

          {/* Scrolling Container */}
          <div className="relative">
            <div className="flex gap-4 md:gap-6 animate-scroll-mobile md:animate-scroll hover:pause-scroll">
              {products.concat(products).map((product, index) => (
                <div
                  key={`${product.id}-${index}`}
                  className="flex-shrink-0 w-[150px] lg:w-[200px] md:w-[200px] bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
                >
                  {/* Image Container */}
                  <div className="relative overflow-hidden h-35 sm:h-44 md:h-48 bg-muted">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Badge */}
                    <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {product.badge}
                    </div>
                    {/* Quick Add Button */}
                    <button className="absolute bottom-3 right-3 bg-card p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary hover:text-primary-foreground">
                      <ShoppingCart size={18} />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-3 md:p-4 text-left">
                    {/* Rating */}
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
        <p className="font-bold text-2xl sm:text-3xl text-center">
          What Our Customer says
        </p>

        <div className="relative border bg-white p-6 sm:p-8 shadow-md w-full sm:w-4/5 md:w-[600px] mt-10 border-transparent flex flex-col items-center rounded-xl">
          <button
            onClick={handlePrevReview}
            className="hidden sm:flex absolute left-[-4rem] top-1/2 transform -translate-y-1/2 bg-primary text-white rounded-full p-2 sm:p-3 hover:bg-primary/90 transition"
            aria-label="Previous review"
          >
            <ArrowBigLeft size={20} />
          </button>

          <div className="flex justify-center -mt-16">
            <img
              src={reviews[currentReview].image}
              alt={reviews[currentReview].name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-white dark:border-gray-800 shadow-md object-cover mb-8"
            />
          </div>

          <p className="text-center text-sm sm:text-base mb-2 px-2">
            {reviews[currentReview].text}
          </p>
          <p className="font-semibold mt-2 text-primary text-sm sm:text-base">
            - {reviews[currentReview].name}
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

      {/* Contact Form Section */}
      <div className="flex flex-col lg:flex-row justify-center items-center gap-8 bg-white py-16 px-4 md:px-0 lg:px-12 dark:bg-background">
        {/* Text Section */}
        <div className="text-center lg:text-left max-w-md px-4 md:px-8 lg:px-0">
          <h4 className="text-3xl sm:text-4xl font-bold text-primary mb-8">
            Contact Us
          </h4>
          <p className="text-muted-foreground text-base leading-relaxed">
            Have a question, idea, or feedback about our lighting products? We'd
            love to hear from you!
          </p>
        </div>

        {/* Form Card */}
        <div
          className="w-full md:w-full lg:max-w-lg bg-white dark:bg-background sm:shadow-lg sm:border sm:rounded-2xl sm:p-8"
          style={{ opacity: 1, transition: "opacity 0.1s ease-in" }}
        >
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
                required
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
                required
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
              required
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
              required
              className="w-full border-border resize-none px-5 py-3 border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 min-h-[150px]"
            />

            <button
              type="submit"
              disabled={isSending}
              className={cn(
                "w-full bg-primary text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-70"
              )}
            >
              {isSending ? "Sending..." : "Send Message"}
              {!isSending && <Send size={16} />}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default HomeSection;
