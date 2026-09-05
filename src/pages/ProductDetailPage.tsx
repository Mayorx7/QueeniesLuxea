import { useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { Star } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import ImageGallery from "../components/ImageGallery";
import QuantitySelector from "../components/QuantitySelector";
import WishlistButton from "../components/WishlistButton";
import Accordion from "../components/Accordion";
import ProductGrid from "../components/ProductGrid";
import SectionHeading from "../components/SectionHeading";
import { getProductBySlug, getRelatedProducts } from "../data/products";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const product = id ? getProductBySlug(id) : undefined;
  const { addItem } = useCart();

  const [color, setColor] = useState(product?.colors[0] ?? "");
  const [size, setSize] = useState(product?.sizes[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [loadedSlug, setLoadedSlug] = useState(product?.slug);

  // Reset option selectors during render when navigating to a different
  // product (e.g. via the related-products grid), rather than in an effect.
  if (product && product.slug !== loadedSlug) {
    setLoadedSlug(product.slug);
    setColor(product.colors[0]);
    setSize(product.sizes[0]);
    setQuantity(1);
  }

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [loadedSlug]);

  if (!product) {
    return <Navigate to="/shop" replace />;
  }

  const related = getRelatedProducts(product);

  const handleAddToBag = () => {
    addItem(product, color, size, quantity);
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Shop", to: "/shop" },
          { label: product.category, to: `/shop/${product.category}` },
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <ImageGallery images={product.images} productName={product.name} />

        <div className="lg:max-w-md">
          <p className="eyebrow text-gold">{product.category}</p>
          <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1 text-gold" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className={i < Math.round(product.rating) ? "fill-gold" : ""} />
              ))}
            </div>
            <span className="text-xs text-espresso-light">
              {product.rating.toFixed(1)} ({product.reviewCount} reviews)
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3 text-lg">
            <span>{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-base text-espresso-light/70 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p className="mt-6 text-sm leading-relaxed text-espresso-light">{product.description}</p>

          {!product.inStock && (
            <p className="mt-4 eyebrow text-espresso-light">Currently sold out</p>
          )}

          {/* Color selector */}
          <div className="mt-8">
            <p className="eyebrow mb-3 text-ink">Color — {color}</p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-pressed={color === c}
                  className={`border px-4 py-2 text-xs transition-colors ${
                    color === c ? "border-espresso bg-espresso text-ivory" : "border-espresso/30 text-espresso-light"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="eyebrow text-ink">Size — {size}</p>
              <button type="button" className="text-xs text-espresso-light underline underline-offset-2 hover:text-ink">
                Size guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  aria-pressed={size === s}
                  className={`h-11 min-w-11 border px-3 text-xs transition-colors ${
                    size === s ? "border-espresso bg-espresso text-ivory" : "border-espresso/30 text-espresso-light"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mt-6">
            <p className="eyebrow mb-3 text-ink">Quantity</p>
            <QuantitySelector quantity={quantity} onChange={setQuantity} />
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAddToBag}
              disabled={!product.inStock}
              className="flex-1 bg-ink py-4 text-xs font-semibold uppercase tracking-wider text-ivory transition-colors hover:bg-espresso disabled:cursor-not-allowed disabled:bg-espresso/30"
            >
              {product.inStock ? "Add to Bag" : "Sold Out"}
            </button>
            <WishlistButton product={product} variant="inline" />
          </div>

          {/* Accordions */}
          <div className="mt-12">
            <Accordion
              items={[
                {
                  title: "Product Details",
                  content: (
                    <ul className="flex flex-col gap-1.5">
                      {product.details.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  ),
                },
                {
                  title: "Shipping & Returns",
                  content: (
                    <p>
                      Complimentary standard shipping on orders over $150. Orders ship within 2–3 business days.
                      Returns are accepted within 30 days of delivery in original, unworn condition.
                    </p>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <SectionHeading eyebrow="Complete the Look" title="You May Also Like" align="center" />
          <div className="mt-10">
            <ProductGrid products={related} columns={4} />
          </div>
        </section>
      )}

      <div className="mt-16 text-center">
        <Link to="/shop" className="eyebrow link-underline text-espresso">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
