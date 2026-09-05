import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Product } from "../types";
import ProductCard from "./ProductCard";
import ProductGrid from "./ProductGrid";

interface HorizontalProductScrollProps {
  products: Product[];
  /** Section eyebrow label */
  eyebrow?: string;
  /** Section heading */
  title: string;
  /** Link shown on the right side of the heading */
  viewAllHref?: string;
  /** Number of columns on desktop (passed to ProductGrid) */
  desktopColumns?: 2 | 3 | 4;
}

/**
 * On mobile: renders a horizontal scroll strip of compact product cards.
 * On desktop: renders a standard ProductGrid.
 * This avoids duplicating product card markup.
 */
export default function HorizontalProductScroll({
  products,
  eyebrow,
  title,
  viewAllHref,
  desktopColumns = 4,
}: HorizontalProductScrollProps) {
  return (
    <section>
      {/* Section header */}
      <div className="flex items-end justify-between px-4 md:px-0 mb-4">
        <div>
          {eyebrow && (
            <p className="eyebrow mb-1 text-[var(--color-gold)]">{eyebrow}</p>
          )}
          <h2 className="font-display text-2xl text-[var(--color-ink)] md:text-3xl">
            {title}
          </h2>
        </div>
        {viewAllHref && (
          <Link
            to={viewAllHref}
            className="eyebrow inline-flex items-center gap-1 text-[0.68rem] text-[var(--color-espresso)] hover:text-[var(--color-gold)] transition-colors"
          >
            View all <ArrowRight size={12} />
          </Link>
        )}
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="md:hidden">
        <div className="scrollbar-none snap-x-mandatory flex gap-3 overflow-x-auto px-4 pb-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="snap-start w-44 shrink-0 sm:w-52"
            >
              <ProductCard product={product} compact />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: standard grid */}
      <div className="hidden md:block">
        <ProductGrid products={products} columns={desktopColumns} />
      </div>
    </section>
  );
}
