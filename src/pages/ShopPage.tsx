import { useState } from "react";
import { SlidersHorizontal, SearchX } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import ProductGrid from "../components/ProductGrid";
import ProductFilters from "../components/ProductFilters";
import FilterDrawer from "../components/FilterDrawer";
import SortDropdown from "../components/SortDropdown";
import EmptyState from "../components/EmptyState";
import { useProductListing } from "../hooks/useProductListing";

export default function ShopPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
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
    search,
  } = useProductListing();

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Shop" }]} />

      <div className="mb-10 max-w-2xl">
        <h1 className="font-display text-4xl text-ink sm:text-5xl">
          {search ? `Results for "${search}"` : "Shop All"}
        </h1>
        <p className="mt-3 text-sm text-espresso-light">
          Considered pieces across dresses, handbags, jewelry, and more — each selected for how it wears, not just how it photographs.
        </p>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-28">
            <ProductFilters filters={filters} onChange={setFilters} maxPrice={maxPrice} />
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

          {products.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No products match"
              message="Try widening your filters or searching a different term."
              action={
                <button
                  type="button"
                  onClick={resetFilters}
                  className="eyebrow link-underline text-espresso"
                >
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
        resultCount={totalCount}
      />
    </div>
  );
}
