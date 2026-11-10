import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "./CartSection";
import { useWishlist } from "./WishlistSection";
import {
  Heart,
  ArrowLeft,
  Minus,
  Plus,
  MessageSquarePlus,
  Star,
  Play,
  Truck,
  ShieldCheck,
  MessageCircle,
  ShoppingBag,
  PackageX,
  BadgeCheck,
} from "lucide-react";
import { productsAPI, reviewsAPI } from "../services/firebase";
import { Modal } from "./ui/Modal";
import { Stars } from "./ui/Stars";
import { Spinner } from "./ui/Spinner";
import { EmptyState } from "./ui/EmptyState";
import { cn } from "../lib/utils";
import { categoryNavLabel, formatCategory, formatPrice } from "../lib/format";
import { optimizeImage, handleImageError } from "../lib/image";
import { STORE_CONTACT } from "../lib/contact";

const DetailSkeleton = () => (
  <div className="container-page grid gap-10 py-10 lg:grid-cols-2 lg:gap-16" aria-busy="true">
    <div className="skeleton aspect-square rounded-3xl" />
    <div className="space-y-4 pt-4">
      <div className="skeleton h-4 w-24" />
      <div className="skeleton h-10 w-3/4" />
      <div className="skeleton h-4 w-32" />
      <div className="skeleton mt-6 h-9 w-40" />
      <div className="skeleton mt-6 h-24 w-full" />
      <div className="skeleton mt-6 h-14 w-full rounded-full" />
    </div>
  </div>
);

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, showToast } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(0);
  const carouselRef = useRef(null);

  const [reviews, setReviews] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewFormData, setReviewFormData] = useState({
    customerName: "",
    email: "",
    productName: "",
    rating: 5,
    comment: "",
  });

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const foundProduct = await productsAPI.getById(id);
        setProduct(foundProduct);
        setSelectedMedia(0);
        setQuantity(1);
        setReviewFormData((prev) => ({ ...prev, productName: foundProduct?.name || "" }));
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  useEffect(() => {
    if (!product) return;
    const loadReviews = async () => {
      try {
        const allReviews = await reviewsAPI.getAll();
        setReviews(
          allReviews.filter((r) => r.productName?.toLowerCase() === product.name.toLowerCase()),
        );
      } catch (error) {
        console.error("Error loading reviews:", error);
      }
    };
    loadReviews();
    const interval = setInterval(loadReviews, 30000);
    return () => clearInterval(interval);
  }, [product]);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const email = user?.email || user?.phone || "";
      if (email) {
        setIsSignedIn(true);
        setReviewFormData((prev) => ({
          ...prev,
          email,
          customerName: prev.customerName || user?.name || "",
        }));
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    }
  }, []);

  // Only show media that actually exists (no "empty" placeholders)
  const media = useMemo(() => {
    if (!product) return [];
    return [
      { type: "image", src: product.image, label: "Main image" },
      { type: "image", src: product.thumbnail1, label: "Image 2" },
      { type: "image", src: product.thumbnail2, label: "Image 3" },
      { type: "video", src: product.videoThumbnail, label: "Video" },
    ].filter((m) => m.src);
  }, [product]);

  // Sync the mobile swipe gallery with the dots
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    let t;
    const handleScroll = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        setSelectedMedia(Math.round(carousel.scrollLeft / carousel.offsetWidth));
      }, 60);
    };
    carousel.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      carousel.removeEventListener("scroll", handleScroll);
      clearTimeout(t);
    };
  }, [media]);

  const stats = useMemo(() => {
    if (!reviews.length) return { average: 0, count: 0 };
    return {
      count: reviews.length,
      average: reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length,
    };
  }, [reviews]);

  const soldOut = Boolean(product?.soldOut);

  const handleAddToCart = () => {
    if (product && !soldOut) {
      for (let i = 0; i < quantity; i++) addToCart(product);
    }
  };

  const handleBuyNow = () => {
    if (!product || soldOut) return;
    handleAddToCart();
    navigate("/cart");
  };

  const handleBackClick = () => {
    if (location.state?.from === "/shop") navigate("/shop");
    else if (window.history.length > 1) navigate(-1);
    else navigate("/shop");
  };

  const openReviewModal = () => {
    if (!isSignedIn) {
      showToast("Please sign in to leave a review", "error");
      sessionStorage.setItem("returnTo", location.pathname);
      navigate("/signin");
      return;
    }
    setReviewError("");
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e?.preventDefault();
    if (!isSignedIn) {
      navigate("/signin");
      return;
    }
    if (
      !reviewFormData.customerName.trim() ||
      !reviewFormData.email ||
      !reviewFormData.productName ||
      !reviewFormData.comment.trim()
    ) {
      setReviewError("Please fill in all fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      await reviewsAPI.create({
        customerName: reviewFormData.customerName,
        email: reviewFormData.email,
        productName: reviewFormData.productName,
        rating: reviewFormData.rating,
        comment: reviewFormData.comment,
        date: new Date().toISOString().split("T")[0],
        verified: true,
      });
      const allReviews = await reviewsAPI.getAll();
      setReviews(allReviews.filter((r) => r.productName?.toLowerCase() === product.name.toLowerCase()));
      setReviewFormData((prev) => ({ ...prev, rating: 5, comment: "" }));
      setShowReviewModal(false);
      showToast("Thank you for your review!", "success");
    } catch (error) {
      console.error("Error submitting review:", error);
      setReviewError(`Error saving review: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToMedia = (index) => {
    const el = carouselRef.current;
    if (el) el.scrollTo({ left: el.offsetWidth * index, behavior: "smooth" });
    setSelectedMedia(index);
  };

  if (loading) return <DetailSkeleton />;

  if (!product) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={PackageX}
          title="Product not found"
          description="The product you're looking for doesn't exist or may have been removed."
        >
          <button onClick={() => navigate("/shop")} className="btn btn-primary">
            Back to shop
          </button>
        </EmptyState>
      </div>
    );
  }

  const activeMedia = media[selectedMedia] || media[0];

  const renderMedia = (m, className, { controls = true } = {}) =>
    m?.type === "video" ? (
      <video src={m.src} controls={controls} playsInline className={className} />
    ) : (
      <img
        src={optimizeImage(m?.src, 1200)}
        alt={product.name}
        onError={handleImageError}
        draggable="false"
        className={className}
      />
    );

  return (
    <div className="pb-20">
      {/* Breadcrumbs */}
      <div className="container-page flex items-center justify-between gap-4 py-5 sm:py-6">
        <button
          onClick={handleBackClick}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={17} /> Back to shop
        </button>
        <nav aria-label="Breadcrumb" className="hidden text-sm text-muted-foreground sm:block">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2 opacity-50">/</span>
          <Link to={`/shop?category=${encodeURIComponent(product.category || "")}`} className="hover:text-foreground">
            {categoryNavLabel(product.category)}
          </Link>
          <span className="mx-2 opacity-50">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      <div className="container-page grid gap-8 lg:grid-cols-12 lg:gap-14">
        {/* ── Media ── */}
        <div className="lg:col-span-7">
          {/* Desktop gallery */}
          <div className="hidden gap-4 md:flex">
            {media.length > 1 && (
              <div className="flex w-20 shrink-0 flex-col gap-3">
                {media.map((m, index) => (
                  <button
                    key={m.label}
                    onClick={() => setSelectedMedia(index)}
                    aria-label={`Show ${m.label}`}
                    aria-current={selectedMedia === index}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-xl bg-muted ring-2 ring-offset-2 ring-offset-background transition-all",
                      selectedMedia === index ? "ring-foreground" : "ring-transparent opacity-60 hover:opacity-100",
                    )}
                  >
                    {m.type === "video" ? (
                      <>
                        <video src={m.src} className="size-full object-cover" muted />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
                          <Play size={18} className="fill-white" />
                        </span>
                      </>
                    ) : (
                      <img src={optimizeImage(m.src, 200)} alt="" className="size-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
            <div className="relative flex-1 overflow-hidden rounded-3xl bg-muted">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={selectedMedia}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="aspect-square"
                >
                  {renderMedia(activeMedia, "size-full object-cover")}
                </motion.div>
              </AnimatePresence>
              {soldOut && (
                <span className="chip absolute left-4 top-4 bg-card/90 text-foreground backdrop-blur">Sold out</span>
              )}
              {!soldOut && product.discount && (
                <span className="chip absolute left-4 top-4 bg-danger text-white">{product.discount}</span>
              )}
            </div>
          </div>

          {/* Mobile swipe gallery */}
          <div className="md:hidden -mx-4">
            <div ref={carouselRef} className="snap-rail no-scrollbar">
              {media.map((m) => (
                <div key={m.label} className="aspect-square w-full shrink-0 bg-muted">
                  {renderMedia(m, "size-full object-cover")}
                </div>
              ))}
            </div>
            {media.length > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                {media.map((m, index) => (
                  <button
                    key={m.label}
                    onClick={() => scrollToMedia(index)}
                    aria-label={`Go to ${m.label}`}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      selectedMedia === index ? "w-7 bg-foreground" : "w-1.5 bg-foreground/25",
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Info ── */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--nav-height)+1.5rem)]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              {formatCategory(product.category)}
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground">{product.name}</h1>

            <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <Stars rating={stats.average} size={15} />
              <span className="link-underline">
                {stats.count === 0 ? "No reviews yet" : `${stats.count} ${stats.count === 1 ? "review" : "reviews"}`}
              </span>
            </a>

            <p className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              {formatPrice(product.price)}
            </p>

            {product.description && (
              <div className="mt-6 border-t pt-6">
                <h2 className="mb-2 text-sm font-bold text-foreground">Product description</h2>
                <p className="whitespace-pre-line text-[0.9375rem] leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mt-6 border-t pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Quantity</span>
                <span className="text-sm text-muted-foreground">
                  Total: <span className="font-semibold text-foreground">{formatPrice(product.price * quantity)}</span>
                </span>
              </div>
              <div className="mt-3 inline-flex items-center rounded-full border bg-card p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="icon-btn disabled:opacity-40"
                >
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center font-semibold tabular-nums" aria-live="polite">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  disabled={quantity >= 10}
                  aria-label="Increase quantity"
                  className="icon-btn disabled:opacity-40"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {soldOut && (
              <p className="mt-6 rounded-xl bg-muted px-4 py-3 text-sm font-medium text-muted-foreground">
                This item is currently sold out. Chat with us on WhatsApp to ask about restocks.
              </p>
            )}

            <div className="mt-6 flex gap-2.5">
              <button onClick={handleAddToCart} disabled={soldOut} className="btn btn-primary btn-lg flex-1">
                <ShoppingBag size={18} /> Add to cart
              </button>
              <button
                onClick={() => addToWishlist(product)}
                aria-pressed={isInWishlist(product.id)}
                aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                className={cn(
                  "btn btn-outline btn-lg w-[3.25rem] !px-0",
                  isInWishlist(product.id) && "border-danger/40 bg-danger/5",
                )}
              >
                <Heart size={19} className={isInWishlist(product.id) ? "fill-danger text-danger" : ""} />
              </button>
            </div>
            <button onClick={handleBuyNow} disabled={soldOut} className="btn btn-outline-primary btn-lg mt-2.5 w-full">
              Buy now
            </button>

            <ul className="mt-8 divide-y rounded-2xl border bg-card text-sm">
              {[
                { icon: Truck, title: "Nationwide delivery", text: "Doorstep or park pickup · 2–5 days" },
                { icon: ShieldCheck, title: "Secure checkout", text: "Payments protected by Paystack" },
                {
                  icon: MessageCircle,
                  title: "Questions about this item?",
                  text: "Chat with us on WhatsApp",
                  href: STORE_CONTACT.whatsappHref,
                },
              ].map(({ icon: Icon, title, text, href }) => {
                const content = (
                  <>
                    <Icon size={19} className="shrink-0 text-primary" />
                    <span>
                      <span className="block font-semibold text-foreground">{title}</span>
                      <span className="block text-muted-foreground">{text}</span>
                    </span>
                  </>
                );
                return (
                  <li key={title}>
                    {href ? (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 px-5 py-4 hover:bg-muted/60 transition-colors">
                        {content}
                      </a>
                    ) : (
                      <div className="flex items-center gap-4 px-5 py-4">{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Reviews ── */}
      <section id="reviews" className="container-page mt-20 scroll-mt-[calc(var(--nav-height)+1.5rem)] border-t pt-14">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow mb-3">Reviews</p>
            <h2 className="text-2xl sm:text-3xl font-bold">Customer reviews</h2>
            {stats.count > 0 && (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-2xl font-bold tabular-nums">{stats.average.toFixed(1)}</span>
                <Stars rating={stats.average} size={17} />
                <span className="text-sm text-muted-foreground">
                  {stats.count} {stats.count === 1 ? "review" : "reviews"}
                </span>
              </div>
            )}
          </div>
          <button onClick={openReviewModal} className="btn btn-outline">
            <MessageSquarePlus size={17} /> Write a review
          </button>
        </div>

        {reviews.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed px-6 py-10 text-center text-muted-foreground">
            No reviews yet — be the first to share your experience with this product.
          </p>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {reviews.map((r) => (
              <article key={r.id} className="surface-card p-6">
                <div className="flex items-center justify-between gap-3">
                  <Stars rating={Number(r.rating) || 0} size={15} />
                  {r.date && <time className="text-xs text-muted-foreground">{r.date}</time>}
                </div>
                <p className="mt-4 leading-relaxed text-foreground/90">“{r.comment}”</p>
                <p className="mt-5 flex items-center gap-1.5 text-sm font-semibold">
                  {r.customerName}
                  {r.verified && <BadgeCheck size={15} className="text-primary" aria-label="Verified" />}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ── Review modal ── */}
      <Modal
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        variant="sheet"
        size="md"
        title="Write a review"
        description={`Share your experience with ${product.name}.`}
      >
        <form onSubmit={handleReviewSubmit} className="mt-6 space-y-5">
          <div>
            <span className="field-label">Your rating</span>
            <div className="flex gap-1.5" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  role="radio"
                  aria-checked={reviewFormData.rating === star}
                  aria-label={`${star} star${star > 1 ? "s" : ""}`}
                  onClick={() => setReviewFormData({ ...reviewFormData, rating: star })}
                  className="rounded-md p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    size={30}
                    className={
                      star <= reviewFormData.rating ? "fill-accent text-accent" : "fill-foreground/10 text-foreground/20"
                    }
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="review-name" className="field-label">
              Your name
            </label>
            <input
              id="review-name"
              type="text"
              value={reviewFormData.customerName}
              onChange={(e) => setReviewFormData({ ...reviewFormData, customerName: e.target.value })}
              className="input"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="review-email" className="field-label">
              Email
            </label>
            <input id="review-email" type="email" value={reviewFormData.email} className="input" disabled readOnly />
          </div>
          <div>
            <label htmlFor="review-comment" className="field-label">
              Your review
            </label>
            <textarea
              id="review-comment"
              value={reviewFormData.comment}
              onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
              className="input min-h-[130px]"
              placeholder="What did you like? How are you using it?"
            />
          </div>
          {reviewError && (
            <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
              {reviewError}
            </p>
          )}
          <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg w-full">
            {isSubmitting ? (
              <>
                <Spinner size={18} /> Submitting…
              </>
            ) : (
              "Submit review"
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
};
