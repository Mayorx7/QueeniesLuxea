import type { ProductCategory, ProductFilterState } from "../types";
import { formatPrice } from "../utils/format";

const ALL_CATEGORIES: ProductCategory[] = [
  "Dresses",
  "Tops",
  "Handbags",
  "Jewelry",
  "Shoes",
  "Beauty",
  "Accessories",
];

const ALL_COLORS = [
  "Black",
  "Ivory",
  "Espresso",
  "Champagne",
  "Deep Merlot",
  "Gold",
];

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "One Size"];

interface ProductFiltersProps {
  filters: ProductFilterState;
  onChange: (filters: ProductFilterState) => void;
  maxPrice: number;
  availableCategories?: ProductCategory[];
}

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function ProductFilters({
  filters,
  onChange,
  maxPrice,
  availableCategories = ALL_CATEGORIES,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col gap-8">
      <fieldset>
        <legend className="eyebrow mb-3 text-ink">Category</legend>
        <div className="flex flex-col gap-2.5">
          {availableCategories.map((cat) => (
            <label key={cat} className="flex items-center gap-2.5 text-sm text-espresso-light">
              <input
                type="checkbox"
                checked={filters.categories.includes(cat)}
                onChange={() =>
                  onChange({ ...filters, categories: toggleValue(filters.categories, cat) })
                }
                className="h-4 w-4 accent-espresso"
              />
              {cat}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-3 text-ink">Color</legend>
        <div className="flex flex-wrap gap-2">
          {ALL_COLORS.map((color) => {
            const active = filters.colors.includes(color);
            return (
              <button
                key={color}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ ...filters, colors: toggleValue(filters.colors, color) })}
                className={`border px-3 py-1.5 text-xs transition-colors ${
                  active ? "border-espresso bg-espresso text-ivory" : "border-espresso/30 text-espresso-light"
                }`}
              >
                {color}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-3 text-ink">Size</legend>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((size) => {
            const active = filters.sizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ ...filters, sizes: toggleValue(filters.sizes, size) })}
                className={`h-9 min-w-9 border px-2 text-xs transition-colors ${
                  active ? "border-espresso bg-espresso text-ivory" : "border-espresso/30 text-espresso-light"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-3 text-ink">Price</legend>
        <label htmlFor="price-range" className="sr-only">
          Maximum price
        </label>
        <input
          id="price-range"
          type="range"
          min={0}
          max={maxPrice}
          step={10}
          value={filters.priceMax}
          onChange={(e) => onChange({ ...filters, priceMax: Number(e.target.value) })}
          className="w-full accent-gold"
        />
        <p className="mt-2 text-sm text-espresso-light">Up to {formatPrice(filters.priceMax)}</p>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-3 text-ink">Availability</legend>
        <label className="flex items-center gap-2.5 text-sm text-espresso-light">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={() => onChange({ ...filters, inStockOnly: !filters.inStockOnly })}
            className="h-4 w-4 accent-espresso"
          />
          In stock only
        </label>
      </fieldset>
    </div>
  );
}

export { ALL_CATEGORIES };
