import { Heart, Plus, Eye } from "lucide-react";
import { cn } from "../../lib/utils";
import { formatCategory, formatPrice } from "../../lib/format";
import { optimizeImage, handleImageError } from "../../lib/image";
import { Stars } from "./Stars";

const canHover =
  typeof window !== "undefined" && window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;

/** Pick the single most useful merchandising label for a product. */
const getLabel = (product) => {
  if (product.soldOut) return { text: "Sold out", tone: "muted" };
  if (product.discount) return { text: product.discount, tone: "sale" };
  if (product.badge) return { text: product.badge, tone: "dark" };
  if (product.tags?.newArrivals) return { text: "New", tone: "dark" };
  if (product.tags?.sale) return { text: "Sale", tone: "sale" };
  if (product.tags?.hot) return { text: "Hot", tone: "accent" };
  return null;
};

const labelTone = {
  sale: "bg-danger text-white",
  dark: "bg-foreground text-background",
  accent: "bg-accent text-[hsl(30_60%_14%)]",
  muted: "bg-card/90 text-foreground backdrop-blur",
};

/**
 * Product card shared by Home, Our Products, Shop and Search:
 * editorial layout (image tile + clean details) with hover lift, zoom,
 * second-photo swap, a gently bobbing label and a liquid "Add" button.
 */
export const ProductCard = ({
  product,
  onOpen,
  onQuickView,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
  reviewStats,
  priority = false,
  className,
}) => {
  const label = getLabel(product);
  const hoverImage = canHover && product.thumbnail1 ? product.thumbnail1 : null;
  const soldOut = Boolean(product.soldOut);

  return (
    <article className={cn("group relative flex h-full flex-col", className)}>
      <div
        className={cn(
          "relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted ring-1 ring-inset ring-foreground/5",
          "transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)]",
          "group-hover:-translate-y-1.5 group-hover:shadow-[0_22px_44px_-18px_hsl(var(--primary)/0.45)]",
        )}
      >
        <button
          type="button"
          onClick={() => onOpen?.(product)}
          className="absolute inset-0 block w-full focus-visible:outline-offset-[-3px]"
          aria-label={`View ${product.name}`}
        >
          <img
            src={optimizeImage(product.image, 640)}
            alt={product.name}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            draggable="false"
            onError={handleImageError}
            className={cn(
              "absolute inset-0 size-full object-cover transition-[transform,opacity] duration-[900ms] ease-[var(--ease-out-expo)]",
              "group-hover:scale-[1.08] group-hover:rotate-[0.6deg]",
              hoverImage && "group-hover:opacity-0",
              soldOut && "grayscale-[60%] opacity-80",
            )}
          />
          {hoverImage && (
            <img
              src={optimizeImage(hoverImage, 640)}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              draggable="false"
              className="absolute inset-0 size-full scale-105 object-cover opacity-0 transition-[transform,opacity] duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-100 group-hover:opacity-100"
            />
          )}
        </button>

        {label && (
          <span
            className={cn(
              "chip pointer-events-none absolute left-3 top-3 shadow-soft",
              !soldOut && "animate-bounce-slow",
              labelTone[label.tone],
            )}
          >
            {label.text}
          </span>
        )}

        {/* Wishlist + quick view — slide in on hover (always visible on touch) */}
        {(onToggleWishlist || onQuickView) && (
          <div
            className={cn(
              "absolute right-3 top-3 flex flex-col gap-2 transition-all duration-300",
              canHover && !isWishlisted && "translate-x-3 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
            )}
          >
            {onToggleWishlist && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWishlist(product);
                }}
                aria-pressed={isWishlisted}
                aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
                className="inline-flex size-9 items-center justify-center rounded-full bg-card/90 shadow-soft backdrop-blur transition-transform duration-300 hover:scale-110 active:scale-95"
              >
                <Heart
                  size={16}
                  className={cn("transition-colors", isWishlisted ? "fill-danger text-danger" : "text-foreground/70")}
                />
              </button>
            )}
            {onQuickView && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickView(product);
                }}
                aria-label={`Quick view ${product.name}`}
                className="hidden size-9 items-center justify-center rounded-full bg-card/90 shadow-soft backdrop-blur transition-transform duration-300 hover:scale-110 active:scale-95 md:inline-flex"
              >
                <Eye size={16} className="text-foreground/70" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-0.5 pt-3.5">
        {product.category && (
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {formatCategory(product.category)}
          </p>
        )}
        <h3 className="mt-1 text-[0.9375rem] font-semibold leading-snug text-foreground line-clamp-2">
          <button type="button" onClick={() => onOpen?.(product)} className="text-left transition-colors hover:text-primary">
            {product.name}
          </button>
        </h3>

        {reviewStats?.count > 0 && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Stars rating={reviewStats.average} size={12} />
            <span>({reviewStats.count})</span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2.5">
          <span className="text-base font-bold tracking-tight text-foreground sm:text-[1.0625rem]">
            {formatPrice(product.price)}
          </span>
          {onAddToCart && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              disabled={soldOut}
              aria-label={soldOut ? `${product.name} is sold out` : `Add ${product.name} to cart`}
              title={soldOut ? "Sold out" : "Add to cart"}
              className="btn btn-soft h-9 gap-1.5 !px-3 text-xs"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span className="hidden min-[400px]:inline">{soldOut ? "Sold out" : "Add"}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export const ProductCardSkeleton = () => (
  <div className="flex flex-col" aria-hidden="true">
    <div className="skeleton aspect-[4/5] rounded-2xl" />
    <div className="skeleton mt-4 h-3 w-1/3" />
    <div className="skeleton mt-2 h-4 w-4/5" />
    <div className="mt-4 flex items-center justify-between">
      <div className="skeleton h-5 w-1/3" />
      <div className="skeleton h-9 w-16 rounded-full" />
    </div>
  </div>
);
