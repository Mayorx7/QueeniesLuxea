import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type { Product, ProductCategory, ProductFilterState, SortOption } from "../types";
import { supabase } from "../lib/supabase";
import { PRODUCTS } from "../data/products";

const PAGE_SIZE = 8;
const DEFAULT_MAX_PRICE = 500000;

function emptyFilters(): ProductFilterState {
  return { categories: [], colors: [], sizes: [], priceMax: DEFAULT_MAX_PRICE, inStockOnly: false };
}

// Check if a product is "new" (created in the last 30 days)
function isRecentlyCreated(isoStr: string) {
  const diff = Date.now() - new Date(isoStr).getTime();
  return diff < 30 * 24 * 60 * 60 * 1000;
}

/** Generate a URL-safe slug from a product name */
export function generateSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** A color entry as stored in the DB { id, name, hex } */
export interface ColorEntry { id: string; name: string; hex: string }

/** Map a raw Supabase product row to a Product object */
export function mapDbRow(row: Record<string, unknown>): Product {
  const rawImages = ((row.product_images as { url: string; display_order: number; color_name?: string | null }[]) ?? [])
    .sort((a, b) => a.display_order - b.display_order);

  const images = rawImages.map((img) => img.url);

  // Build a per-color image map: colorName -> url[]
  const colorImagesMap: Record<string, string[]> = {};
  for (const img of rawImages) {
    if (img.color_name) {
      if (!colorImagesMap[img.color_name]) colorImagesMap[img.color_name] = [];
      colorImagesMap[img.color_name].push(img.url);
    }
  }
  // Expose on the row so callers (ProductDetailPage) can read it
  (row as Record<string, unknown>).__colorImages = colorImagesMap;

  const totalStock = ((row.product_variants as { stock: number }[]) ?? []).reduce(
    (sum, v) => sum + (v.stock ?? 0),
    0
  );

  const rawColors = (row.colors as { name?: string; hex?: string }[] | string[]) ?? [];
  // Keep full {name, hex} entries so the UI can render real swatches.
  // For the Product.colors string[] field we store the name only (for filters etc.).
  const flatColors = rawColors.map((c) =>
    typeof c === "object" && c !== null ? (c.name ?? "") : String(c)
  );
  // Also expose the full color objects on the row so callers can access hex.
  (row as Record<string, unknown>).__colorEntries = rawColors
    .filter((c): c is { name: string; hex: string } => typeof c === "object" && c !== null)
    .map((c) => ({ id: (c as { id?: string }).id ?? c.name ?? "", name: c.name ?? "", hex: c.hex ?? c.name ?? "" }));

  const slug = (row.slug as string | null) || (row.id as string);

  return {
    id: row.id as string,
    vendorId: row.vendor_id as string,
    name: row.name as string,
    slug,
    category: row.category as ProductCategory,
    price: row.price as number,
    compareAtPrice: (row.compare_at_price as number | null) ?? undefined,
    description: (row.description as string) || "",
    details: [],
    colors: flatColors,
    sizes: (row.sizes as string[]) ?? [],
    images,
    rating: 4.8,
    reviewCount: 0,
    isNew: isRecentlyCreated((row.created_at as string) ?? ""),
    isFeatured: (row.is_featured as boolean) ?? false,
    inStock: totalStock > 0,
    tags: (row.tags as string[]) ?? [],
    sku: (row.sku as string | null) ?? undefined,
  };
}

export function useProductListing(fixedCategory?: ProductCategory) {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const isNewFilter = searchParams.get("filter") === "new";

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const [filters, setFilters] = useState<ProductFilterState>(emptyFilters());
  const [sort, setSort] = useState<SortOption>("featured");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);

  useEffect(() => {
    let mounted = true;

    async function fetchProducts() {
      // ── No Supabase client → use static fallback immediately
      if (!supabase) {
        if (mounted) {
          setAllProducts(PRODUCTS);
          setIsUsingFallback(true);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const { data, error: err } = await supabase
          .from("products")
          .select(`
            id, vendor_id, name, slug, description, category, price, compare_at_price,
            sale_enabled, tags, sizes, colors, status, is_featured, created_at, sku,
            product_images ( url, display_order ),
            product_variants ( id, stock )
          `)
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (err) throw err;

        if (mounted) {
          const rows = (data ?? []) as Record<string, unknown>[];

          // ── Empty DB → fall back to static demo products
          if (rows.length === 0) {
            setAllProducts(PRODUCTS);
            setIsUsingFallback(true);
          } else {
            const mapped = rows.map(mapDbRow);
            setAllProducts(mapped);
            setIsUsingFallback(false);

            // Update max price from real data
            const highest = Math.max(...mapped.map((p) => p.price));
            const newMax = Math.ceil(highest / 10000) * 10000;
            setMaxPrice(newMax);
            setFilters((prev) => ({ ...prev, priceMax: newMax }));
          }
        }
      } catch (err: unknown) {
        if (mounted) {
          // On error, surface static data so the page isn't blank
          setAllProducts(PRODUCTS);
          setIsUsingFallback(true);
          setError(err instanceof Error ? err.message : "Failed to load products");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchProducts();
    return () => { mounted = false; };
  }, []);

  const filtered: Product[] = useMemo(() => {
    let list = allProducts.slice();

    if (fixedCategory) {
      list = list.filter((p) => p.category === fixedCategory);
    }
    if (search) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search) ||
          p.tags.some((t) => t.toLowerCase().includes(search))
      );
    }
    if (isNewFilter) {
      list = list.filter((p) => p.isNew);
    }
    if (filters.categories.length > 0) {
      list = list.filter((p) => filters.categories.includes(p.category));
    }
    if (filters.colors.length > 0) {
      list = list.filter((p) => p.colors.some((c) => filters.colors.includes(c)));
    }
    if (filters.sizes.length > 0) {
      list = list.filter((p) => p.sizes.some((s) => filters.sizes.includes(s)));
    }
    list = list.filter((p) => p.price <= filters.priceMax);
    if (filters.inStockOnly) {
      list = list.filter((p) => p.inStock);
    }

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        list.sort((a, b) => Number(b.isNew) - Number(a.isNew));
        break;
      default:
        list.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    }

    return list;
  }, [allProducts, fixedCategory, search, isNewFilter, filters, sort]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const resetFilters = () => {
    setFilters({ ...emptyFilters(), priceMax: maxPrice });
    setVisibleCount(PAGE_SIZE);
  };

  const updateFilters = (next: ProductFilterState) => {
    setFilters(next);
    setVisibleCount(PAGE_SIZE);
  };

  const updateSort = (next: SortOption) => {
    setSort(next);
    setVisibleCount(PAGE_SIZE);
  };

  return {
    products: visible,
    totalCount: filtered.length,
    hasMore,
    loadMore: () => setVisibleCount((c) => c + PAGE_SIZE),
    filters,
    setFilters: updateFilters,
    resetFilters,
    sort,
    setSort: updateSort,
    maxPrice,
    search,
    loading,
    error,
    isUsingFallback,
  };
}
