import { Link } from "react-router-dom";
import { Heart, X } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import SmartImage from "../components/SmartImage";
import EmptyState from "../components/EmptyState";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";

export default function WishlistPage() {
  const { products, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Wishlist" }]} />
      <h1 className="font-display text-4xl text-ink sm:text-5xl">Your Wishlist</h1>

      {products.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            message="Save the pieces you keep returning to, and they'll be waiting for you here."
            action={
              <Link to="/shop" className="eyebrow bg-ink px-6 py-3 text-ivory transition-colors hover:bg-espresso">
                Discover the Shop
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.id} className="group relative border border-line p-4">
              <button
                type="button"
                onClick={() => removeFromWishlist(product.id)}
                aria-label={`Remove ${product.name} from wishlist`}
                className="absolute right-6 top-6 z-10 text-espresso-light hover:text-ink"
              >
                <X size={18} />
              </button>
              <Link to={`/product/${product.slug}`} className="block aspect-[4/5] overflow-hidden bg-cream">
                <SmartImage
                  src={product.images[0]}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
              <div className="mt-4">
                <p className="eyebrow text-espresso-light">{product.category}</p>
                <Link to={`/product/${product.slug}`} className="font-display text-base link-underline">
                  {product.name}
                </Link>
                <p className="mt-1 text-sm">{formatPrice(product.price)}</p>
              </div>
              <button
                type="button"
                disabled={!product.inStock}
                onClick={() => addItem(product, product.colors[0], product.sizes[0])}
                className="mt-4 w-full border border-espresso py-3 text-xs font-semibold uppercase tracking-wider text-espresso transition-colors hover:bg-espresso hover:text-ivory disabled:cursor-not-allowed disabled:opacity-40"
              >
                {product.inStock ? "Add to Bag" : "Sold Out"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
