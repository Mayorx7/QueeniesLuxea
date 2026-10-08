import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { SlidersHorizontal, SearchX } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import ProductGrid from "../components/ProductGrid";
import ProductFilters from "../components/ProductFilters";
import FilterDrawer from "../components/FilterDrawer";
import SortDropdown from "../components/SortDropdown";
import EmptyState from "../components/EmptyState";
import { useProductListing } from "../hooks/useProductListing";
import type { ProductCategory } from "../types";
import { ALL_CATEGORIES } from "../components/ProductFilters";

const CATEGORY_BLURBS: Record<ProductCategory, string> = {
  Dresses: "Signature silhouettes for the moments that matter, cut to move.",
  Tops: "Layering pieces built from natural fibers that earn their keep.",
  Handbags: "Structured leather goods, made to be carried for years.",
  Jewelry: "Fine gold-vermeil pieces for daily wear and evening alike.",
  Shoes: "Heels and flats built on a foundation of real craftsmanship.",
  Beauty: "Small rituals in fragrance and skincare, composed with intention.",
  Accessories: "The finishing details — scarves, eyewear, and beyond.",
};

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const matchedCategory = ALL_CATEGORIES.find(
    (c) => c.toLowerCase() === category?.toLowerCase()
  );

  const {
    products,
    totalCount,
    hasMore,
    loadMore,
    filters,
    setFilters,
    resetFilters,
    sort,
    setSort,
    maxPrice,
    loading,
    error,
  } = useProductListing(matchedCategory);

  if (!matchedCategory) {
    return <Navigate to="/shop" replace />;
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <Breadcrumbs
        items={[{ label: "Home", to: "/" }, { label: "Shop", to: "/shop" }, { label: matchedCategory }]}
      />

      <div className="mb-10 max-w-2xl">
        <h1 className="font-display text-4xl text-ink sm:text-5xl">{matchedCategory}</h1>
        <p className="mt-3 text-sm text-espresso-light">{CATEGORY_BLURBS[matchedCategory]}</p>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-28">
            <ProductFilters
              filters={filters}
              onChange={setFilters}
              maxPrice={maxPrice}
              availableCategories={[matchedCategory]}
            />
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="eyebrow inline-flex items-center gap-2 text-espresso lg:hidden"
            >
              <SlidersHorizontal size={15} /> Filter
            </button>
            <p className="hidden text-sm text-espresso-light lg:block">
              {totalCount} {totalCount === 1 ? "product" : "products"}
            </p>
            <SortDropdown value={sort} onChange={setSort} />
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] rounded-lg bg-cream"></div>
                  <div className="mt-4 h-4 w-2/3 rounded bg-cream"></div>
                  <div className="mt-2 h-3 w-1/2 rounded bg-cream"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl bg-red-50 text-red-600">
              <p className="font-medium">{error}</p>
              <button onClick={() => window.location.reload()} className="text-sm underline">Retry</button>
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No products match"
              message="Try widening your filters within this category."
              action={
                <button type="button" onClick={resetFilters} className="eyebrow link-underline text-espresso">
                  Clear all filters
                </button>
              }
            />
          ) : (
            <>
              <ProductGrid products={products} />
              {hasMore && (
                <div className="mt-14 flex justify-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    className="border border-espresso/30 px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-espresso transition-colors hover:border-espresso"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onChange={setFilters}
        maxPrice={maxPrice}
        availableCategories={[matchedCategory]}
        resultCount={totalCount}
      />
    </div>
  );
}
