import { useState } from "react";
import { Link } from "react-router-dom";
import { SlidersHorizontal, SearchX, ArrowLeft } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import ProductGrid from "../components/ProductGrid";
import ProductFilters from "../components/ProductFilters";
import FilterDrawer from "../components/FilterDrawer";
import SortDropdown from "../components/SortDropdown";
import EmptyState from "../components/EmptyState";
import { useProductListing } from "../hooks/useProductListing";

export default function SearchResultsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const {
    products,
    totalCount,
    hasMore,
    loadMore,
    filters,
    setFilters,
    sort,
    setSort,
    maxPrice,
    search,
    loading,
    error,
  } = useProductListing();

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Search" },
        ]}
      />

      <div className="mb-10 max-w-2xl">
        <h1 className="font-display text-4xl text-ink sm:text-5xl">
          {search ? (
            <>
              Results for{" "}
              <em className="not-italic text-gold">"{search}"</em>
            </>
          ) : (
            "Search"
          )}
        </h1>
        {search && (
          <p className="mt-3 text-sm text-espresso-light">
            {totalCount === 0
              ? "No products matched your search."
              : `${totalCount} ${totalCount === 1 ? "product" : "products"} found.`}
          </p>
        )}
      </div>

      {!search ? (
        <div className="flex flex-col items-center gap-6 border border-line px-6 py-24 text-center">
          <p className="font-display text-2xl text-ink">Enter a search term</p>
          <p className="max-w-sm text-sm text-espresso-light">
            Use the search icon in the header to find dresses, handbags,
            jewelry, and more from the QueensLuxea collection.
          </p>
          <Link
            to="/shop"
            className="eyebrow inline-flex items-center gap-2 link-underline text-espresso"
          >
            <ArrowLeft size={14} />
            Browse all products
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-10 lg:flex-row">
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-28">
              <ProductFilters
                filters={filters}
                onChange={setFilters}
                maxPrice={maxPrice}
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
                message="Try a different search term, or explore our full collection."
                action={
                  <Link
                    to="/shop"
                    className="eyebrow bg-ink px-6 py-3 text-ivory transition-colors hover:bg-espresso"
                  >
                    Shop All
                  </Link>
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
      )}

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
