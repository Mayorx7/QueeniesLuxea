import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Star } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import ImageGallery from "../components/ImageGallery";
import QuantitySelector from "../components/QuantitySelector";
import WishlistButton from "../components/WishlistButton";
import Accordion from "../components/Accordion";
import ProductGrid from "../components/ProductGrid";
import SectionHeading from "../components/SectionHeading";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";
import { supabase } from "../lib/supabase";
import { mapDbRow } from "../hooks/useProductListing";
import type { ColorEntry } from "../hooks/useProductListing";
import { getProductBySlug, PRODUCTS } from "../data/products";
import type { Product } from "../types";

// A small type for variants
interface DbVariant {
  id: string;
  color: string;
  size: string;
  stock: number;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>(); // ID is the slug in our case
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [colorEntries, setColorEntries] = useState<ColorEntry[]>([]);
  const [colorImages, setColorImages] = useState<Record<string, string[]>>({});
  const [variants, setVariants] = useState<DbVariant[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loadedId, setLoadedId] = useState<string | undefined>(id);

  // Fetch product — tries Supabase first, falls back to static data (for demo/legacy slugs)
  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      let mapped: Product | null = null;
      let dbVariants: DbVariant[] = [];

      // ── Try Supabase: UUID → slug → id fallback ──────────────────
      if (supabase) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        const selectFields = `
          id, vendor_id, name, slug, description, category, price, compare_at_price,
          sale_enabled, tags, sizes, colors, status, is_featured, created_at, sku,
          product_images ( url, display_order, color_name ),
          product_variants ( id, label, stock )
        `;

        let dbData: Record<string, unknown> | null = null;

        // 1. Try by UUID first (fastest, unambiguous)
        if (isUuid) {
          const { data, error: err } = await supabase
            .from("products")
            .select(selectFields)
            .eq("id", id)
            .maybeSingle();
          if (err) console.error("[ProductDetail] UUID lookup error:", err.message);
          if (!err && data) dbData = data as Record<string, unknown>;
        }

        // 2. Try by slug — use .limit(1) NOT .maybeSingle() to avoid
        //    PGRST116 errors when two products share the same slug.
        if (!dbData) {
          const { data, error: err } = await supabase
            .from("products")
            .select(selectFields)
            .eq("slug", id)
            .limit(1);
          if (err) console.error("[ProductDetail] Slug lookup error:", err.message);
          const rows = (data ?? []) as Record<string, unknown>[];
          if (!err && rows.length > 0) dbData = rows[0];
        }

        // 3. Last resort: try by id even if it doesn't look like a UUID
        if (!dbData && !isUuid) {
          const { data, error: err } = await supabase
            .from("products")
            .select(selectFields)
            .eq("id", id)
            .maybeSingle();
          if (err) console.error("[ProductDetail] ID fallback error:", err.message);
          if (!err && data) dbData = data as Record<string, unknown>;
        }

        if (dbData) {
          mapped = mapDbRow(dbData);
          const entries = (dbData.__colorEntries as ColorEntry[]) ?? [];
          setColorEntries(entries);
          const colorImgs = (dbData.__colorImages as Record<string, string[]>) ?? {};
          setColorImages(colorImgs);

          const rawVariants = (dbData.product_variants as { id: string; label: string; stock: number }[]) ?? [];
          dbVariants = rawVariants.map((v) => {
            const parts = v.label.split(" / ");
            // If the product has NO sizes but HAS colors, the label is just the color name.
            if (mapped!.sizes.length === 0 && mapped!.colors.length > 0) {
              return {
                id: v.id,
                color: v.label,
                size: "",
                stock: v.stock ?? 0,
              };
            }
            return {
              id: v.id,
              color: parts[1] ?? "",
              size: parts[0] ?? "",
              stock: v.stock ?? 0,
            };
          });
          setVariants(dbVariants);
        } else {
          console.warn("[ProductDetail] No DB result for param:", id);
        }
      }

      // ── Fall back to static data (legacy slugs like "amara-silk-column-gown") ──
      if (!mapped) {
        const staticProduct = getProductBySlug(id);
        if (staticProduct) {
          mapped = staticProduct;
        }
      }

      if (!mapped) throw new Error("Product not found");

      setProduct(mapped);
      setLoadedId(id);

      // Set default selections
      if (mapped.colors.length > 0) setColor(mapped.colors[0]);
      if (mapped.sizes.length > 0) setSize(mapped.sizes[0]);
      setQuantity(1);

      // ── Fetch related products ────────────────────────────────────
      if (supabase) {
        const { data: relData } = await supabase
          .from("products")
          .select(`
            id, vendor_id, name, slug, description, category, price, compare_at_price,
            sale_enabled, tags, sizes, colors, status, is_featured, created_at, sku,
            product_images ( url, display_order ),
            product_variants ( id, stock )
          `)
          .eq("status", "published")
          .eq("category", mapped.category)
          .neq("id", mapped.id)
          .limit(4);

        if (relData && (relData as Record<string, unknown>[]).length > 0) {
          setRelated((relData as Record<string, unknown>[]).map(mapDbRow));
        } else {
          // Fall back to related static products when DB is empty
          const staticRelated = PRODUCTS.filter(
            (p) => p.id !== mapped!.id && p.category === mapped!.category
          ).slice(0, 4);
          setRelated(staticRelated);
        }
      } else {
        // No Supabase — use static related products
        const staticRelated = PRODUCTS.filter(
          (p) => p.id !== mapped!.id && p.category === mapped!.category
        ).slice(0, 4);
        setRelated(staticRelated);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    if (loadedId === id) window.scrollTo({ top: 0 });
  }, [loadedId, id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 animate-pulse">
        <div className="h-4 w-64 bg-cream rounded mb-10"></div>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="aspect-[3/4] bg-cream rounded-xl"></div>
          <div className="space-y-6 lg:max-w-md">
            <div className="h-10 w-3/4 bg-cream rounded"></div>
            <div className="h-6 w-1/4 bg-cream rounded"></div>
            <div className="h-32 w-full bg-cream rounded mt-10"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
        <p className="text-xl font-display text-ink">{error || "Product not found"}</p>
        <Link to="/shop" className="text-sm font-semibold text-espresso underline">Return to Shop</Link>
      </div>
    );
  }

  // Build the effective color → images map.
  // Priority 1: explicit DB tags (color_name on each image row).
  // Priority 2: auto-map by position when image count == color count
  //             (e.g. 3 images + 3 colors → image[0] = color[0], etc.)
  // Priority 3: fall back to all images (untagged / single-color product).
  const hasExplicitTags = Object.keys(colorImages).length > 0;
  const canAutoMap =
    !hasExplicitTags &&
    product.colors.length > 0 &&
    product.images.length === product.colors.length;

  let effectiveColorImages: Record<string, string[]> = colorImages;
  if (canAutoMap) {
    effectiveColorImages = {};
    product.colors.forEach((c, i) => {
      effectiveColorImages[c] = [product.images[i]];
    });
  }

  const colorImageList =
    color && effectiveColorImages[color]?.length > 0
      ? effectiveColorImages[color]
      : product.images;


  // Find the exact variant matching the selected color and size
  const selectedVariant = variants.find(
    (v) =>
      (product.colors.length === 0 || v.color === color) &&
      (product.sizes.length === 0 || v.size === size)
  );

  // Use variant stock if variants exist, otherwise fall back to product.inStock
  const isVariantInStock = variants.length > 0 
    ? (selectedVariant?.stock ?? 0) > 0 
    : product.inStock;

  const handleAddToBag = () => {
    addItem(product, color, size, quantity, selectedVariant?.id);
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
        <ImageGallery key={color} images={colorImageList} productName={product.name} />

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

          <div className="mt-8 space-y-6">
            {product.colors.length > 0 && (
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-ink">Color</h3>
                  <span className="text-sm text-espresso-light">{color}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.colors.map((c) => {
                    // Find matching entry for hex value; fall back to name as CSS color
                    const entry = colorEntries.find((e) => e.name === c);
                    const bgColor = entry?.hex ?? c.toLowerCase().replace(/\s+/g, "");
                    return (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`h-10 w-10 rounded-full border-2 transition-all ${
                          color === c ? "border-gold p-1" : "border-transparent hover:border-line"
                        }`}
                        aria-label={`Select color ${c}`}
                        aria-pressed={color === c}
                        title={c}
                      >
                        <span
                          className="block h-full w-full rounded-full border border-line/50"
                          style={{ backgroundColor: bgColor }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {product.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-ink">Size</h3>
                  <button className="text-xs text-espresso underline transition-colors hover:text-ink">
                    Size Guide
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`flex h-12 items-center justify-center rounded-lg border text-sm transition-all ${
                        size === s
                          ? "border-gold bg-gold/5 font-semibold text-ink"
                          : "border-line text-espresso hover:border-espresso"
                      }`}
                      aria-label={`Select size ${s}`}
                      aria-pressed={size === s}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="mb-3 text-sm font-semibold text-ink">Quantity</h3>
              <QuantitySelector quantity={quantity} onChange={setQuantity} min={1} max={10} />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={handleAddToBag}
                disabled={!isVariantInStock}
                className="flex-1 bg-ink py-4 text-sm font-semibold uppercase tracking-wider text-ivory transition-colors hover:bg-espresso disabled:opacity-50"
              >
                {isVariantInStock ? "Add to Bag" : "Out of Stock"}
              </button>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-line bg-transparent">
                <WishlistButton product={product} />
              </div>
            </div>

            <Accordion
              items={[
                {
                  title: "Description",
                  content: <p className="text-sm leading-relaxed text-espresso">{product.description}</p>,
                },
                {
                  title: "Details & Care",
                  content: (
                    <ul className="list-inside list-disc space-y-1.5 text-sm text-espresso">
                      {(product.details?.length > 0 ? product.details : ["Dry clean recommended", "Handle with care"]).map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  ),
                },
                {
                  title: "Shipping & Returns",
                  content: (
                    <div className="space-y-3 text-sm text-espresso">
                      <p>
                        <strong>Standard Shipping:</strong> Complimentary on all orders.
                        Delivery in 5-8 business days.
                      </p>
                      <p>
                        <strong>Express Shipping:</strong> {formatPrice(14)}. Delivery
                        in 2-3 business days.
                      </p>
                      <p>
                        <strong>Returns:</strong> We accept returns in original
                        condition within 14 days of delivery.
                      </p>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-line pt-20">
          <SectionHeading eyebrow="More to Explore" title="You May Also Like" />
          <div className="mt-10">
            <ProductGrid products={related} columns={4} />
          </div>
        </section>
      )}
    </div>
  );
}
