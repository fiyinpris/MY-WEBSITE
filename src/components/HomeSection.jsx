import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Send,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Truck,
  ShieldCheck,
  CalendarClock,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Quote,
  CheckCircle2,
  AlertCircle,
  BadgeCheck,
} from "lucide-react";
import { reviewsAPI, productsAPI } from "../services/firebase";
import { useCart } from "./CartSection";
import { useWishlist } from "./WishlistSection";
import { ProductCard, ProductCardSkeleton } from "./ui/ProductCard";
import { AutoScrollCarousel } from "./ui/AutoScrollCarousel";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "./ui/Reveal";
import { Stars } from "./ui/Stars";
import { Spinner } from "./ui/Spinner";
import { Modal } from "./ui/Modal";
import { cn } from "../lib/utils";
import { PRODUCT_CATEGORIES, categoryNavLabel, getReviewStats } from "../lib/format";
import { optimizeImage, handleImageError } from "../lib/image";
import { STORE_CONTACT, sendContactMessage } from "../lib/contact";

// Hero images
import heroImage1 from "../Images/image 7.jpg";
import heroImage2 from "../Images/image 16.jpg";
import heroImage3 from "../Images/image 15.jpg";
import creatorImage from "../Images/image 9.jpg";

// Fallback product images (used only if the product database is unavailable)
import ringlight from "../Images/image R.jpeg";
import tripodStand from "../Images/image T.jpeg";
import ledLight from "../Images/image L.jpeg";
import softbox from "../Images/image S.jpeg";
import Microphone from "../Images/image M.jpeg";
import Ringlight from "../Images/image R1.jpeg";

const ADMIN_EMAIL = "fiyinolaleke@gmail.com";
const EASE = [0.22, 1, 0.36, 1];
const SLIDE_DURATION = 5000;

const defaultProducts = [
  { id: 1, name: "Ringlight", category: "RINGLIGHT", price: 25000, rating: 4.5, image: Ringlight, badge: "Bestseller", bestSelling: true },
  { id: 2, name: "LED Light", category: "LED LIGHT", price: 30000, rating: 4.6, image: ledLight, badge: "Hot", bestSelling: true },
  { id: 3, name: "Tripod Stand", category: "TRIPOD STAND", price: 20000, rating: 4.8, image: tripodStand, badge: "Bestseller", bestSelling: true },
  { id: 4, name: "Softbox", category: "SOFTBOX", price: 40000, rating: 4.9, image: softbox, badge: "Hot", bestSelling: true },
  { id: 5, name: "Microphone", category: "MICROPHONE", price: 18000, rating: 4.7, image: Microphone, badge: "New", bestSelling: true },
  { id: 6, name: "Ringlight", category: "RINGLIGHT", price: 35000, rating: 4.5, image: ringlight, badge: "Bestseller", bestSelling: true },
];

const heroSlides = [
  {
    image: heroImage1,
    eyebrow: "Studio lighting & creator gear",
    title: (
      <>
        Light that makes <span className="font-display font-normal italic">every frame</span> shine.
      </>
    ),
    subtitle:
      "Professional ringlights, LED panels, softboxes and tripods — curated for creators, studios and growing brands.",
    secondary: { label: "Connect with me", action: "contact" },
  },
  {
    image: heroImage2,
    eyebrow: "Build your setup",
    title: (
      <>
        Your studio, <span className="font-display font-normal italic">upgraded.</span>
      </>
    ),
    subtitle: "From tripods and microphones to backdrops and softboxes — everything you need to create, in one place.",
    secondary: { label: "Get Started", action: "signin" },
  },
  {
    image: heroImage3,
    eyebrow: "On camera, on stream, on every call",
    title: (
      <>
        Bright ideas start with <span className="font-display font-normal italic">great light.</span>
      </>
    ),
    subtitle: "Flattering, adjustable light for content, live streams, video calls and product photography.",
    secondary: { label: "Explore Now", action: "products" },
  },
];

const valueProps = [
  { icon: Truck, title: "Nationwide delivery", text: "Doorstep or park pickup in all 36 states + FCT" },
  { icon: CalendarClock, title: "Delivered in 2–5 days", text: "Estimated delivery time across Nigeria" },
  { icon: ShieldCheck, title: "Secure checkout", text: "Card, transfer, USSD & bank via Paystack" },
  { icon: MessageCircle, title: "Real human support", text: "Chat with our team on WhatsApp" },
];

const dedupeById = (list) => {
  const seen = new Set();
  return list.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
};

/* ========================================================================== */
/*  HERO — editorial layout, always moving                                    */
/* ========================================================================== */
const Hero = ({ onAction }) => {
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef(null);
  const navigate = useNavigate();

  const go = useCallback((dir) => setCurrent((c) => (c + dir + heroSlides.length) % heroSlides.length), []);

  // Auto-advance continuously — pauses only while the user is dragging
  useEffect(() => {
    if (isDragging) return;
    const t = setTimeout(() => go(1), SLIDE_DURATION);
    return () => clearTimeout(t);
  }, [current, isDragging, go]);

  useEffect(() => {
    heroSlides.forEach((s) => {
      const img = new Image();
      img.src = s.image;
    });
  }, []);

  const onDragStart = (x) => {
    dragStart.current = x;
    setIsDragging(true);
  };
  const onDragEnd = (x) => {
    if (dragStart.current != null) {
      const diff = dragStart.current - x;
      if (Math.abs(diff) > 50) go(diff > 0 ? 1 : -1);
    }
    dragStart.current = null;
    setIsDragging(false);
  };

  const slide = heroSlides[current];
  const drift = current % 2 === 0 ? ["-1.5%", "1.5%"] : ["1.5%", "-1.5%"];
  const stop = (e) => e.stopPropagation();

  return (
    <section aria-roledescription="carousel" aria-label="Featured" className="container-page pt-3 sm:pt-4">
      <div
        className="relative isolate h-[78svh] min-h-[540px] max-h-[820px] cursor-grab select-none overflow-hidden rounded-[1.75rem] bg-ink active:cursor-grabbing sm:rounded-[2rem]"
        onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
        onTouchEnd={(e) => onDragEnd(e.changedTouches[0].clientX)}
        onMouseDown={(e) => onDragStart(e.clientX)}
        onMouseUp={(e) => onDragEnd(e.clientX)}
        onMouseLeave={() => {
          dragStart.current = null;
          setIsDragging(false);
        }}
      >
        {/* Background: cross-fade + continuous slow zoom & drift */}
        <AnimatePresence initial={false}>
          <motion.div
            key={current}
            className="absolute inset-0 -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.3, ease: "easeInOut" }}
          >
            <motion.img
              src={slide.image}
              alt=""
              draggable="false"
              fetchpriority={current === 0 ? "high" : "auto"}
              className="size-full object-cover"
              initial={{ scale: 1.16, x: drift[0] }}
              animate={{ scale: 1.03, x: drift[1] }}
              transition={{ duration: SLIDE_DURATION / 1000 + 1.6, ease: "linear" }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Legibility gradients */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/85 via-ink/35 to-ink/10 lg:bg-gradient-to-r lg:from-ink/80 lg:via-ink/45 lg:to-ink/0" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-ink/50 to-transparent" />

        {/* Copy */}
        <div className="flex h-full flex-col justify-end p-6 pb-24 sm:p-10 sm:pb-28 lg:justify-center lg:p-16 lg:pb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              className="max-w-2xl text-white"
              exit={{ opacity: 0, y: -10, transition: { duration: 0.3 } }}
            >
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide backdrop-blur-md"
              >
                <span className="size-1.5 rounded-full bg-accent shadow-[0_0_10px_3px] shadow-accent/70 animate-pulse-subtle" />
                {slide.eyebrow}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, scale: 1.12, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
                style={{ originX: 0 }}
                className="text-[2.6rem] font-bold leading-[1.02] tracking-[-0.035em] sm:text-6xl lg:text-7xl xl:text-[5.25rem]"
              >
                {slide.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.45 }}
                className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg"
              >
                {slide.subtitle}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.7 }}
                className="mt-8 flex flex-wrap items-center gap-3"
              >
                <button onMouseDown={stop} onClick={() => navigate("/shop")} className="btn btn-light btn-lg group">
                  Shop now
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <button onMouseDown={stop} onClick={() => onAction(slide.secondary.action)} className="btn btn-glass btn-lg">
                  {slide.secondary.label}
                </button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="absolute inset-x-6 bottom-6 flex items-center justify-between gap-6 sm:inset-x-10 sm:bottom-8 lg:inset-x-16 lg:bottom-10">
          <div className="flex max-w-xs flex-1 items-center gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onMouseDown={stop}
                onClick={() => setCurrent(i)}
                aria-label={`Show slide ${i + 1}`}
                aria-current={i === current}
                className="group relative h-6 flex-1"
              >
                <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/25 transition-colors group-hover:bg-white/40">
                  {i === current && (
                    <motion.span
                      key={`${current}-${isDragging}`}
                      className="absolute inset-y-0 left-0 rounded-full bg-white"
                      initial={{ width: "0%" }}
                      animate={{ width: isDragging ? "0%" : "100%" }}
                      transition={{ duration: isDragging ? 0 : SLIDE_DURATION / 1000, ease: "linear" }}
                    />
                  )}
                  {i < current && <span className="absolute inset-0 rounded-full bg-white/70" />}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="mr-2 hidden text-sm font-medium tabular-nums text-white/70 sm:inline">
              {String(current + 1).padStart(2, "0")} / {String(heroSlides.length).padStart(2, "0")}
            </span>
            <button onMouseDown={stop} onClick={() => go(-1)} aria-label="Previous slide" className="btn btn-glass size-11 !p-0">
              <ArrowLeft size={18} />
            </button>
            <button onMouseDown={stop} onClick={() => go(1)} aria-label="Next slide" className="btn btn-glass size-11 !p-0">
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ========================================================================== */
/*  HOME                                                                      */
/* ========================================================================== */
export const HomeSection = () => {
  const navigate = useNavigate();
  const { addToCart, showToast } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [currentReview, setCurrentReview] = useState(0);
  const [reviewDirection, setReviewDirection] = useState(1);
  const [reviewsPaused, setReviewsPaused] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({ name: "", email: "", contactnumber: "", message: "" });
  const [isSending, setIsSending] = useState(false);
  const [formStatus, setFormStatus] = useState(null);

  // ✅ Load products once — deduplicate by id to prevent double-rendering
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const firebaseProducts = await productsAPI.getAll();
        setProducts(firebaseProducts?.length ? dedupeById(firebaseProducts) : defaultProducts);
      } catch (error) {
        console.error("Error loading products:", error);
        setProducts(defaultProducts);
      } finally {
        setProductsLoading(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const firebaseReviews = await reviewsAPI.getAll();
        setReviews(firebaseReviews?.length ? firebaseReviews : []);
      } catch (error) {
        console.error("Error loading reviews:", error);
        setReviews([]);
      }
    };
    loadReviews();
    const interval = setInterval(loadReviews, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        const email = user?.email || user?.phone || "";
        setIsSignedIn(Boolean(email));
        setUserEmail(email);
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    };
    checkAuth();
    window.addEventListener("userUpdated", checkAuth);
    return () => window.removeEventListener("userUpdated", checkAuth);
  }, []);

  useEffect(() => {
    if (currentReview >= reviews.length && reviews.length > 0) setCurrentReview(0);
  }, [reviews, currentReview]);

  const changeReview = useCallback(
    (dir) => {
      if (!reviews.length) return;
      setReviewDirection(dir);
      setCurrentReview((prev) => (prev + dir + reviews.length) % reviews.length);
    },
    [reviews.length],
  );

  // Testimonials rotate on their own (paused on hover)
  useEffect(() => {
    if (reviews.length < 2 || reviewsPaused) return;
    const t = setTimeout(() => changeReview(1), 7000);
    return () => clearTimeout(t);
  }, [currentReview, reviews.length, reviewsPaused, changeReview]);

  const bestSellingProducts = useMemo(
    () => dedupeById(products.filter((p) => p.bestSelling === true)).slice(0, 15),
    [products],
  );

  const categories = useMemo(
    () =>
      PRODUCT_CATEGORIES.map((category) => {
        const inCategory = products.filter((p) => p.category === category);
        if (!inCategory.length) return null;
        const cover = inCategory.find((p) => p.bestSelling) || inCategory[0];
        return { category, count: inCategory.length, image: cover.image };
      }).filter(Boolean),
    [products],
  );

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length;
  }, [reviews]);

  const scrollToContact = () =>
    document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleAction = (action) => {
    if (action === "contact") scrollToContact();
    else if (action === "signin") navigate("/signin");
    else if (action === "products") navigate("/products");
    else navigate("/shop");
  };

  const openProduct = (product) => {
    // Fallback demo products are not in the database — send shoppers to the shop instead.
    if (typeof product.id === "number") navigate("/shop");
    else navigate(`/product/${product.id}`);
  };

  const canDeleteReview = (review) => isSignedIn && (review.email === userEmail || userEmail === ADMIN_EMAIL);

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    const isAdmin = userEmail === ADMIN_EMAIL;
    if (reviewToDelete.email !== userEmail && !isAdmin) {
      showToast("You can only delete your own reviews", "error");
      setReviewToDelete(null);
      return;
    }
    setIsDeleting(true);
    try {
      await reviewsAPI.delete(reviewToDelete.id);
      const updatedReviews = await reviewsAPI.getAll();
      setReviews(updatedReviews || []);
      setCurrentReview(0);
      showToast("Review deleted", "success");
    } catch (error) {
      console.error("Error deleting review:", error);
      showToast(`Error deleting review: ${error.message}`, "error");
    } finally {
      setIsDeleting(false);
      setReviewToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus(null);
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setFormStatus({ type: "error", text: "Please fill in your name, email and message." });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setFormStatus({ type: "error", text: "Please enter a valid email address." });
      return;
    }
    setIsSending(true);
    try {
      await sendContactMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.contactnumber,
        message: formData.message,
      });
      setFormStatus({ type: "success", text: "Message sent! We'll get back to you soon." });
      setFormData({ name: "", email: "", contactnumber: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
      setFormStatus({
        type: "error",
        text: `Failed to send message. Please try again or email us at ${STORE_CONTACT.email}`,
      });
    } finally {
      setIsSending(false);
    }
  };

  const review = reviews[currentReview];
  const reviewProduct = review
    ? products.find((p) => p.name?.toLowerCase() === review.productName?.toLowerCase() && typeof p.id !== "number")
    : null;

  return (
    <div className="relative w-full overflow-x-clip">
      <Hero onAction={handleAction} />

      {/* ── VALUE PROPS (floating card) ── */}
      <section aria-label="Why shop with us" className="container-page relative z-10 mt-5 sm:mt-6">
        <RevealGroup className="grid grid-cols-2 gap-x-4 gap-y-6 rounded-3xl border bg-card/95 p-5 shadow-soft backdrop-blur sm:p-7 lg:grid-cols-4 lg:gap-8">
          {valueProps.map(({ icon: Icon, title, text }) => (
            <RevealItem key={title} className="group flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon size={20} strokeWidth={1.9} />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground sm:text-[0.9375rem]">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">{text}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ── SHOP BY CATEGORY ── */}
      {(productsLoading || categories.length > 0) && (
        <section className="container-page py-16 sm:py-24" aria-labelledby="categories-heading">
          <Reveal>
            <SectionHeading
              eyebrow="Shop by category"
              title={
                <span id="categories-heading">
                  Find the right gear for <span className="font-display font-normal italic text-primary">your setup</span>
                </span>
              }
              action={
                <Link to="/shop" className="btn btn-outline group">
                  Shop all
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              }
            />
          </Reveal>

          <div className="-mx-4 mt-10 px-4 sm:mx-0 sm:px-0">
            <RevealGroup className="snap-rail no-scrollbar gap-3 sm:gap-5 lg:grid lg:grid-cols-5 lg:overflow-visible">
              {productsLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton aspect-[3/4] w-[42%] shrink-0 rounded-3xl sm:w-[30%] lg:w-auto" />
                  ))
                : categories.map(({ category, count, image }) => (
                    <RevealItem key={category} className="w-[42%] shrink-0 sm:w-[30%] lg:w-auto">
                      <Link
                        to={`/shop?category=${encodeURIComponent(category)}`}
                        className="group relative block aspect-[3/4] overflow-hidden rounded-3xl bg-muted transition-[transform,box-shadow] duration-500 hover:-translate-y-1.5 hover:shadow-[0_22px_44px_-18px_hsl(var(--primary)/0.5)]"
                      >
                        <img
                          src={optimizeImage(image, 520)}
                          alt=""
                          loading="lazy"
                          onError={handleImageError}
                          className="absolute inset-0 size-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent transition-colors duration-500 group-hover:from-[hsl(350_24%_24%/0.8)]" />
                        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 sm:p-5">
                          <div>
                            <p className="text-base font-semibold leading-tight text-white sm:text-lg">
                              {categoryNavLabel(category)}
                            </p>
                            <p className="mt-0.5 text-xs text-white/70">
                              {count} {count === 1 ? "product" : "products"}
                            </p>
                          </div>
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-all duration-300 group-hover:rotate-[-45deg] group-hover:bg-white group-hover:text-foreground">
                            <ArrowRight size={16} />
                          </span>
                        </div>
                      </Link>
                    </RevealItem>
                  ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* ── BEST SELLERS — auto-scrolling carousel ── */}
      <section id="products" className="bg-surface py-16 sm:py-24" aria-labelledby="bestsellers-heading">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              eyebrow="Best sellers"
              title={
                <span id="bestsellers-heading">
                  Loved by <span className="font-display font-normal italic text-primary">creators</span>
                </span>
              }
              description="Our most popular and highly-rated products, chosen by you."
              action={
                <Link to="/shop" className="btn btn-dark group">
                  View all products
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              }
            />
          </Reveal>
        </div>

        <Reveal className="mx-auto mt-10 max-w-[1920px] sm:mt-12" y={40}>
          {productsLoading ? (
            <div className="flex gap-4 overflow-hidden px-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-[200px] shrink-0 sm:w-[240px] lg:w-[260px]">
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          ) : bestSellingProducts.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No best-selling products selected yet.</p>
          ) : (
            <AutoScrollCarousel
              ariaLabel="Best selling products"
              items={bestSellingProducts}
              itemClassName="w-[200px] sm:w-[240px] lg:w-[260px] xl:w-[272px]"
              renderItem={(p) => (
                <ProductCard
                  product={p}
                  onOpen={openProduct}
                  onAddToCart={addToCart}
                  onToggleWishlist={typeof p.id === "number" ? undefined : addToWishlist}
                  isWishlisted={isInWishlist(p.id)}
                  reviewStats={getReviewStats(reviews, p.name)}
                />
              )}
            />
          )}
        </Reveal>
      </section>

      {/* ── CREATOR CTA ── */}
      <section className="container-page py-16 sm:py-24">
        <Reveal scale={0.97} y={30}>
          <div className="group/cta grain relative isolate grid overflow-hidden rounded-[2rem] bg-ink text-ink-foreground lg:grid-cols-2">
            <div aria-hidden="true" className="absolute -left-24 -top-24 -z-10 size-96 rounded-full bg-primary/30 blur-[100px] animate-float-slow" />
            <div aria-hidden="true" className="absolute bottom-0 left-1/3 -z-10 size-64 rounded-full bg-accent/15 blur-[90px] animate-float" />
            <div className="relative z-10 flex flex-col justify-center p-8 sm:p-12 lg:p-16">
              <p className="eyebrow !text-accent">For creators</p>
              <h2 className="mt-4 text-3xl font-bold text-white sm:text-5xl">
                Ready to <span className="font-display font-normal italic">elevate</span> your content?
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-ink-foreground/70 sm:text-lg">
                Join thousands of creators who trust us for professional lighting equipment. Get exclusive deals,
                expert tips, and priority support.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/shop" className="btn btn-primary btn-lg">
                  Browse products
                </Link>
                <button onClick={scrollToContact} className="btn btn-glass btn-lg">
                  Get in touch
                </button>
              </div>
            </div>
            <div className="relative min-h-[320px] overflow-hidden lg:min-h-[520px]">
              <img
                src={creatorImage}
                alt="Creator filming with a ringlight"
                loading="lazy"
                className="absolute inset-0 size-full object-cover object-[center_30%] transition-transform duration-[2000ms] ease-[var(--ease-out-expo)] group-hover/cta:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent lg:bg-gradient-to-r lg:from-ink lg:via-ink/10" />
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── REVIEWS ── */}
      <section id="reviews" className="relative overflow-hidden border-y bg-surface py-16 sm:py-24" aria-labelledby="reviews-heading">
        <div aria-hidden="true" className="absolute -right-24 top-10 size-80 rounded-full bg-primary/10 blur-3xl animate-float-slow" />
        <div className="container-page relative grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow mb-3">Reviews</p>
            <h2 id="reviews-heading" className="text-[1.75rem] font-bold text-foreground sm:text-4xl">
              What our <span className="font-display font-normal italic text-primary">customers</span> say
            </h2>
            {reviews.length > 0 && (
              <>
                <div className="mt-8 flex items-end gap-4">
                  <span className="text-6xl font-bold tabular-nums tracking-tight text-foreground">{averageRating.toFixed(1)}</span>
                  <div className="pb-2">
                    <Stars rating={averageRating} size={18} />
                    <p className="mt-1 text-sm text-muted-foreground">
                      Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                    </p>
                  </div>
                </div>
                <div className="mt-8 flex items-center gap-2">
                  <button onClick={() => changeReview(-1)} aria-label="Previous review" className="btn btn-outline size-11 !p-0">
                    <ArrowLeft size={18} />
                  </button>
                  <button onClick={() => changeReview(1)} aria-label="Next review" className="btn btn-outline size-11 !p-0">
                    <ArrowRight size={18} />
                  </button>
                  <span className="ml-3 text-sm tabular-nums text-muted-foreground">
                    {currentReview + 1} / {reviews.length}
                  </span>
                </div>
              </>
            )}
          </Reveal>

          <Reveal className="lg:col-span-8" delay={0.1}>
            {reviews.length === 0 ? (
              <div className="surface-card flex h-full flex-col items-center justify-center p-10 text-center">
                <Quote size={36} className="text-primary/40" />
                <h3 className="mt-4 text-xl font-bold">No reviews yet</h3>
                <p className="mt-2 max-w-sm text-muted-foreground">
                  Be the first to share your experience on the product detail page!
                </p>
                <Link to="/shop" className="btn btn-primary mt-6">
                  Shop now
                </Link>
              </div>
            ) : (
              <div
                className="relative min-h-[320px] overflow-hidden rounded-[1.75rem] border bg-card p-7 shadow-card sm:p-10"
                onMouseEnter={() => setReviewsPaused(true)}
                onMouseLeave={() => setReviewsPaused(false)}
              >
                <Quote aria-hidden="true" className="absolute right-8 top-8 size-16 text-primary/10 sm:size-24" strokeWidth={1.2} />
                <AnimatePresence mode="wait">
                  {review && (
                    <motion.figure
                      key={review.id || currentReview}
                      initial={{ opacity: 0, x: reviewDirection * 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: reviewDirection * -40 }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className="relative flex h-full flex-col"
                    >
                      <Stars rating={Number(review.rating) || 0} size={18} />
                      <blockquote className="mt-6 text-xl font-medium leading-snug tracking-tight text-foreground sm:text-2xl lg:text-[1.65rem]">
                        “{review.comment}”
                      </blockquote>
                      <figcaption className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
                        <div className="flex items-center gap-3">
                          <motion.span
                            initial={{ scale: 0.5, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}
                            className="flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground ring-2 ring-accent/60 ring-offset-2 ring-offset-card"
                          >
                            {(review.customerName || review.email || "U").charAt(0).toUpperCase()}
                          </motion.span>
                          <div>
                            <p className="flex items-center gap-1.5 font-semibold text-foreground">
                              {review.customerName}
                              {review.verified && <BadgeCheck size={16} className="text-primary" aria-label="Verified buyer" />}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {reviewProduct ? (
                                <Link to={`/product/${reviewProduct.id}`} className="link-underline hover:text-primary">
                                  {review.productName}
                                </Link>
                              ) : (
                                review.productName
                              )}
                            </p>
                          </div>
                        </div>
                        {canDeleteReview(review) && (
                          <button
                            onClick={() => setReviewToDelete(review)}
                            className="btn btn-danger-soft btn-sm"
                            title={userEmail === ADMIN_EMAIL ? "Delete review (Admin)" : "Delete my review"}
                          >
                            <Trash2 size={15} /> Delete
                          </button>
                        )}
                      </figcaption>
                    </motion.figure>
                  )}
                </AnimatePresence>
                {/* auto-rotation progress */}
                {reviews.length > 1 && (
                  <div className="absolute inset-x-0 bottom-0 h-[3px] bg-muted">
                    <motion.div
                      key={`${currentReview}-${reviewsPaused}`}
                      className="h-full bg-primary/60"
                      initial={{ width: "0%" }}
                      animate={{ width: reviewsPaused ? "0%" : "100%" }}
                      transition={{ duration: reviewsPaused ? 0 : 7, ease: "linear" }}
                    />
                  </div>
                )}
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact-section" className="container-page py-16 sm:py-24" aria-labelledby="contact-heading">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow mb-3">Contact us</p>
            <h2 id="contact-heading" className="text-[1.75rem] font-bold text-foreground sm:text-4xl">
              Have a question? We'd <span className="font-display font-normal italic text-primary">love</span> to hear
              from you.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Questions, ideas or feedback about our lighting products — our team is happy to help you find the right
              setup.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                { icon: Mail, label: "Email", value: STORE_CONTACT.email, href: `mailto:${STORE_CONTACT.email}` },
                { icon: Phone, label: "Phone", value: STORE_CONTACT.phoneDisplay, href: STORE_CONTACT.phoneHref },
                { icon: MessageCircle, label: "WhatsApp", value: STORE_CONTACT.whatsappDisplay, href: STORE_CONTACT.whatsappHref },
                { icon: MapPin, label: "Location", value: STORE_CONTACT.location },
              ].map(({ icon: Icon, label, value, href }) => {
                const inner = (
                  <>
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary transition-transform duration-300 group-hover:scale-110">
                      <Icon size={19} />
                    </span>
                    <span>
                      <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
                      <span className="block font-medium text-foreground">{value}</span>
                    </span>
                  </>
                );
                return (
                  <li key={label}>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="group -m-2 flex items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-muted"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div className="group -m-2 flex items-center gap-4 p-2">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Reveal>

          <Reveal className="lg:col-span-7" delay={0.1} x={30} y={0}>
            <form onSubmit={handleSubmit} noValidate className="surface-card space-y-5 p-6 sm:p-8 lg:p-10">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="home-name" className="field-label">Your name</label>
                  <input
                    id="home-name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="home-email" className="field-label">Email</label>
                  <input
                    id="home-email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="input"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="home-phone" className="field-label">
                  Phone number <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="home-phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.contactnumber}
                  onChange={(e) => setFormData({ ...formData, contactnumber: e.target.value })}
                  placeholder="080X XXX XXXX"
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="home-message" className="field-label">Message</label>
                <textarea
                  id="home-message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us what you're working on…"
                  rows={5}
                  className="input min-h-[150px]"
                  required
                />
              </div>

              <AnimatePresence>
                {formStatus && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    role={formStatus.type === "error" ? "alert" : "status"}
                    className={cn(
                      "flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-medium",
                      formStatus.type === "success" ? "bg-primary-soft text-primary" : "bg-danger/10 text-danger",
                    )}
                  >
                    {formStatus.type === "success" ? (
                      <CheckCircle2 size={18} className="mt-px shrink-0" />
                    ) : (
                      <AlertCircle size={18} className="mt-px shrink-0" />
                    )}
                    {formStatus.text}
                  </motion.p>
                )}
              </AnimatePresence>

              <button type="submit" disabled={isSending} className="btn btn-primary btn-lg w-full">
                {isSending ? (
                  <>
                    <Spinner size={18} /> Sending…
                  </>
                ) : (
                  <>
                    Send message <Send size={17} />
                  </>
                )}
              </button>
            </form>
          </Reveal>
        </div>
      </section>

      {/* Delete review confirmation */}
      <Modal
        open={Boolean(reviewToDelete)}
        onClose={() => !isDeleting && setReviewToDelete(null)}
        size="sm"
        title="Delete this review?"
        description="This review will be permanently removed and can't be recovered."
      >
        <div className="mt-6 flex gap-3">
          <button onClick={() => setReviewToDelete(null)} disabled={isDeleting} className="btn btn-outline flex-1">
            Cancel
          </button>
          <button onClick={confirmDeleteReview} disabled={isDeleting} className="btn flex-1 bg-danger text-white hover:bg-danger/90">
            {isDeleting ? <Spinner size={16} /> : <Trash2 size={16} />} Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default HomeSection;
