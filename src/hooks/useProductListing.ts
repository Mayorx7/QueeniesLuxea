import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Product, ProductCategory, ProductFilterState, SortOption } from "../types";
import { PRODUCTS } from "../data/products";

const PAGE_SIZE = 8;
const MAX_PRICE = Math.ceil(Math.max(...PRODUCTS.map((p) => p.price)) / 10) * 10;

function emptyFilters(): ProductFilterState {
  return { categories: [], colors: [], sizes: [], priceMax: MAX_PRICE, inStockOnly: false };
}

export function useProductListing(fixedCategory?: ProductCategory) {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const isNewFilter = searchParams.get("filter") === "new";

  const [filters, setFilters] = useState<ProductFilterState>(emptyFilters());
  const [sort, setSort] = useState<SortOption>("featured");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered: Product[] = useMemo(() => {
    let list = PRODUCTS.slice();

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
  }, [fixedCategory, search, isNewFilter, filters, sort]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const resetFilters = () => {
    setFilters(emptyFilters());
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
    maxPrice: MAX_PRICE,
    search,
  };
}
