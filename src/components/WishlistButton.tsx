import { Heart } from "lucide-react";
import type { Product } from "../types";
import { useWishlist } from "../context/WishlistContext";

interface WishlistButtonProps {
  product: Product;
  variant?: "floating" | "inline";
}

export default function WishlistButton({ product, variant = "floating" }: WishlistButtonProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const active = isWishlisted(product.id);

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={() => toggleWishlist(product)}
        aria-pressed={active}
        className="inline-flex items-center gap-2 border border-espresso/30 px-5 py-3 text-xs font-semibold uppercase tracking-wider transition-colors hover:border-espresso"
      >
        <Heart size={16} className={active ? "fill-gold text-gold" : "text-espresso"} />
        {active ? "Saved to wishlist" : "Add to wishlist"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product);
      }}
      aria-pressed={active}
      aria-label={active ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-ivory/90 text-espresso shadow-sm backdrop-blur transition-transform hover:scale-105"
    >
      <Heart size={16} className={active ? "fill-gold text-gold" : ""} />
    </button>
  );
}
