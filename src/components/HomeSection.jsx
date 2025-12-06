import { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";

import myImage from "../Images/image 7.jpg";
import {
  ArrowBigLeft,
  ArrowBigRight,
  ShoppingCart,
  Star,
  Send,
  Facebook,
  Instagram,
} from "lucide-react";
import { cn } from "../lib/utils";

const products = [
  {
    id: 1,
    name: "LED 600",
    price: "#43,000.00 NGN",
    rating: 4.8,
    reviews: 156,
    image:
      "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=500&q=80",
    badge: "Bestseller",
  },
  {
    id: 2,
    name: "LED 800",
    price: "#57,000.00 NGN",
    rating: 4.9,
    reviews: 203,
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80",
    badge: "Bestseller",
  },
  {
    id: 3,
    name: "K29 Tripod",
    price: "#30,000.00 NGN",
    rating: 4.7,
    reviews: 89,
    image:
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&q=80",
    badge: "Bestseller",
  },
  {
    id: 4,
    name: "LED 600",
    price: "#43,000.00 NGN",
    rating: 4.8,
    reviews: 156,
    image:
      "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=500&q=80",
    badge: "Bestseller",
  },
  {
    id: 5,
    name: "LED 800",
    price: "#57,000.00 NGN",
    rating: 4.9,
    reviews: 203,
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80",
    badge: "Bestseller",
  },
  {
    id: 3,
    name: "K29 Tripod",
    price: "#30,000.00 NGN",
    rating: 4.7,
    reviews: 89,
    image:
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&q=80",
    badge: "Bestseller",
  },
  {
    id: 4,
    name: "LED 600",
    price: "#43,000.00 NGN",
    rating: 4.8,
    reviews: 156,
    image:
      "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=500&q=80",
    badge: "Bestseller",
  },
  {
    id: 5,
    name: "LED 800",
    price: "#57,000.00 NGN",
    rating: 4.9,
    reviews: 203,
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80",
    badge: "Bestseller",
  },
];

// Customer reviews
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
  const [currentReview, setCurrentReview] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactnumber: "",
    message: "",
  });

  const [isSending, setIsSending] = useState(false);

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
    <section
      id="Home"
      className="relative min-h-screen items-center justify-center lg:pt-24 pt-14"
    >
      {/* Hero Section */}
      <div className="flex items-center justify-center px-0 md:px-4">
        <div className="w-full  mx-auto lg:px-2 px-0 md:px-4">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="cursor-typewriter space-y-6 text-center md:text-left order-2 md:order-1 px-2 sm:px-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                <span>Manage, </span>
                <span>Organize </span>
                <span>and Enhance Your Digital Content!</span>
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed animate-fade-in-delay-4">
                Built to save time, boost accuracy, and make working with
                content smoother than ever.
              </p>

              <div className="pt-4 animate-fade-in-delay-3">
                <Link
                  to="/contact"
                  className="normal-button inline-block text-sm sm:text-base"
                >
                  Connect with me
                </Link>
              </div>
            </div>

            {/* Image */}
            <div className="flex justify-center order-1 md:order-2 w-full">
              <img
                src={myImage}
                alt=""
                className="w-full h-100 md:w-[30rem] md:h-[20rem] lg:w-[27rem] lg:h-[27rem] object-cover lg:hover:scale-105 transition-transform duration-500 drop-shadow-2xl lg:rounded-3xl "
              />
            </div>
          </div>
        </div>
      </div>

      {/* Best Selling Carousel */}
      <div className="mt-20 p-4 overflow-hidden">
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
          >
            <ArrowBigLeft size={20} />
          </button>

          <div className="flex justify-center -mt-16">
            <img
              src={reviews[currentReview].image || "myImage2"}
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
      </div>

      {/* Contact Form Section */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-8 bg-white py-16 px-6 sm:px-12 dark:bg-background">
        <div className="text-center md:text-left max-w-md">
          <h4 className="text-3xl sm:text-4xl font-bold text-primary mb-8">
            Contact Us
          </h4>
          <p className="text-muted-foreground text-base leading-relaxed">
            Have a question, idea, or feedback about our lighting products? We'd
            love to hear from you!
          </p>
        </div>

        <div
          className="w-full max-w-lg bg-white dark:bg-background sm:shadow-lg sm:border sm:rounded-2xl p- sm:p-8"
          style={{ opacity: 1, transition: "opacity 0.1s ease-in" }}
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
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
              className="w-full border-border resize-none px-5 py-3 border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 min-h-[120px]"
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
