import { Link, useParams } from "react-router-dom";
import { CATEGORIES } from "../data/products";
import type { ProductCategory } from "../types";

// Category icons (emoji-based for zero dependency cost)
const CATEGORY_ICONS: Record<ProductCategory | string, string> = {
  Dresses: "👗",
  Tops: "👚",
  Handbags: "👜",
  Jewelry: "💎",
  Shoes: "👠",
  Beauty: "✨",
  Accessories: "🧣",
};

interface MobileCategoryScrollProps {
  activeCategory?: ProductCategory | string;
}

export default function MobileCategoryScroll({
  activeCategory,
}: MobileCategoryScrollProps) {
  const params = useParams<{ category?: string }>();
  const currentCategory = activeCategory ?? params.category;

  // Include "All" as the first item
  const allItem = { name: "All", blurb: "Browse everything", image: "" };
  const items = [allItem, ...CATEGORIES];

  return (
    <section aria-label="Browse categories" className="md:hidden">
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <p className="eyebrow text-[0.68rem] text-[var(--color-espresso)]">
          Categories
        </p>
        <Link
          to="/shop"
          className="eyebrow text-[0.62rem] text-[var(--color-gold)] underline-offset-2 hover:underline"
        >
          View all
        </Link>
      </div>
      <div
        className="scrollbar-none flex gap-2.5 overflow-x-auto px-4 pb-3"
        role="list"
      >
        {items.map((cat) => {
          const isActive =
            cat.name === "All"
              ? !currentCategory
              : currentCategory === cat.name;
          const href =
            cat.name === "All" ? "/shop" : `/shop/${cat.name}`;
          return (
            <Link
              key={cat.name}
              to={href}
              role="listitem"
              className={`flex shrink-0 flex-col items-center gap-1.5 rounded-2xl border px-4 py-2.5 transition-all ${
                isActive
                  ? "border-[var(--color-gold)] bg-[var(--color-espresso)] text-[var(--color-ivory)]"
                  : "border-[var(--color-line)] bg-[var(--color-cream)] text-[var(--color-espresso)]"
              }`}
            >
              <span
                className="text-xl leading-none"
                aria-hidden="true"
              >
                {CATEGORY_ICONS[cat.name] ?? "🛍️"}
              </span>
              <span className="eyebrow text-[0.6rem]">{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
