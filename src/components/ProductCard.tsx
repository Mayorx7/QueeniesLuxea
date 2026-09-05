import { Link } from "react-router-dom";
import { Plus, Star } from "lucide-react";
import type { Product } from "../types";
import SmartImage from "./SmartImage";
import WishlistButton from "./WishlistButton";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";

interface ProductCardProps {
  product: Product;
  /** Compact mode for horizontal scroll strips (narrower cards, smaller text) */
  compact?: boolean;
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  const { addItem } = useCart();

  const handleQuickAdd = () => {
    addItem(product, product.colors[0], product.sizes[0]);
  };

  return (
    <div className="group relative flex flex-col">
      <Link to={`/product/${product.slug}`} className="relative block overflow-hidden bg-[var(--color-cream)]">
        <div className={`w-full overflow-hidden ${compact ? "aspect-[3/4]" : "aspect-[4/5]"}`}>
          <SmartImage
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>

        {/* Badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1">
          {product.isNew && (
            <span className="eyebrow bg-[var(--color-ink)] px-2 py-0.5 text-[0.6rem] text-[var(--color-ivory)]">
              New
            </span>
          )}
          {product.compareAtPrice && (
            <span className="eyebrow bg-[var(--color-gold)] px-2 py-0.5 text-[0.6rem] text-[var(--color-ivory)]">
              Sale
            </span>
          )}
          {!product.inStock && (
            <span className="eyebrow bg-[var(--color-ivory)]/90 px-2 py-0.5 text-[0.6rem] text-[var(--color-espresso)]">
              Sold out
            </span>
          )}
        </div>

        {/* Wishlist button — always visible, min 44×44 tap target */}
        <div className="absolute right-2 top-2">
          <WishlistButton product={product} />
        </div>

        {/* Quick-add — visible on hover (desktop) + always visible on mobile */}
        {product.inStock && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleQuickAdd();
            }}
            className={`absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-ink)] text-[var(--color-ivory)] shadow-sm transition-all duration-300
              opacity-100 translate-y-0
              md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:focus-visible:translate-y-0 md:focus-visible:opacity-100`}
            aria-label={`Quick add ${product.name} to bag`}
          >
            <Plus size={16} />
          </button>
        )}
      </Link>

      {/* Product info */}
      <Link to={`/product/${product.slug}`} className="mt-2.5">
        <p className={`eyebrow text-[var(--color-espresso-light)] ${compact ? "text-[0.58rem]" : ""}`}>
          {product.category}
        </p>
        <h3
          className={`mt-0.5 font-display text-[var(--color-ink)] link-underline ${
            compact ? "text-sm line-clamp-2 leading-snug" : "text-base"
          }`}
        >
          {product.name}
        </h3>
        <div className={`mt-1 flex items-center gap-2 ${compact ? "text-xs" : "text-sm"}`}>
          <span className="font-medium">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-[var(--color-espresso-light)]/70 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
        {/* Rating — shown in both modes */}
        <div className="mt-1 flex items-center gap-1">
          <Star
            size={11}
            className="fill-[var(--color-gold)] text-[var(--color-gold)]"
            aria-hidden="true"
          />
          <span className="text-[0.68rem] text-[var(--color-espresso-light)]">
            {product.rating.toFixed(1)}
            {!compact && (
              <span className="ml-0.5">({product.reviewCount})</span>
            )}
          </span>
        </div>
      </Link>
    </div>
  );
}
