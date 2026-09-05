import type { Product } from "../types";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
}

export default function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  const colClass =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <div className={`grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-10 ${colClass}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
