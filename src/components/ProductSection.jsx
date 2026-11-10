import { Heart, ShoppingBag, ArrowLeft, ArrowRight, Zap, PackageSearch } from "lucide-react";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "./CartSection";
import { useWishlist } from "./WishlistSection";
import { productsAPI, reviewsAPI } from "../services/firebase";
import { ProductCard, ProductCardSkeleton } from "./ui/ProductCard";
import { Modal } from "./ui/Modal";
import { Stars } from "./ui/Stars";
import { EmptyState } from "./ui/EmptyState";
import { Reveal } from "./ui/Reveal";
import { cn } from "../lib/utils";
import { formatCategory, formatPrice, getReviewStats } from "../lib/format";
import { optimizeImage, handleImageError } from "../lib/image";

/* ================= IMAGES FOR HERO SLIDER ================= */
import Slider1 from "../Images/image 20.jpg";
import Slider2 from "../Images/image 21.jpg";
import Slider3 from "../Images/image 4.jpg";

const EASE = [0.22, 1, 0.36, 1];

const tabs = [
  { name: "all", label: "All" },
  { name: "sale", label: "Sale" },
  { name: "hot", label: "Hot" },
  { name: "newarrivals", label: "New arrivals" },
];

const heroSlides = [
  {
    image: Slider1,
    position: "center 40%",
    eyebrow: "Limited time offer",
    title: "Mega sale",
    subtitle: "Up to 90% off",
    description: "Limited time offer on selected products",
    buttonText: "Shop Sale",
    tabName: "sale",
  },
  {
    image: Slider2,
    position: "center",
    eyebrow: "Trending now",
    title: "Hot deals",
    subtitle: "Trending now",
    description: "Most popular items flying off the shelves",
    buttonText: "Shop Hot Deals",
    tabName: "hot",
  },
  {
    image: Slider3,
    position: "center 22%",
    eyebrow: "Just launched",
    title: "New arrivals",
    subtitle: "Just landed",
    description: "Fresh stock of premium lighting equipment",
    buttonText: "Explore New",
    tabName: "newarrivals",
  },
];

/** The store's bouncing full stop after each banner line. */
const BouncyPeriod = ({ delay, className }) => (
  <span className={cn("inline-block origin-bottom animate-bouncy-period", className)} style={{ animationDelay: `${delay}s` }}>
    .
  </span>
);

/** Tag filter used by the tabs. "All" shows every product with at least one tag. */
const matchesTab = (product, tab) => {
  const t = product.tags || {};
  if (tab === "sale") return t.sale === true;
  if (tab === "hot") return t.hot === true;
  if (tab === "newarrivals") return t.newArrivals === true;
  return t.sale === true || t.hot === true || t.newArrivals === true;
};

export const ProductSection = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const gridRef = useRef(null);
  const dragStart = useRef(null);

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  // ✅ Load products from Firebase (refreshed every 30s)
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProducts(await productsAPI.getAll());
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
    const interval = setInterval(loadProducts, 30000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Load reviews from Firebase (refreshed every 30s)
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setAllReviews((await reviewsAPI.getAll()) || []);
      } catch (error) {
        console.error("Error loading reviews:", error);
        setAllReviews([]);
      }
    };
    loadReviews();
    const interval = setInterval(loadReviews, 30000);
    return () => clearInterval(interval);
  }, []);

  const go = useCallback(
    (dir) => setCurrentHeroSlide((p) => (p + dir + heroSlides.length) % heroSlides.length),
    [],
  );

  // Auto-advance (pauses only while the user is dragging, like the original)
  useEffect(() => {
    if (heroPaused) return;
    const t = setTimeout(() => go(1), 4500);
    return () => clearTimeout(t);
  }, [currentHeroSlide, heroPaused, go]);

  const onDragEnd = (x) => {
    if (dragStart.current != null) {
      const diff = dragStart.current - x;
      if (Math.abs(diff) > 50) go(diff > 0 ? 1 : -1);
    }
    dragStart.current = null;
    setHeroPaused(false);
  };

  // ✅ Filter products based on tags and category
  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          matchesTab(product, activeTab) &&
          (selectedCategory === "All" || product.category === selectedCategory),
      ),
    [products, activeTab, selectedCategory],
  );

  const scrollToGrid = () => {
    setTimeout(() => {
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    setSelectedCategory("All");
    scrollToGrid();
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setSelectedProduct(null);
  };

  const handleBuyNow = (product) => {
    addToCart(product);
    setSelectedProduct(null);
    navigate("/cart");
  };

  const slide = heroSlides[currentHeroSlide];
  const modalStats = selectedProduct ? getReviewStats(allReviews, selectedProduct.name) : null;

  return (
    <div className="relative w-full pb-20">
      {/* ================= HERO SLIDER ================= */}
      <section className="container-page pt-3 sm:pt-4" aria-roledescription="carousel" aria-label="Promotions">
        <div
          className="relative isolate h-[440px] cursor-grab select-none overflow-hidden rounded-[1.75rem] bg-ink active:cursor-grabbing sm:h-[460px] sm:rounded-[2rem] lg:h-[500px]"
          onTouchStart={(e) => {
            dragStart.current = e.touches[0].clientX;
            setHeroPaused(true);
          }}
          onTouchEnd={(e) => onDragEnd(e.changedTouches[0].clientX)}
          onMouseDown={(e) => {
            dragStart.current = e.clientX;
            setHeroPaused(true);
          }}
          onMouseUp={(e) => onDragEnd(e.clientX)}
          onMouseLeave={() => {
            dragStart.current = null;
            setHeroPaused(false);
          }}
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={currentHeroSlide}
              className="absolute inset-0 -z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            >
              <motion.img
                src={slide.image}
                alt=""
                draggable="false"
                style={{ objectPosition: slide.position }}
                className="size-full object-cover"
                initial={{ scale: 1.15 }}
                animate={{ scale: 1.02 }}
                transition={{ duration: 6.5, ease: "linear" }}
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/40 to-black/10 md:bg-gradient-to-r md:from-black/80 md:via-black/45 md:to-transparent" />

          <div className="flex h-full flex-col justify-end overflow-hidden p-6 pb-20 sm:p-10 sm:pb-24 md:justify-center lg:p-14">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentHeroSlide}
                className="max-w-xl text-white"
                exit={{ opacity: 0, transition: { duration: 0.25 } }}
              >
                <motion.p
                  className="eyebrow !text-accent"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
                >
                  <Zap size={14} className="fill-accent" /> {slide.eyebrow}
                </motion.p>
                <motion.h1
                  className="mt-4 text-5xl font-extrabold uppercase leading-[0.95] tracking-[-0.03em] sm:text-6xl lg:text-7xl"
                  initial={{ opacity: 0, x: -120, filter: "blur(8px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  transition={{ duration: 1, ease: EASE, delay: 0.2 }}
                >
                  {slide.title}
                  <BouncyPeriod delay={1.4} className="text-accent" />
                </motion.h1>
                <motion.p
                  className="mt-3 font-display text-3xl italic text-white/95 sm:text-4xl"
                  initial={{ opacity: 0, x: 120, filter: "blur(8px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  transition={{ duration: 1, ease: EASE, delay: 0.4 }}
                >
                  {slide.subtitle}
                  <BouncyPeriod delay={1.7} />
                </motion.p>
                <motion.p
                  className="mt-3 text-sm text-white/75 sm:text-base"
                  initial={{ opacity: 0, x: -80 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, ease: EASE, delay: 0.6 }}
                >
                  {slide.description}
                  <BouncyPeriod delay={2} />
                </motion.p>
                <motion.div
                  className="mt-7"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.85 }}
                  style={{ originX: 0 }}
                >
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => handleTabClick(slide.tabName)}
                    className="btn btn-light btn-lg group"
                  >
                    {slide.buttonText}
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="absolute inset-x-6 bottom-6 flex items-center justify-between sm:inset-x-10 sm:bottom-8 lg:inset-x-14">
            <div className="flex items-center gap-2">
              {heroSlides.map((s, i) => (
                <button
                  key={s.tabName}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => setCurrentHeroSlide(i)}
                  aria-label={`Show ${s.title}`}
                  aria-current={i === currentHeroSlide}
                  className={cn(
                    "relative h-2 overflow-hidden rounded-full transition-all duration-500",
                    i === currentHeroSlide ? "w-10 bg-white/35" : "w-2 bg-white/45 hover:bg-white/70",
                  )}
                >
                  {i === currentHeroSlide && (
                    <motion.span
                      key={`${currentHeroSlide}-${heroPaused}`}
                      className="absolute inset-y-0 left-0 rounded-full bg-white"
                      initial={{ width: "0%" }}
                      animate={{ width: heroPaused ? "0%" : "100%" }}
                      transition={{ duration: heroPaused ? 0 : 4.5, ease: "linear" }}
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onMouseDown={(e) => e.stopPropagation()} onClick={() => go(-1)} aria-label="Previous slide" className="btn btn-glass size-11 !p-0">
                <ArrowLeft size={18} />
              </button>
              <button onMouseDown={(e) => e.stopPropagation()} onClick={() => go(1)} aria-label="Next slide" className="btn btn-glass size-11 !p-0">
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TABS (sticky) ================= */}
      <div className="sticky top-[var(--nav-height)] z-30 mt-8 border-y bg-background/85 backdrop-blur-xl">
        <div className="container-page flex items-center justify-between gap-4 py-3">
          <div className="no-scrollbar -mx-1 flex overflow-x-auto px-1" role="tablist" aria-label="Filter products">
            <div className="flex gap-1 rounded-full bg-muted p-1">
              {tabs.map((tab) => {
                const active = activeTab === tab.name;
                return (
                  <button
                    key={tab.name}
                    role="tab"
                    aria-selected={active}
                    onClick={() => handleTabClick(tab.name)}
                    className={cn(
                      "relative inline-flex h-9 items-center whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors sm:px-5",
                      active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="products-tab"
                        className="absolute inset-0 rounded-full bg-primary shadow-[0_6px_16px_-6px_hsl(var(--primary)/0.7)]"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <p className="hidden text-sm text-muted-foreground md:block">
            {isLoading ? "Loading…" : `${filteredProducts.length} products`}
          </p>
        </div>
      </div>

      {/* ================= PRODUCT GRID ================= */}
      <section ref={gridRef} className="container-page scroll-mt-[calc(var(--nav-height)+5rem)] pt-10">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {filteredProducts.map((product, i) => (
              <Reveal key={product.id} delay={(i % 4) * 0.05} y={16}>
                <ProductCard
                  product={product}
                  onOpen={setSelectedProduct}
                  onQuickView={setSelectedProduct}
                  onAddToCart={addToCart}
                  onToggleWishlist={addToWishlist}
                  isWishlisted={isInWishlist(product.id)}
                  reviewStats={getReviewStats(allReviews, product.name)}
                  priority={i < 4}
                />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={PackageSearch}
            title="No products available right now"
            description="Please check back again later, or browse the full shop."
          >
            <Link to="/shop" className="btn btn-primary">
              Browse the shop
            </Link>
          </EmptyState>
        )}
      </section>

      {/* ================= QUICK VIEW ================= */}
      <Modal open={Boolean(selectedProduct)} onClose={() => setSelectedProduct(null)} size="xl" variant="sheet" bodyClassName="p-0 sm:p-0">
        {selectedProduct && (
          <div className="grid md:grid-cols-2">
            <div className="relative bg-muted md:rounded-l-3xl">
              {selectedProduct.discount && (
                <span className="chip absolute left-4 top-4 z-10 bg-danger text-white">{selectedProduct.discount}</span>
              )}
              <img
                src={optimizeImage(selectedProduct.image, 900)}
                alt={selectedProduct.name}
                onError={handleImageError}
                className="aspect-square w-full object-cover md:h-full md:rounded-l-3xl"
              />
            </div>

            <div className="flex flex-col p-6 sm:p-8 lg:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                {formatCategory(selectedProduct.category)}
              </p>
              <h2 className="mt-2 pr-8 text-2xl sm:text-3xl font-bold text-foreground">{selectedProduct.name}</h2>

              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Stars rating={modalStats.average} size={15} />
                <span>
                  {modalStats.count === 0
                    ? "No reviews yet"
                    : `${modalStats.average.toFixed(1)} · ${modalStats.count} ${modalStats.count === 1 ? "review" : "reviews"}`}
                </span>
              </div>

              <p className="mt-5 text-3xl font-bold tracking-tight text-foreground">
                {formatPrice(selectedProduct.price)}
              </p>

              <p className="mt-5 text-[0.9375rem] leading-relaxed text-muted-foreground line-clamp-6">
                {selectedProduct.description || "High-quality product for your needs."}
              </p>

              <div className="mt-auto pt-8">
                {selectedProduct.soldOut && (
                  <p className="mb-3 rounded-xl bg-muted px-4 py-2.5 text-sm font-medium text-muted-foreground">
                    This item is currently sold out.
                  </p>
                )}
                <div className="flex gap-2.5">
                  <button
                    onClick={() => handleAddToCart(selectedProduct)}
                    disabled={selectedProduct.soldOut}
                    className="btn btn-primary btn-lg flex-1"
                  >
                    <ShoppingBag size={18} /> Add to cart
                  </button>
                  <button
                    onClick={() => addToWishlist(selectedProduct)}
                    aria-pressed={isInWishlist(selectedProduct.id)}
                    aria-label={isInWishlist(selectedProduct.id) ? "Remove from wishlist" : "Add to wishlist"}
                    className="btn btn-outline btn-lg !px-0 w-[3.25rem]"
                  >
                    <Heart
                      size={19}
                      className={isInWishlist(selectedProduct.id) ? "fill-danger text-danger" : ""}
                    />
                  </button>
                </div>
                <button
                  onClick={() => handleBuyNow(selectedProduct)}
                  disabled={selectedProduct.soldOut}
                  className="btn btn-outline-primary btn-lg mt-2.5 w-full"
                >
                  Buy now
                </button>
                <Link
                  to={`/product/${selectedProduct.id}`}
                  onClick={() => setSelectedProduct(null)}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors"
                >
                  View full details <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
